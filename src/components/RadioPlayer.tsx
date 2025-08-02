import { useState, useEffect, useRef } from 'react';

interface RadioPlayerProps {
  streamUrl: string;
  defaultVolume?: number;
}

export default function RadioPlayer({ streamUrl, defaultVolume = 0.5 }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cria elemento de áudio
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume;

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [streamUrl]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Alguns navegadores bloqueiam autoplay, então usamos play() com catch
        await audioRef.current.play();
      }
      
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      alert('Erro ao reproduzir. Verifique se seu navegador permite reprodução de áudio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

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