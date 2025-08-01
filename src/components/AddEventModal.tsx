"use client";

import { useState, useEffect } from "react";

interface AddEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEventModal({ onClose, onSuccess }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    date: "",
    time: "",
    emoji: "🎮",
    type: "Doação"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brazilTime, setBrazilTime] = useState("");
  const [timeUntilEvent, setTimeUntilEvent] = useState("");
  const [eventStatus, setEventStatus] = useState("Em Breve");
  const [countdown, setCountdown] = useState("");
  const [timeInputMode, setTimeInputMode] = useState<'portugal' | 'brazil'>('portugal');

  // Tipos de evento com emojis correspondentes
  const eventTypes = {
    "Doação": "💰",
    "Resistência": "🏃‍♂️", 
    "Evento Especial": "🎉"
  };

  // Função para formatar data com barras automáticas
  const formatDate = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para formatar hora
  const formatTime = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }
  };

  // Função para converter horário de Portugal para Brasil
  const convertPortugalToBrazil = (portugalTime: string) => {
    if (!portugalTime || portugalTime.length < 5) return "";
    
    try {
      const [hours, minutes] = portugalTime.split(':').map(Number);
      
      // Portugal está 4 horas à frente do Brasil
      let brazilHours = hours - 4;
      
      if (brazilHours < 0) {
        brazilHours += 24;
      }
      
      return `${brazilHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
      return "";
    }
  };

  // Função para converter horário do Brasil para Portugal
  const convertBrazilToPortugal = (brazilTime: string) => {
    if (!brazilTime || brazilTime.length < 5) return "";
    
    try {
      const [hours, minutes] = brazilTime.split(':').map(Number);
      
      // Brasil está 4 horas atrás de Portugal
      let portugalHours = hours + 4;
      
      if (portugalHours >= 24) {
        portugalHours -= 24;
      }
      
      return `${portugalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
      return "";
    }
  };

  // Função para alternar modo de entrada de horário
  const toggleTimeInputMode = () => {
    const newMode = timeInputMode === 'portugal' ? 'brazil' : 'portugal';
    setTimeInputMode(newMode);
    
    // Converter o horário atual para o novo modo
    if (formData.time) {
      if (newMode === 'brazil') {
        // Estava em Portugal, agora vai para Brasil
        const convertedTime = convertPortugalToBrazil(formData.time);
        setFormData(prev => ({ ...prev, time: convertedTime }));
        setBrazilTime(convertedTime);
      } else {
        // Estava em Brasil, agora vai para Portugal
        const convertedTime = convertBrazilToPortugal(formData.time);
        setFormData(prev => ({ ...prev, time: convertedTime }));
        setBrazilTime(convertPortugalToBrazil(convertedTime));
      }
    }
  };

  // Função para calcular tempo até o evento
  const calculateTimeUntilEvent = (date: string, time: string) => {
    if (!date || !time || date.length < 10 || time.length < 5) {
      return { timeText: "", status: "Em Breve", countdown: "" };
    }

    try {
      const [day, month, year] = date.split('/').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      
      // Criar data do evento (assumindo Portugal timezone)
      const eventDate = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      
      const diffMs = eventDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      let status = "Em Breve";
      let timeText = "";
      
      if (diffMs < 0) {
        status = "Finalizado";
        timeText = "Evento já passou";
      } else if (diffHours <= 1) {
        status = "Ativo";
        timeText = "Acontecendo agora ou em breve";
      } else if (diffDays === 0) {
        status = "Ativo";
        timeText = "Hoje";
      } else if (diffDays === 1) {
        timeText = "Amanhã";
      } else if (diffDays <= 7) {
        timeText = `Em ${diffDays} dias`;
      } else {
        timeText = `Em ${diffDays} dias`;
      }
      
      // Countdown em tempo real
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      let countdown = "";
      if (diffMs > 0) {
        if (days > 0) {
          countdown = `${days}d ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
        } else if (hoursLeft > 0) {
          countdown = `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
        } else if (minutesLeft > 0) {
          countdown = `${minutesLeft}m ${secondsLeft}s`;
        } else {
          countdown = `${secondsLeft}s`;
        }
      }
      
      return { timeText, status, countdown };
    } catch {
      return { timeText: "", status: "Em Breve", countdown: "" };
    }
  };

  // Effect para atualizar horário do Brasil quando horário muda
  useEffect(() => {
    if (formData.time) {
      if (timeInputMode === 'portugal') {
        setBrazilTime(convertPortugalToBrazil(formData.time));
      } else {
        // Se estamos no modo Brasil, o formData.time já é o horário do Brasil
        setBrazilTime(formData.time);
      }
    } else {
      setBrazilTime("");
    }
  }, [formData.time, timeInputMode]);

  // Effect para calcular tempo até o evento
  useEffect(() => {
    const updateEventInfo = () => {
      // Usar sempre o horário de Portugal para cálculos
      const portugalTime = timeInputMode === 'portugal' ? formData.time : convertBrazilToPortugal(formData.time);
      const { timeText, status, countdown } = calculateTimeUntilEvent(formData.date, portugalTime);
      setTimeUntilEvent(timeText);
      setEventStatus(status);
      setCountdown(countdown);
    };

    updateEventInfo();
    
    // Atualizar a cada segundo se há data e hora
    let interval: NodeJS.Timeout;
    if (formData.date && formData.time) {
      interval = setInterval(updateEventInfo, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [formData.date, formData.time]);

  // Effect para atualizar emoji quando tipo muda
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      emoji: eventTypes[prev.type as keyof typeof eventTypes] || "🎮"
    }));
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!formData.date || !formData.time) {
        setError('Por favor, preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Gerar título automático baseado no tipo
      const autoTitle = `${formData.type} - ${formData.date}`;

      // Preparar dados para envio (sempre usar horário de Portugal)
      const portugalTime = timeInputMode === 'portugal' ? formData.time : convertBrazilToPortugal(formData.time);
      const finalBrazilTime = timeInputMode === 'brazil' ? formData.time : brazilTime;

      const eventData = {
        title: autoTitle,
        description: formData.description,
        date: formData.date,
        time: portugalTime,
        brazilTime: finalBrazilTime,
        emoji: formData.emoji,
        type: formData.type,
        status: eventStatus
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar evento');
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError('Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      const formattedDate = formatDate(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedDate
      }));
    } else if (name === 'time') {
      const formattedTime = formatTime(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedTime
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">{formData.emoji}</span>
            Criar Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Evento */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tipo de Evento *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            >
              <option value="Doação" className="bg-gray-800 text-white">💰 Doação</option>
              <option value="Resistência" className="bg-gray-800 text-white">🏃‍♂️ Resistência</option>
              <option value="Evento Especial" className="bg-gray-800 text-white">🎉 Evento Especial</option>
            </select>
          </div>



          {/* Descrição */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Descrição detalhada do evento..."
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Data *
            </label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="DD/MM/AAAA"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Digite apenas números, as barras aparecerão automaticamente
            </p>
          </div>

          {/* Horários */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white text-sm font-medium">
                Horário *
              </label>
              <button
                type="button"
                onClick={toggleTimeInputMode}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                title="Alternar entre Portugal e Brasil"
              >
                <span className="text-xs">🇵🇹</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-xs">🇧🇷</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-xs mb-1">
                  {timeInputMode === 'portugal' ? 'Digite aqui (Portugal)' : 'Calculado (Portugal)'}
                </label>
                <input
                  type="text"
                  name="time"
                  value={timeInputMode === 'portugal' ? formData.time : convertBrazilToPortugal(formData.time)}
                  onChange={timeInputMode === 'portugal' ? handleChange : undefined}
                  className={`w-full px-3 py-2 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    timeInputMode === 'portugal' 
                      ? 'bg-white/10 border-white/20 focus:border-purple-500' 
                      : 'bg-gray-700/30 border-gray-600 cursor-not-allowed text-gray-300'
                  }`}
                  placeholder="HH:MM"
                  maxLength={5}
                  readOnly={timeInputMode !== 'portugal'}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs mb-1">
                  {timeInputMode === 'brazil' ? 'Digite aqui (Brasil)' : 'Calculado (Brasil)'}
                </label>
                <input
                  type="text"
                  name="time"
                  value={timeInputMode === 'brazil' ? formData.time : brazilTime}
                  onChange={timeInputMode === 'brazil' ? handleChange : undefined}
                  className={`w-full px-3 py-2 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    timeInputMode === 'brazil' 
                      ? 'bg-white/10 border-white/20 focus:border-purple-500' 
                      : 'bg-gray-700/30 border-gray-600 cursor-not-allowed text-gray-300'
                  }`}
                  placeholder="HH:MM"
                  maxLength={5}
                  readOnly={timeInputMode !== 'brazil'}
                />
              </div>
            </div>
          </div>

          {/* Informações do Evento */}
          {formData.date && formData.time && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <span>📊</span>
                Informações do Evento
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    eventStatus === 'Ativo' ? 'bg-green-500/20 text-green-400' :
                    eventStatus === 'Finalizado' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {eventStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tempo:</span>
                  <span className="text-white">{timeUntilEvent || "Calculando..."}</span>
                </div>
                {countdown && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Contagem:</span>
                    <span className="text-yellow-400 font-mono text-xs">{countdown}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.date || !formData.time}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando..." : "Criar Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 