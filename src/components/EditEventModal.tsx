"use client";

import { useState } from "react";

interface EditEventModalProps {
  event: {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    brazilTime?: string;
    emoji: string;
    type: string;
    status: string;
    isRescheduled?: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEventModal({ event, onClose, onSuccess }: EditEventModalProps) {
  const [description, setDescription] = useState(event.description || "");
  const [date, setDate] = useState(event.date);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Função para formatar data automaticamente
  const formatDate = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a formatação DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setDate(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          description,
          date,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao editar evento');
      }
    } catch (error) {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = description !== (event.description || "") || date !== event.date;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{event.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-white">Editar Evento</h2>
                <p className="text-sm text-gray-400">{event.title}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Aviso sobre campos editáveis */}
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200">
              ℹ️ Você pode editar apenas a <strong>descrição</strong> e a <strong>data</strong> do evento.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do evento (opcional)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Data *
              </label>
              <input
                type="text"
                value={date}
                onChange={handleDateChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Campos não editáveis (apenas para visualização) */}
            <div className="space-y-3 p-3 bg-gray-500/20 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-2">Campos não editáveis:</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Tipo:</span>
                  <span className="text-white ml-2">{event.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white ml-2">{event.status}</span>
                </div>
                {event.time && (
                  <div>
                    <span className="text-gray-400">🇵🇹 Horário:</span>
                    <span className="text-white ml-2">{event.time}</span>
                  </div>
                )}
                {event.brazilTime && (
                  <div>
                    <span className="text-gray-400">🇧🇷 Horário:</span>
                    <span className="text-white ml-2">{event.brazilTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Aviso sobre remarcação */}
            {hasChanges && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  ⚠️ Este evento será marcado como <strong>"Remarcado"</strong> após a edição.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}