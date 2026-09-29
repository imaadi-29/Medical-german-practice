export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string) {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[{}]/g, ""));
    u.lang = "de-DE";
    u.rate = 0.85;
    const de = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("de"));
    if (de) u.voice = de;
    window.speechSynthesis.speak(u);
  } catch {
    /* audio is optional */
  }
}
