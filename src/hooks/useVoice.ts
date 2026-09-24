import { useCallback, useEffect, useRef, useState } from 'react';

// The Web Speech API isn't in TypeScript's DOM lib, so declare the small surface we use.
interface RecognitionResult {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionResult) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

const getRecognitionCtor = (): RecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/** Browser-native voice input and spoken output. Free, no keys; support varies
 * by browser, so callers should check `canListen` / `canSpeak`. */
export function useVoice(onFinalTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);
  const callbackRef = useRef(onFinalTranscript);
  callbackRef.current = onFinalTranscript;

  const canListen = !!getRecognitionCtor();
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;
    window.speechSynthesis?.cancel(); // don't transcribe our own voice
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = '';
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      if (final) {
        setInterim('');
        callbackRef.current(text.trim());
      } else {
        setInterim(text);
      }
    };
    const done = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim('');
    };
    rec.onend = done;
    rec.onerror = done;
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      done();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!canSpeak) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[-•⚙]/g, ' ').replace(/\s+/g, ' ').trim());
      utterance.rate = 1.03;
      window.speechSynthesis.speak(utterance);
    },
    [canSpeak]
  );

  const stopSpeaking = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
  }, [canSpeak]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    },
    []
  );

  return { canListen, canSpeak, listening, interim, startListening, stopListening, speak, stopSpeaking };
}
