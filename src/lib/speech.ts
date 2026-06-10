/**
 * Tiny wrapper around the Web Speech API for short voice cues. Falls back to
 * a no-op when not supported (older iOS Safari versions, etc.).
 */

let warmedUp = false;

/**
 * Some browsers (notably iOS Safari) require speechSynthesis to be primed by
 * a synchronous call inside a user gesture before background utterances will
 * play. Call this from a button click such as "Start workout".
 */
export function warmUpSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (warmedUp) return;
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
    warmedUp = true;
  } catch {
    // ignore
  }
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    // Avoid stacking cues if one is still speaking.
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
