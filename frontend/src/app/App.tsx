import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { VideoPanel } from './components/VideoPanel';
import { VideoControls } from './components/VideoControls';
import { MobileLayout } from './components/MobileLayout';
import { SystemNotification, NotificationType } from './components/SystemNotification';
import { OnboardingHints } from './components/OnboardingHints';
import { SettingsModal } from './components/SettingsModal';
import { TranslationPanel, Translation } from './components/TranslationPanel';

type BackendConfidence = 'low' | 'medium' | 'high';

interface ProviderStatus {
  gemini: boolean;
  openai_tts: boolean;
}

interface SessionResponse {
  session_id: string;
  app_name: string;
  clip_seconds: number;
  providers: ProviderStatus;
  sign_language_hint: string;
}

interface TranslateResponse {
  session_id: string;
  translation: string;
  confidence: BackendConfidence;
  should_speak: boolean;
  signing_detected: boolean;
  status: string;
  elapsed_ms: number;
}

const CONFIDENCE_SCORES: Record<BackendConfidence, number> = {
  low: 0.46,
  medium: 0.72,
  high: 0.94,
};

const RECORDER_MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
];

function createTranslation(text: string, confidence: BackendConfidence): Translation {
  return {
    id: `translation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    confidence: CONFIDENCE_SCORES[confidence],
    timestamp: new Date(),
  };
}

function getRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  return RECORDER_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to encode recorded video.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read recorded video.'));
    reader.readAsDataURL(blob);
  });
}

function recordClip(stream: MediaStream, durationMs: number): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === 'undefined') {
      reject(new Error('This browser does not support video recording.'));
      return;
    }

    const mimeType = getRecorderMimeType();
    const chunks: Blob[] = [];

    let recorder: MediaRecorder;

    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Unable to start video capture.'));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }, durationMs);

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener('stop', () => {
      window.clearTimeout(timeoutId);

      const blob = new Blob(chunks, {
        type: recorder.mimeType || mimeType || 'video/webm',
      });

      if (blob.size === 0) {
        reject(new Error('No video frames were captured.'));
        return;
      }

      resolve({
        blob,
        mimeType: blob.type || recorder.mimeType || mimeType || 'video/webm',
      });
    });

    recorder.addEventListener('error', () => {
      window.clearTimeout(timeoutId);
      reject(recorder.error ?? new Error('Video capture failed.'));
    });

    recorder.start();
  });
}

function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState<Translation | null>(null);
  const [history, setHistory] = useState<Translation[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [clipLength, setClipLength] = useState(3);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [signLanguageHint, setSignLanguageHint] = useState('ASL');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    gemini: false,
    openai_tts: false,
  });
  const [statusMessage, setStatusMessage] = useState('Ready to start a live signing session.');
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }

    setNotification({
      message,
      type,
      isVisible: true,
    });

    notificationTimerRef.current = window.setTimeout(() => {
      setNotification((previous) => ({ ...previous, isVisible: false }));
      notificationTimerRef.current = null;
    }, 4000);
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionId) {
      return sessionId;
    }

    const response = await fetch('/api/session', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Unable to initialize a translation session.');
    }

    const payload = (await response.json()) as SessionResponse;
    setSessionId(payload.session_id);
    setProviderStatus(payload.providers);
    setClipLength(Math.round(payload.clip_seconds));
    setSignLanguageHint(payload.sign_language_hint);
    return payload.session_id;
  }, [sessionId]);

  useEffect(() => {
    void ensureSession().catch((error) => {
      console.error(error);
      showNotification('Unable to reach the SignBridge backend.', 'error');
    });
  }, [ensureSession, showNotification]);

  const stopPlayback = useCallback(() => {
    const currentSource = playbackSourceRef.current;
    if (currentSource) {
      currentSource.onended = null;
      currentSource.stop();
      playbackSourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }

      stopPlayback();

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, [stopPlayback]);

  const ensureAudioReady = useCallback(async () => {
    const audioContext =
      audioContextRef.current ?? new window.AudioContext({ latencyHint: 'interactive' });

    audioContextRef.current = audioContext;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    return audioContext;
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      if (!isAudioEnabled) {
        return;
      }

      if (!providerStatus.openai_tts) {
        showNotification('OpenAI voice output is not configured on the backend.', 'error');
        return;
      }

      const audioContext = await ensureAudioReady();
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || 'Voice playback failed.');
      }

      stopPlayback();

      const audioBytes = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioBytes.slice(0));
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        if (playbackSourceRef.current === source) {
          playbackSourceRef.current = null;
        }
        setIsSpeaking(false);
      };

      playbackSourceRef.current = source;
      setIsSpeaking(true);
      source.start(0);
    },
    [ensureAudioReady, isAudioEnabled, providerStatus.openai_tts, showNotification, stopPlayback]
  );

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);
      setStatusMessage('Camera connected. Frame your hands and face clearly.');
      setShowHints(true);
      showNotification('Camera connected successfully.', 'success');
    } catch (error) {
      console.error('Error accessing camera:', error);
      showNotification('Unable to access camera. Check browser permissions.', 'error');
    }
  }, [showNotification]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setStream(null);
    setIsCameraActive(false);
    setIsTranslating(false);
    setStatusMessage('Camera disconnected.');
    stopPlayback();
    showNotification('Camera disconnected.', 'info');
  }, [showNotification, stopPlayback, stream]);

  const toggleCamera = useCallback(() => {
    if (isCameraActive) {
      stopCamera();
      return;
    }

    void startCamera();
  }, [isCameraActive, startCamera, stopCamera]);

  const toggleAudio = useCallback(async () => {
    if (isAudioEnabled) {
      setIsAudioEnabled(false);
      stopPlayback();
      showNotification('AI voice output muted.', 'info');
      return;
    }

    try {
      await ensureAudioReady();
      setIsAudioEnabled(true);
      showNotification('AI voice output enabled.', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Browser audio is blocked. Interact with the page and try again.', 'error');
    }
  }, [ensureAudioReady, isAudioEnabled, showNotification, stopPlayback]);

  const startTranslation = useCallback(async () => {
    if (!isCameraActive) {
      showNotification('Start the camera before translating.', 'info');
      return;
    }

    if (!providerStatus.gemini) {
      showNotification('Gemini translation is not configured on the backend.', 'error');
      return;
    }

    try {
      await ensureSession();
      setIsTranslating(true);
      setStatusMessage('Capturing live sign-language clips for translation.');
      showNotification('Translation started. Begin signing naturally.', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Unable to start a translation session.', 'error');
    }
  }, [ensureSession, isCameraActive, providerStatus.gemini, showNotification]);

  const stopTranslation = useCallback(() => {
    setIsTranslating(false);
    setStatusMessage('Translation paused.');
    showNotification('Translation stopped.', 'info');
  }, [showNotification]);

  useEffect(() => {
    if (!isTranslating || !stream || !sessionId) {
      return;
    }

    let cancelled = false;

    const runTranslationLoop = async () => {
      while (!cancelled) {
        try {
          const activeTracks = stream.getVideoTracks().filter((track) => track.readyState === 'live');
          if (activeTracks.length === 0) {
            throw new Error('Camera feed is no longer available.');
          }

          const { blob, mimeType } = await recordClip(stream, clipLength * 1000);
          if (cancelled) {
            return;
          }

          const videoBase64 = await blobToDataUrl(blob);
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              session_id: sessionId,
              mime_type: mimeType,
              video_base64: videoBase64,
              sign_language_hint: signLanguageHint,
            }),
          });

          if (!response.ok) {
            const detail = await response.text();
            throw new Error(detail || 'Translation request failed.');
          }

          const payload = (await response.json()) as TranslateResponse;
          if (cancelled) {
            return;
          }

          setLastLatencyMs(payload.elapsed_ms);
          setStatusMessage(payload.status);

          const nextText = payload.translation.trim();
          if (nextText) {
            const nextTranslation = createTranslation(nextText, payload.confidence);
            setCurrentTranslation((previous) => {
              if (previous?.text === nextTranslation.text) {
                return previous;
              }
              return nextTranslation;
            });

            if (payload.should_speak) {
              setHistory((previous) => {
                const deduped = previous.filter((item) => item.text !== nextTranslation.text);
                return [nextTranslation, ...deduped].slice(0, 24);
              });

              if (autoSpeak && isAudioEnabled) {
                try {
                  await speakText(nextTranslation.text);
                } catch (error) {
                  console.error(error);
                  showNotification('Translation succeeded, but voice playback failed.', 'error');
                }
              }
            }
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(error);
          setIsTranslating(false);
          setStatusMessage('Translation stopped because the live capture loop failed.');
          showNotification(
            error instanceof Error ? error.message : 'The live translation loop failed.',
            'error'
          );
          return;
        }
      }
    };

    void runTranslationLoop();

    return () => {
      cancelled = true;
    };
  }, [
    autoSpeak,
    clipLength,
    isAudioEnabled,
    isTranslating,
    sessionId,
    showNotification,
    signLanguageHint,
    speakText,
    stream,
  ]);

  const handleReplay = useCallback(
    async (id: string) => {
      const translation =
        id === currentTranslation?.id ? currentTranslation : history.find((item) => item.id === id);

      if (!translation) {
        return;
      }

      if (!isAudioEnabled) {
        showNotification('Enable audio before replaying voice output.', 'info');
        return;
      }

      try {
        await speakText(translation.text);
      } catch (error) {
        console.error(error);
        showNotification('Unable to replay the AI voice output.', 'error');
      }
    },
    [currentTranslation, history, isAudioEnabled, showNotification, speakText]
  );

  const providerSummary = useMemo(
    () => ({
      gemini: providerStatus.gemini,
      openai_tts: providerStatus.openai_tts,
    }),
    [providerStatus]
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'radial-gradient(ellipse at top, var(--bg-deep) 0%, var(--bg-void) 50%, #000 100%)',
      }}
    >
      <SystemNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification((previous) => ({ ...previous, isVisible: false }))}
      />

      <OnboardingHints isVisible={showHints} onDismiss={() => setShowHints(false)} />

      <AppHeader
        isCameraActive={isCameraActive}
        isTranslating={isTranslating}
        isAudioEnabled={isAudioEnabled}
        providers={providerSummary}
        statusMessage={statusMessage}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clipLength={clipLength}
        autoSpeak={autoSpeak}
        onClipLengthChange={setClipLength}
        onToggleAutoSpeak={() => setAutoSpeak((previous) => !previous)}
      />

      <main className="flex-1 overflow-hidden">
        {isMobile ? (
          <MobileLayout
            isCameraActive={isCameraActive}
            isAudioEnabled={isAudioEnabled}
            isTranslating={isTranslating}
            clipLength={clipLength}
            autoSpeak={autoSpeak}
            stream={stream}
            currentTranslation={currentTranslation}
            history={history}
            isSpeaking={isSpeaking}
            statusMessage={statusMessage}
            latencyMs={lastLatencyMs}
            onToggleCamera={toggleCamera}
            onToggleAudio={() => {
              void toggleAudio();
            }}
            onStartTranslation={() => {
              void startTranslation();
            }}
            onStopTranslation={stopTranslation}
            onClipLengthChange={setClipLength}
            onToggleAutoSpeak={() => setAutoSpeak((previous) => !previous)}
            onStartCamera={() => {
              void startCamera();
            }}
            onStopCamera={stopCamera}
            onReplay={(id) => {
              void handleReplay(id);
            }}
          />
        ) : (
          <div className="h-full p-8">
            <div className="h-full max-w-[1800px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 h-full">
                <div className="flex flex-col gap-6 min-h-0">
                  <VideoPanel
                    isActive={isCameraActive}
                    isTranslating={isTranslating}
                    stream={stream}
                    latencyMs={lastLatencyMs}
                    statusText={statusMessage}
                    onStartCamera={() => {
                      void startCamera();
                    }}
                    onStopCamera={stopCamera}
                  />

                  <VideoControls
                    isCameraActive={isCameraActive}
                    isAudioEnabled={isAudioEnabled}
                    isTranslating={isTranslating}
                    clipLength={clipLength}
                    autoSpeak={autoSpeak}
                    onToggleCamera={toggleCamera}
                    onToggleAudio={() => {
                      void toggleAudio();
                    }}
                    onStartTranslation={() => {
                      void startTranslation();
                    }}
                    onStopTranslation={stopTranslation}
                    onClipLengthChange={setClipLength}
                    onToggleAutoSpeak={() => setAutoSpeak((previous) => !previous)}
                  />
                </div>

                <div className="min-h-0">
                  <TranslationPanel
                    currentTranslation={currentTranslation}
                    history={history}
                    isSpeaking={isSpeaking}
                    statusText={statusMessage}
                    onReplay={(id) => {
                      void handleReplay(id);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'var(--accent-seafoam)' }}
        />

        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10"
          style={{ background: 'var(--accent-seafoam-muted)' }}
        />
      </div>
    </div>
  );
}

export default App;
