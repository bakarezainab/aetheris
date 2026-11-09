import { useState, useRef, useCallback } from 'react';

export type RecorderState = 'idle' | 'recording' | 'processing';

const MIN_RECORDING_MS = 350;

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionTextRef = useRef<string>('');

  const getLatestTranscript = useCallback(() => {
    return (recognitionTextRef.current || '').trim();
  }, []);

  const start = useCallback(async (languageCode: string = 'en') => {
    recognitionTextRef.current = '';
    setLiveTranscript('');

    // 1. Browser Native Web Speech API (Instant client-side STT)
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        // Map common codes to BCP-47
        const bcpMap: Record<string, string> = {
          en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
          es: 'es-ES', fr: 'fr-FR', ja: 'ja-JP',
        };
        recognition.lang = bcpMap[languageCode] || 'en-US';

        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript + ' ';
          }
          const clean = accumulated.trim();
          if (clean) {
            recognitionTextRef.current = clean;
            setLiveTranscript(clean);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('[WebSpeech] Recognition notice:', e.error || e);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsSpeechRecognitionSupported(true);
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
        setIsSpeechRecognitionSupported(false);
      }
    } else {
      setIsSpeechRecognitionSupported(false);
    }

    // 2. Audio Stream & MediaRecorder for visualizer & audio pipeline
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
      },
    });
    streamRef.current = stream;

    const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? { mimeType: 'audio/webm;codecs=opus' }
      : {};
    const mr = new MediaRecorder(stream, options);
    recorderRef.current = mr;
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const duration = Date.now() - startTimeRef.current;
      const finalTranscript = (recognitionTextRef.current || '').trim();

      // Graceful release of audio tracks
      setTimeout(() => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }, 300);

      try {
        recognitionRef.current?.stop();
      } catch {}

      if (duration < MIN_RECORDING_MS || (chunksRef.current.length === 0 && !finalTranscript)) {
        console.warn(`Recording too short (${duration}ms) with no speech, skipping`);
        setState('idle');
        return;
      }

      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      setLiveTranscript(finalTranscript);
      setState('processing');
    };

    mr.start(100);
    setState('recording');

    return stream;
  }, []);

  const stop = useCallback(() => {
    // Delay recognition stop slightly so final speech frames are processed
    setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    }, 250);

    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setLiveTranscript('');
    recognitionTextRef.current = '';
    setState('idle');
  }, []);

  return {
    state,
    audioBlob,
    liveTranscript,
    isSpeechRecognitionSupported,
    getLatestTranscript,
    start,
    stop,
    reset,
    stream: streamRef.current,
  };
}
