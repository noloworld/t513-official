import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function RadioBroadcast() {
  const { user } = useAuth();
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [audioSource, setAudioSource] = useState<'mic' | 'system'>('system');
  const [volume, setVolume] = useState(0.8);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Verifica permissão
  if (!user || !user.role || !['admin', 'moderator'].includes(user.role)) {
    console.log('Usuário não tem permissão para transmitir:', user);
    return null;
  }
  
  console.log('Usuário tem permissão para transmitir:', user);

  const startTransmission = async () => {
    try {
      // Inicializa contexto de áudio
      audioContextRef.current = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(audioSource === 'system' && { mandatory: { chromeMediaSource: 'desktop' } })
        }
      });

      // Configura nós de áudio
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;

      // Conecta os nós
      sourceNodeRef.current
        .connect(gainNodeRef.current)
        .connect(audioContextRef.current.destination);

      // Configura MediaRecorder para transmissão
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            // Envia chunk de áudio para o servidor
            await fetch('/api/radio/stream', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioChunk: base64Audio })
            });
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Inicia gravação em chunks pequenos
      mediaRecorderRef.current.start(100);
      setIsTransmitting(true);

    } catch (error) {
      console.error('Erro ao iniciar transmissão:', error);
      alert('Erro ao iniciar transmissão. Verifique as permissões do navegador.');
    }
  };

  const stopTransmission = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsTransmitting(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  useEffect(() => {
    return () => {
      stopTransmission();
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/10">
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-white font-semibold">Transmissão T513</h3>

        {/* Fonte de Áudio */}
        <div className="flex gap-2">
          <button
            onClick={() => setAudioSource('mic')}
            className={`px-3 py-1 rounded ${
              audioSource === 'mic'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            🎤 Microfone
          </button>
          <button
            onClick={() => setAudioSource('system')}
            className={`px-3 py-1 rounded ${
              audioSource === 'system'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            🔊 Sistema
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <span className="text-white">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-blue-500"
          />
        </div>

        {/* Botão Transmitir */}
        <button
          onClick={isTransmitting ? stopTransmission : startTransmission}
          className={`px-4 py-2 rounded-lg font-semibold ${
            isTransmitting
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {isTransmitting ? '⏹️ Parar' : '▶️ Transmitir'}
        </button>

        {/* Status */}
        {isTransmitting && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Ao vivo
          </div>
        )}
      </div>
    </div>
  );
}