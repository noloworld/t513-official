import { useState, useRef } from 'react';
import { useRadio } from '@/contexts/RadioContext';

interface RadioPlayerProps {
  defaultVolume?: number;
}

export default function RadioPlayer({ defaultVolume = 0.5 }: RadioPlayerProps) {
  const { isReady } = useRadio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const setupAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  };

  const startPlaying = async () => {
    try {
      setIsLoading(true);
      setupAudioContext();

      // Conecta ao stream de áudio via SSE
      eventSourceRef.current = new EventSource('/api/radio/stream');
      
      eventSourceRef.current.onmessage = async (event) => {
        if (!audioContextRef.current) return;

        // Converte o chunk de base64 para AudioBuffer
        const base64Audio = event.data;
        const response = await fetch(base64Audio);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        // Cria e conecta source node
        sourceNodeRef.current = audioContextRef.current.createBufferSource();
        sourceNodeRef.current.buffer = audioBuffer;
        sourceNodeRef.current.connect(gainNodeRef.current!);
        sourceNodeRef.current.start();
      };

      eventSourceRef.current.onerror = () => {
        stopPlaying();
        console.error('Erro na conexão com o stream');
      };

      setIsPlaying(true);

    } catch (error) {
      console.error('Erro ao iniciar reprodução:', error);
      alert('Erro ao reproduzir áudio. Verifique as permissões do navegador.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopPlaying = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
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
      stopPlaying();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/10">
      <div className="flex flex-col items-center gap-3">
        {/* Logo e Status */}
        <div className="flex items-center gap-2">
          <img 
            src="/imagens/logo-oficial.png" 
            alt="T513 Rádio" 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-white font-medium">
            {isPlaying ? 'Ao Vivo' : 'T513 Rádio'}
          </span>
          {isPlaying && (
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-green-500 animate-pulse"></div>
              <div className="w-1 h-4 bg-green-500 animate-pulse delay-75"></div>
              <div className="w-1 h-4 bg-green-500 animate-pulse delay-150"></div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
              ${isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
              } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-white text-xl">
                {isPlaying ? '⏹️' : '▶️'}
              </span>
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-white text-lg">
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}