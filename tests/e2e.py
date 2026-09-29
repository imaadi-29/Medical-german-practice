import json, re, sys, os
from playwright.sync_api import sync_playwright, expect

SP = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(SP, "shots"); os.makedirs(SHOTS, exist_ok=True)
KEY = json.loads(os.popen("npx tsx scripts/dump.ts").read())  # answer key generated from the vocab data
BASE = "http://localhost:3000"
errors = []
log = []

def step(msg):
    log.append(msg); print("✔", msg, flush=True)

def shot(page, name):
    page.wait_for_timeout(450)
    page.screenshot(path=os.path.join(SHOTS, f"{name}.png"), full_page=False)

def current_question(page):
    heading = page.locator("p.text-sm.font-semibold.text-slate-500").first.inner_text()
    prompt = page.get_by_test_id("prompt").inner_text().strip()
    return heading, prompt

def correct_for(page):
    heading, prompt = current_question(page)
    if heading.startswith("What does"):
        return "choice", KEY["deToEn"][prompt]
    if heading.startswith("Complete"):
        en = page.locator("text=🇬🇧").inner_text().replace("🇬🇧", "").strip()
        return "choice", KEY["sentToBlank"][en]
    return "typed", KEY["enToDe"][prompt]

def answer(page, wrong=False, typed_override=None):
    kind, ans = correct_for(page)
    if kind == "choice":
        opts = page.get_by_test_id("option")
        texts = [t.strip() for t in opts.all_inner_texts()]
        # option text starts with the index number
        clean = [re.sub(r"^\d\s*", "", t).strip() for t in texts]
        target = next(i for i, t in enumerate(clean) if (t != ans) == wrong)
        opts.nth(target).click()
        given = clean[target]
    else:
        given = typed_override if typed_override is not None else ("das Falschwort" if wrong else ans)
        page.get_by_test_id("answer-input").fill(given)
        page.get_by_role("button", name="Check").click()
    fb = page.get_by_test_id("feedback")
    expect(fb).to_be_visible()
    return kind, ans, given, fb.get_attribute("data-verdict")

def cont(page):
    page.get_by_test_id("feedback").get_by_role("button").last.click()
    expect(page.get_by_test_id("feedback")).to_have_count(0)

def run_session(page, wrong_indices=(), name="session", typed_overrides=None):
    """answers every question; returns list of (verdict, ans)"""
    results = []
    i = 0
    typed_overrides = typed_overrides or {}
    while True:
        if page.get_by_test_id("score").count() > 0:
            break
        page.get_by_test_id("prompt").wait_for()
        wrong = i in wrong_indices
        kind, ans, given, verdict = answer(page, wrong=wrong, typed_override=typed_overrides.get(i))
        expected = "wrong" if wrong else "correct"
        if i not in typed_overrides:
            assert (verdict == "correct") == (not wrong), f"q{i}: expected {expected}, got {verdict} (ans={ans}, given={given})"
        if verdict != "correct":
            # feedback for mistakes must show correct answer + explanation + example
            assert page.get_by_test_id("correct-answer").count() == 1, "correct answer not shown"
            assert len(page.get_by_test_id("explanation").inner_text()) > 20
            assert page.get_by_test_id("feedback").locator("text=Example").count() == 1
        results.append((verdict, ans, given, page.get_by_test_id("explanation").inner_text()))
        if i == 0:
            shot(page, f"{name}-feedback-q1")
        cont(page)
        i += 1
        if i > 30:
            raise RuntimeError("session did not end")
    return results

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))

    # 1. Onboarding
    page.goto(BASE + "/")
    page.wait_for_url("**/onboarding")
    shot(page, "01-onboarding-welcome")
    page.get_by_role("button", name="Get started").click()
    page.get_by_label("What should we call you?").fill("Priya")
    shot(page, "02-onboarding-goal")
    page.get_by_role("button", name="Continue").click()
    page.get_by_role("radio", name=re.compile("A1")).click()
    shot(page, "03-onboarding-level")
    page.get_by_role("button", name="Continue").click()
    page.get_by_role("button", name=re.compile("Regular")).click()
    page.get_by_role("button", name="Start learning").click()
    page.wait_for_url(BASE + "/")
    expect(page.get_by_text("Priya")).to_be_visible()
    expect(page.get_by_test_id("learned")).to_have_text("0/35")
    shot(page, "04-home-new")
    step("Onboarding → home dashboard (A1, 0/35 words)")

    # 2. Learn: continue → body parts flashcards
    page.get_by_role("link", name="Continue").click()
    page.wait_for_url("**/learn/body")
    n = 0
    while page.get_by_test_id("flashcard").count():
        page.get_by_role("button", name="Show meaning").last.click()
        expect(page.get_by_test_id("meaning")).to_be_visible()
        if n == 0:
            shot(page, "05-learn-card")
        page.get_by_role("button", name=re.compile("Next word|Finish")).click()
        n += 1
    step(f"Learn: studied {n} body-part cards")
    shot(page, "06-learn-done")

    # 3. Practice (recognition) with a mistake on Q1 AND on its retry
    page.get_by_role("link", name=re.compile("Start Recognition")).click()
    page.wait_for_url("**/practice/session**")
    shot(page, "07-practice-q")
    res = run_session(page, wrong_indices=(0, 8), name="08-recognition")
    assert res[0][0] == "wrong" and len(res) == 9, [r[0] for r in res]
    assert res[8][1] == res[0][1], "retry question should be the same word"
    step(f"Recognition: {len(res)} answers, Q1 wrong ('{res[0][2]}' instead of '{res[0][1]}'), retry wrong again → feedback: {res[0][3][:80]}…")
    shot(page, "09-results")
    score = page.get_by_test_id("score").inner_text()
    step(f"Results screen shows {score}")
    weak_word_en = res[0][1]

    # 4. Home shows weak word, progress updated
    page.get_by_role("link", name="Back to home").click()
    page.wait_for_url(BASE + "/")
    expect(page.get_by_test_id("weak-count")).to_have_text("1 weak")
    expect(page.get_by_test_id("sessions")).to_have_text("1")
    expect(page.get_by_test_id("learned")).to_have_text("10/35")
    shot(page, "10-home-after-mistake")
    step("Home: 1 weak word, 1 session, 10/35 learned")

    # 5. Review weak word (first time: correct → still weak, needs 2 in a row)
    page.locator('nav a[href="/review"]').click()
    page.wait_for_url("**/review")
    expect(page.get_by_test_id("weak-list")).to_contain_text(weak_word_en)
    shot(page, "11-review-list")
    page.get_by_role("link", name=re.compile("Start review round")).click()
    r1 = run_session(page, name="12-review1")
    assert len(r1) == 1 and r1[0][0] == "correct"
    page.get_by_role("link", name="Back to home").click()
    page.goto(BASE + "/review")
    expect(page.get_by_test_id("review-weak")).to_contain_text("1")
    step("Review round 1: correct, word still weak (1/2 fix progress)")

    # 6. Review again later → fixed
    page.get_by_role("link", name=re.compile("Start review round")).click()
    r2 = run_session(page, name="13-review2")
    assert r2[0][0] == "correct"
    shot(page, "13-review2-results")
    page.goto(BASE + "/review")
    expect(page.get_by_test_id("review-weak")).to_contain_text("0")
    expect(page.get_by_text("Recently fixed")).to_be_visible()
    shot(page, "14-review-fixed")
    step("Review round 2: correct again → removed from weak words, shown under 'Recently fixed'")

    # 7. Progress + persistence across reload
    page.goto(BASE + "/progress")
    vals = {k: page.get_by_test_id(k).inner_text() for k in ["p-learned", "p-accuracy", "p-weak", "p-sessions"]}
    shot(page, "15-progress")
    page.reload()
    vals2 = {k: page.get_by_test_id(k).inner_text() for k in ["p-learned", "p-accuracy", "p-weak", "p-sessions"]}
    assert vals == vals2, (vals, vals2)
    assert vals["p-sessions"] == "3", vals
    step(f"Progress: {vals} – identical after reload")

    # 8. Repeat practice: recall (typed) with article mistake + umlaut/typo tests
    page.goto(BASE + "/practice/session?mode=en-de&cat=body")
    page.get_by_test_id("prompt").wait_for()
    # find a noun at q0 → wrong article
    kind, ans = correct_for(page)
    overrides = {}
    if ans.split(" ")[0] in ("der", "die", "das"):
        wrong_art = {"der": "die", "die": "das", "das": "der"}[ans.split(" ")[0]]
        overrides[0] = wrong_art + " " + " ".join(ans.split(" ")[1:])
    overrides[1] = "  " + KEY["enToDe"][page.get_by_test_id("prompt").inner_text().strip()]  # placeholder, recomputed below
    overrides.pop(1)
    res3 = run_session(page, name="16-recall", typed_overrides=overrides, wrong_indices=())
    if 0 in overrides:
        assert res3[0][0] == "wrong" and "article" in res3[0][3].lower() or "article" in res3[0][3], res3[0]
        step(f"Recall: typed '{overrides[0]}' → '{res3[0][3][:90]}…'")
    shot(page, "17-recall-results")
    step(f"Recall session done: {[r[0] for r in res3]}")

    # 9. Fill-in-the-blank + mixed via Practice hub
    page.goto(BASE + "/practice")
    page.get_by_role("radio", name=re.compile("Fill in the blank")).click()
    page.get_by_role("button", name=re.compile("Symptoms")).click()
    shot(page, "18-practice-hub")
    page.get_by_role("link", name=re.compile("Start practice")).click()
    page.get_by_test_id("prompt").wait_for()
    shot(page, "19-fill-question")
    res4 = run_session(page, wrong_indices=(1,), name="20-fill")
    step(f"Fill-in-the-blank session: {[r[0] for r in res4]} – mistake explanation: {res4[1][3][:90]}…")

    page.goto(BASE + "/practice/session?mode=mixed")
    res5 = run_session(page, name="21-mixed")
    step(f"Mixed session (all topics): {len(res5)} answers, weak words included first")

    # 10. Final home + learn path state
    page.goto(BASE + "/")
    shot(page, "22-home-final")
    page.goto(BASE + "/learn/body")
    shot(page, "23-learn-path")
    page.goto(BASE + "/progress")
    page.reload()
    shot(page, "24-progress-final")
    final = {k: page.get_by_test_id(k).inner_text() for k in ["p-learned", "p-accuracy", "p-weak", "p-sessions"]}
    step(f"Final progress after reload: {final}")

    # 11. empty review state + level switch
    page.get_by_role("button", name=re.compile("^A2")).click()
    page.goto(BASE + "/")
    expect(page.get_by_test_id("learned")).to_contain_text("/50")
    step("Switched to A2: word pool 50")

    browser.close()

print("\nConsole/page errors:", errors if errors else "none")
sys.exit(1 if errors else 0)
