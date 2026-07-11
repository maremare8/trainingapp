/**
 * Simple beep sound using Web Audio API.
 * Works on mobile browsers without needing to load audio files.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a short beep sound.
 * @param frequency Hz (default 880 = A5)
 * @param duration ms (default 100)
 * @param volume 0-1 (default 0.3)
 */
export function beep(frequency = 880, duration = 100, volume = 0.3): void {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (required after user gesture on mobile)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Silently fail if audio isn't available
  }
}

/** Warm up the audio context (call on user interaction to enable sound on iOS) */
export function warmUpAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  } catch {
    // Silently fail
  }
}
