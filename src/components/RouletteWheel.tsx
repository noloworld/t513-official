"use client";

import { useRef, useState } from "react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

// Prêmios e chances
const prizes = [
  { label: "Sem Prêmio", chance: 75, color: "#f3f4f6", icon: "❌", points: 0 },
  { label: "5C", chance: 20, color: "#fbbf24", icon: "🪙", points: 50 },
  { label: "20C", chance: 4.5, color: "#f59e42", icon: "💰", points: 200 },
  { label: "50C", chance: 0.4, color: "#f472b6", icon: "💎", points: 500 },
  { label: "100C", chance: 0.08, color: "#60a5fa", icon: "🏆", points: 1000 },
  { label: "500C", chance: 0.015, color: "#34d399", icon: "👑", points: 5000 },
  { label: "1K", chance: 0.005, color: "#a78bfa", icon: "🌟", points: 10000 },
  { label: "5K", chance: 0.005, color: "#f43f5e", icon: "🔥", points: 50000 },
];

// Cada segmento agora tem o mesmo tamanho (45°)
const SEGMENTS = prizes.length;
const ANGLE_PER_SEGMENT = 360 / SEGMENTS;

function getRandomPrizeIndex() {
  // Sorteio proporcional às chances
  const totalChance = prizes.reduce((acc, p) => acc + p.chance, 0);
  const rand = Math.random() * totalChance;
  let sum = 0;
  for (let i = 0; i < prizes.length; i++) {
    sum += prizes[i].chance;
    if (rand < sum) return i;
  }
  return prizes.length - 1;
}

// Adicionar URLs de moedas reais do Habbo Hotel (incluindo sem-premio)
const coinImages = [
  "/imagens/sem-premio.png", // Sem prêmio
  "/imagens/moeda-5c.png",
  "/imagens/moeda-20c.png",
  "/imagens/moeda-50c.png",
  "/imagens/moeda-100c.png",
  "/imagens/moeda-500c.png",
  "/imagens/moeda-1k.png",
  "/imagens/moeda-5k.png",
];

export default function RouletteWheel({ user, last5KSpins = 418, onSpin }: { user?: any, last5KSpins?: number, onSpin?: (prize: typeof prizes[0]) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<number|null>(null);
  const [spinsSince5K, setSpinsSince5K] = useState(last5KSpins);
  const [pointerAngle, setPointerAngle] = useState(0); // ângulo da seta
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultAlert, setShowResultAlert] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [pointsAdded, setPointsAdded] = useState(false);
  const pointerTimeout = useRef<NodeJS.Timeout | null>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);

  // Calcula o ângulo de início de cada segmento
  const segAngles = prizes.map(p => (p.chance / prizes.reduce((acc, p) => acc + p.chance, 0)) * 360);

  // Efeito de partículas
  function fireConfetti() {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#fbbf24", "#f59e42", "#f472b6", "#60a5fa", "#34d399", "#a78bfa", "#f43f5e"]
    });
  }



  // Som de tick
  function playTick() {
    try {
      const tickAudio = new Audio("/tick.mp3");
      tickAudio.volume = 0.5; // Volume reduzido para não ser muito alto
      tickAudio.play().catch((e) => {
        console.log('Erro ao tocar tick:', e);
      });
    } catch (e) {
      console.log('Erro inesperado ao tocar tick:', e);
    }
  }
  // Som de vitória
  function playWin() {
    if (winAudioRef.current) {
      console.log('Tentar tocar win:', winAudioRef.current.src, 'readyState:', winAudioRef.current.readyState);
      try {
        winAudioRef.current.pause();
        winAudioRef.current.currentTime = 0;
        if (winAudioRef.current.readyState > 2) {
          winAudioRef.current.play().catch((e) => {
            console.log('Erro ao tocar win:', e);
          });
        } else {
          winAudioRef.current.load();
          setTimeout(() => {
            winAudioRef.current && winAudioRef.current.play().catch((e) => {
              console.log('Erro ao tocar win (depois do load):', e);
            });
          }, 100);
        }
      } catch (e) {
        console.log('Erro inesperado ao tocar win:', e);
      }
    }
  }

  // Função para abrir modal de confirmação
  function handleSpinClick() {
    if (!user) return;
    
    if (user.points < 20) {
      alert("Você não possui pontos suficientes! Cada giro custa 20 pontos.");
      return;
    }
    
    setShowConfirmModal(true);
  }

  // Função para confirmar o giro
  async function confirmSpin() {
    if (!user) return;
    
    setShowConfirmModal(false);
    
    // Deduz 20 pontos do usuário
    try {
      const response = await fetch('/api/user/deduct-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclui cookies
        body: JSON.stringify({ points: 20 }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao deduzir pontos. Tente novamente.');
        return;
      }

      // Atualiza o estado do usuário com os novos pontos
      const responseData = await response.json();
      if (responseData.user) {
        // Atualiza o estado do usuário localmente
        const updatedUser = { ...user, points: responseData.user.points };
        // Atualiza o estado local de pontos
        setLocalPoints(responseData.user.points);
        // Dispara um evento customizado para atualizar o estado global
        window.dispatchEvent(new CustomEvent('userPointsUpdated', { 
          detail: { user: updatedUser } 
        }));
        
        // Dispara evento para animação de dedução de pontos no header
        window.dispatchEvent(new CustomEvent('pointsChanged', {
          detail: { type: 'deduct', points: responseData.user.points }
        }));
      }
      
    } catch (error) {
      console.error('Erro ao deduzir pontos:', error);
      alert('Erro ao deduzir pontos. Tente novamente.');
      return;
    }
    
    // Inicia o giro
    await handleSpin();
  }

  // Estado local para pontos atualizados
  const [localPoints, setLocalPoints] = useState(user?.points || 0);

  // Atualiza pontos locais quando o usuário muda
  useEffect(() => {
    if (user?.points !== undefined) {
      setLocalPoints(user.points);
    }
  }, [user?.points]);

  // Função para mostrar resultado com loading
  async function showResultWithLoading(prize: typeof prizes[0]) {
    const message = prize.label === "Sem Prêmio" 
      ? "Não foi dessa vez... 😢"
      : `Parabéns! Você ganhou ${prize.label} (${prize.points} pontos)`;
    
    setResultMessage(message);
    setShowResultAlert(true);
    
    if (prize.points > 0) {
      // Primeira fase: "Adicionando pontos à carteira..."
      setIsAddingPoints(true);
      setPointsAdded(false);
      
      // Adicionar pontos ao usuário
      try {
        const response = await fetch('/api/user/add-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ points: prize.points }),
        });
        
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.user) {
            // Atualiza o estado do usuário com os novos pontos
            const updatedUser = { ...user, points: responseData.user.points };
            setLocalPoints(responseData.user.points);
            // Dispara um evento customizado para atualizar o estado global
            window.dispatchEvent(new CustomEvent('userPointsUpdated', { 
              detail: { user: updatedUser } 
            }));
            
            // Guarda os pontos para animação posterior quando o modal fechar
            const finalPoints = responseData.user.points;
            
            // Segunda fase: "Os pontos foram adicionados à carteira"
            setTimeout(() => {
              setIsAddingPoints(false);
              setPointsAdded(true);
              
              // Terceira fase: desaparece após 2 segundos E DISPARA A ANIMAÇÃO
              setTimeout(() => {
                setShowResultAlert(false);
                setResultMessage("");
                setIsAddingPoints(false);
                setPointsAdded(false);
                
                // Dispara evento para animação de adição de pontos no header QUANDO O MODAL FECHA
                window.dispatchEvent(new CustomEvent('pointsChanged', {
                  detail: { type: 'add', points: finalPoints }
                }));
              }, 2000);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
      }
    } else {
      // Para "Sem Prêmio", desaparece após 3 segundos
      setTimeout(() => {
        setShowResultAlert(false);
        setResultMessage("");
      }, 3000);
    }
  }

  async function handleSpin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    
    // Toca o som de tick uma vez no início
    playTick();
    
    // Sorteio proporcional
    const prizeIndex = getRandomPrizeIndex();
    
    // Ângulo alvo (ponteiro sempre no topo, segmento sorteado centralizado)
    const segMid = (prizeIndex + 0.5) * ANGLE_PER_SEGMENT;
    
    // Gira várias voltas + ângulo alvo
    const target = 360 * 6 - segMid + (Math.random() - 0.5) * (ANGLE_PER_SEGMENT * 0.7);
    let current = angle % 360;
    let total = target - current;
    
    // Duração fixa de 4 segundos
    const duration = 4000;
    const steps = Math.floor(duration / 16);
    
    for (let i = 0; i < steps; i++) {
      await new Promise(r => setTimeout(r, 16));
      const progress = i / steps;
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextAngle = current + total * eased;
      setAngle(nextAngle);
      
      // Anima a seta durante a rotação (sem som)
      if (i % 8 === 0) { // Anima a cada 8 frames
        setPointerAngle((prev) => (prev === 0 ? 18 : prev === 18 ? -18 : 0));
        if (pointerTimeout.current) clearTimeout(pointerTimeout.current);
        pointerTimeout.current = setTimeout(() => setPointerAngle(0), 120);
      }
    }
    
    setAngle(current + total);
    setResult(prizeIndex);
    setSpinning(false);
    
    if (prizes[prizeIndex].label === "5K") {
      setSpinsSince5K(0);
    } else {
      setSpinsSince5K(s => s + 1);
    }
    
    if (prizes[prizeIndex].points > 0) {
      playWin();
      fireConfetti();
    }
    
    // Mostra resultado com loading
    await showResultWithLoading(prizes[prizeIndex]);
    
    if (onSpin) onSpin(prizes[prizeIndex]);
  }

  // Responsivo
  const size = 440;
  const center = size / 2;
  const radius = center - 16;

  // Limpa timeout da seta ao desmontar
  useEffect(() => {
    return () => {
      if (pointerTimeout.current) clearTimeout(pointerTimeout.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-8 px-4">
      <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-300 drop-shadow mb-6 text-center tracking-wide animate-pulse uppercase" style={{letterSpacing: '0.08em'}}>Roleta da Sorte</h2>
      

      
      {/* Áudios */}
      {/* <audio ref={audioRef} src="/tick.mp3" preload="auto" /> */}
      <audio ref={winAudioRef} src="/win.mp3" preload="auto" />
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg" style={{ aspectRatio: '1/1' }}>
        <div className="w-full h-full" style={{ maxWidth: size, maxHeight: size }}>
        {/* Ponteiro animado */}
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: `rotate(${180 + pointerAngle}deg)`, transition: 'transform 0.12s cubic-bezier(.4,2,.6,1)' }}>
            <polygon points="27,0 37,27 17,27" fill="#FFD700" stroke="#bfa100" strokeWidth="2" />
            <circle cx="27" cy="34" r="9" fill="#fffbe6" stroke="#FFD700" strokeWidth="2" />
          </svg>
        </div>
        {/* Roleta */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-full shadow-2xl w-full h-full"
          style={{ transform: `rotate(${angle}deg)`, transition: spinning ? "none" : "transform 0.5s cubic-bezier(.17,.67,.83,.67)" }}
        >
          {prizes.map((prize, i) => {
            const startAngle = i * ANGLE_PER_SEGMENT;
            const endAngle = (i + 1) * ANGLE_PER_SEGMENT;
            const largeArc = ANGLE_PER_SEGMENT > 180 ? 1 : 0;
            const x1 = center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
            const y1 = center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
            const x2 = center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
            const y2 = center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
            // Posição central do segmento
            const midAngle = (startAngle + endAngle) / 2;
            return (
              <g key={i}>
                <path
                  d={`M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`}
                  fill={prize.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 2px 8px #0002)' }}
                />
                {/* Imagem da moeda/prêmio */}
                {coinImages[i] && (
                  <image
                    href={coinImages[i]}
                    x={center + (radius * 0.60) * Math.cos((Math.PI * (midAngle - 90)) / 180) - (i === 0 ? 45 : 36)}
                    y={center + (radius * 0.60) * Math.sin((Math.PI * (midAngle - 90)) / 180) - (i === 0 ? 45 : 36)}
                    width={i === 0 ? "90" : "72"}
                    height={i === 0 ? "90" : "72"}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {/* Botão GIRAR */}
        <button
          className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 px-4 sm:px-8 py-2 sm:py-4 rounded-full text-lg sm:text-xl font-bold shadow-lg border-4 border-yellow-400 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-white transition-all duration-200 hover:scale-105 hover:brightness-110 focus:outline-none ${user ? "" : "opacity-60 pointer-events-none"}`}
          style={{ boxShadow: '0 0 32px 4px #FFD70088, 0 2px 8px #0004' }}
          onClick={user ? handleSpinClick : undefined}
          disabled={spinning || !user}
        >
          GIRAR
        </button>
        </div> {/* Fecha div com maxWidth/maxHeight */}
      </div>
      {/* Texto dinâmico */}
      <div className="mt-8 text-center">
        <span className="inline-block px-4 py-2 rounded-lg bg-black/30 text-yellow-300 text-lg font-semibold shadow animate-pulse">
          Cada giro tem um custo de 20 pontos (2c)
        </span>
      </div>
      {/* Resultado */}
      {result !== null && (
        <div className="mt-4 text-center">
          <span className="inline-block px-4 py-2 rounded-lg bg-white/20 text-2xl font-bold text-pink-400 shadow">
            {prizes[result].label === "Sem Prêmio"
              ? "Não foi dessa vez... 😢"
              : `Parabéns! Você ganhou ${prizes[result].label} (${prizes[result].points} pontos)`}
          </span>
        </div>
      )}
      
      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300"
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirmar Giro</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Cada giro custa <span className="font-bold text-red-600">20 pontos</span>.
              <br />
              Você tem <span className="font-bold text-green-600">{localPoints || 0} pontos</span>.
              <br />
              Deseja continuar?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSpin}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Alerta de Resultado */}
      {showResultAlert && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300"
          onClick={() => setShowResultAlert(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {resultMessage}
              </h3>
              {isAddingPoints && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Adicionando pontos à carteira...</span>
                </div>
              )}
              {pointsAdded && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  <span>Os pontos foram adicionados à carteira</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 