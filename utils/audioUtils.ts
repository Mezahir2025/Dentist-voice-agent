/**
 * Audio processing utilities for Gemini Live API
 */

export const AudioUtils = {
  /**
   * Resamples audio buffer to target sample rate (16kHz for Gemini)
   */
  resampleBuffer: (audioData: Float32Array, oldSampleRate: number, newSampleRate: number): Float32Array => {
    if (oldSampleRate === newSampleRate) return audioData;

    const ratio = oldSampleRate / newSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);

    let offsetResult = 0;
    let offsetSource = 0;

    while (offsetResult < newLength) {
      const nextOffsetSource = Math.round((offsetResult + 1) * ratio);
      let accum = 0, count = 0;

      for (let i = offsetSource; i < nextOffsetSource && i < audioData.length; i++) {
        accum += audioData[i];
        count++;
      }

      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetSource = nextOffsetSource;
    }

    return result;
  },

  /**
   * Converts Float32Array (web audio) to Int16Array (PCM16)
   */
  floatTo16BitPCM: (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  },

  /**
   * Converts Int16Array to Base64 (for WebSocket transmission)
   */
  arrayBufferToBase64: (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  },

  /**
   * Converts Base64 string back to ArrayBuffer (for playback)
   */
  base64ToArrayBuffer: (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
};
