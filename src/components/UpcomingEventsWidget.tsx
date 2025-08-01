"use client";

import { useState, useEffect } from "react";
import EditEventModal from "./EditEventModal";

interface Event {
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
  editedBy?: string;
  editedAt?: string;
  createdAt: string;
}

interface UpcomingEventsWidgetProps {
  user: any;
  onAddEvent?: () => void;
}

export default function UpcomingEventsWidget({ user, onAddEvent }: UpcomingEventsWidgetProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (user) {
      fetchUpcomingEvents();
    }
  }, [user]);

  // Timer em tempo real para atualizar os countdowns a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Atualiza a cada segundo para timer preciso

    return () => clearInterval(timer);
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/events?filter=upcoming&limit=5');
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events || []);
      }
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEditSuccess = () => {
    fetchUpcomingEvents(); // Recarregar eventos após edição
    setEditingEvent(null);
  };

  // Função para calcular tempo até o evento com timer em tempo real
  const getTimeUntilEvent = (eventDate: string, eventTime?: string) => {
    try {
      // Assumindo que a data está no formato DD/MM/YYYY
      const [day, month, year] = eventDate.split('/');
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      
      let eventDateTime = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      let eventEndTime = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      
      // Se tiver horário, adicionar ao cálculo
      if (eventTime) {
        const [hours, minutes] = eventTime.split(':');
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        // Evento termina no final do dia (23:59)
        eventEndTime.setHours(23, 59, 59, 999);
      } else {
        // Se não tiver horário, assumir início do dia
        eventDateTime.setHours(0, 0, 0, 0);
        eventEndTime.setHours(23, 59, 59, 999);
      }
      
      const now = new Date();
      const diffTimeStart = eventDateTime.getTime() - now.getTime();
      const diffTimeEnd = eventEndTime.getTime() - now.getTime();
      
      // Se o evento já terminou (passou do final do dia)
      if (diffTimeEnd < 0) {
        return { text: "Finalizado", color: "text-red-400", status: "ended" };
      }
      
      // Se o evento está acontecendo agora (começou mas não terminou)
      if (diffTimeStart <= 0 && diffTimeEnd > 0) {
        return { text: "🔴 AO VIVO", color: "text-red-500 animate-pulse", status: "live" };
      }
      
      // Calcular tempo até o início do evento
      const diffDays = Math.floor(diffTimeStart / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTimeStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTimeStart % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffTimeStart % (1000 * 60)) / 1000);
      
      // Se for hoje e tiver horário específico
      if (diffDays === 0 && eventTime) {
        if (diffHours > 0) {
          return { text: `Em ${diffHours}h ${diffMinutes}min`, color: "text-yellow-400", status: "soon" };
        } else if (diffMinutes > 0) {
          return { text: `Em ${diffMinutes}min ${diffSeconds}s`, color: "text-orange-400", status: "very-soon" };
        } else if (diffSeconds > 0) {
          return { text: `Em ${diffSeconds}s`, color: "text-red-400 animate-pulse", status: "starting" };
        }
      }
      
      if (diffDays === 0) return { text: "Hoje!", color: "text-green-400", status: "today" };
      if (diffDays === 1) return { text: "Amanhã", color: "text-blue-400", status: "tomorrow" };
      if (diffDays <= 7) return { text: `Em ${diffDays} dias`, color: "text-blue-300", status: "this-week" };
      
      return { text: eventDate, color: "text-gray-400", status: "future" };
    } catch (error) {
      return { text: eventDate, color: "text-gray-400", status: "error" };
    }
  };

  // Função para obter cor do status baseado no timer
  const getStatusColor = (status: string, timerStatus?: string) => {
    // Se o evento está AO VIVO, mostrar status especial
    if (timerStatus === 'live') {
      return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
    }
    
    switch (status.toLowerCase()) {
      case 'em breve':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ativo':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'programado':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Função para obter texto do status baseado no timer
  const getStatusText = (status: string, timerStatus?: string) => {
    if (timerStatus === 'live') {
      return 'AO VIVO';
    }
    return status;
  };

  if (!user) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      {/* Header do Widget */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xl">📅</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Próximos Eventos</h3>
            <p className="text-sm text-gray-400">
              {upcomingEvents.length} evento{upcomingEvents.length !== 1 ? 's' : ''} programado{upcomingEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Botão Adicionar Evento para Admins/Moderadores */}
        {(user?.role === 'admin' || user?.role === 'moderator') && onAddEvent && (
          <button 
            onClick={onAddEvent}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            title="Adicionar Evento"
          >
            <span>➕</span>
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        )}
      </div>

      {/* Conteúdo do Widget - Sempre visível */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-gray-400 text-sm">Nenhum evento programado</p>
            <p className="text-gray-500 text-xs mt-1">Fique atento para novos eventos!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const timeInfo = getTimeUntilEvent(event.date, event.time);
              
              return (
                <div key={event.id} className={`bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/10 ${timeInfo.status === 'live' ? 'ring-2 ring-red-500/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{event.emoji}</div>
                    <div className="flex-1 min-w-0">
                      {/* Título, Status e Badge Remarcado */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm leading-tight">{event.title}</h4>
                          {event.isRescheduled && (
                            <span className="inline-block mt-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                              📅 Remarcado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status, timeInfo.status)}`}>
                            {getStatusText(event.status, timeInfo.status)}
                          </span>
                          {/* Botão Editar para Admins/Moderadores */}
                          {(user?.role === 'admin' || user?.role === 'moderator') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}
                              className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                              title="Editar evento"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Data e Horário */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-300 flex items-center gap-1">
                          📅 {event.date}
                        </span>
                        {event.time && (
                          <span className="text-xs text-gray-300 flex items-center gap-1">
                            🇵🇹 {event.time}
                          </span>
                        )}
                        {event.brazilTime && (
                          <span className="text-xs text-gray-300 flex items-center gap-1">
                            🇧🇷 {event.brazilTime}
                          </span>
                        )}
                      </div>
                      
                      {/* Timer e Tipo */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${timeInfo.color} bg-black/30 px-3 py-1 rounded-full border ${timeInfo.status === 'live' ? 'border-red-500/50' : 'border-transparent'}`}>
                          ⏰ {timeInfo.text}
                        </span>
                        <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      
                      {/* Descrição */}
                      {event.description && (
                        <p className="text-xs text-gray-300 mt-2 line-clamp-2 bg-black/20 p-2 rounded">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Link para ver todos os eventos */}
        {upcomingEvents.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <button 
              onClick={() => {
                // Scroll para a seção de eventos
                const eventsSection = document.querySelector('[data-section="events"]');
                if (eventsSection) {
                  eventsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Ver todos os eventos →
            </button>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}