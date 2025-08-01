"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import DonationStatus from "./DonationStatus";
import { useTask } from "@/contexts/TaskContext";
import DailyTaskQuiz from "./DailyTaskQuiz";
import AddEventModal from "./AddEventModal";
import AddNewsModal from "./AddNewsModal";
import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import RouletteWheel from "@/components/RouletteWheel";

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { level, experience, participations, badges } = useTask();
  const [showQuiz, setShowQuiz] = useState(false);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [taskStatus, setTaskStatus] = useState<{ canDoTask: boolean; message?: string; nextAvailableAt?: string } | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [redeemRequests, setRedeemRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, user: any | null }>({ open: false, user: null });
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showHelpDetail, setShowHelpDetail] = useState<any|null>(null);
  const [showSuggestionDetail, setShowSuggestionDetail] = useState<any|null>(null);
  const [showHelperNotice, setShowHelperNotice] = useState(false);
  const [dontShowHelperNotice, setDontShowHelperNotice] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const [countdownText, setCountdownText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Buscar emblemas do usuário
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      
      try {
        await Promise.all([
          fetchEvents(),
          fetchNews()
        ]);
      } finally {
        // Garantir que o skeleton seja visível por pelo menos 800ms
        const elapsed = Date.now() - startTime;
        const minLoadingTime = 800;
        
        if (elapsed < minLoadingTime) {
          setTimeout(() => setIsLoading(false), minLoadingTime - elapsed);
        } else {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, []); // Removido [user] para evitar re-carregamento quando pontos mudam

  // Carregar dados específicos do usuário quando ele mudar (sem skeleton)
  useEffect(() => {
    if (user) {
      fetchUserBadges();
      fetchTaskStatus();
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchRedeemRequests();
      fetchUsers(usersPage);
    }
    if (user && ["admin", "moderator", "helper"].includes(user.role)) {
      fetchHelpRequests();
      fetchSuggestions();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'helper') {
      const hideNotice = localStorage.getItem('hideHelperNotice');
      if (!hideNotice) setShowHelperNotice(true);
    }
  }, [user]);

  // Debug: Monitor modal state changes
  useEffect(() => {
    console.log('Modal state changed - showUserModal:', showUserModal, 'selectedUser:', selectedUser);
  }, [showUserModal, selectedUser]);

  useEffect(() => {
    if (taskStatus && taskStatus.nextAvailableAt) {
      function updateCountdown() {
        if (!taskStatus || !taskStatus.nextAvailableAt) return;
        const now = new Date();
        const next = new Date(taskStatus.nextAvailableAt);
        const diff = next.getTime() - now.getTime();
        if (diff <= 0) {
          setCountdown("00:00:00");
          setCountdownText("agora mesmo");
          if (countdownInterval.current) clearInterval(countdownInterval.current);
          return;
        }
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        // Formato HH:MM:SS para o timer
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        
        // Formato amigável para a mensagem
        let timeText = "";
        if (hours > 0) {
          timeText += `${hours} hora${hours > 1 ? 's' : ''}`;
          if (minutes > 0) timeText += `, ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          timeText += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
          if (seconds > 0) timeText += ` e ${seconds} segundo${seconds > 1 ? 's' : ''}`;
        } else {
          timeText += `${seconds} segundo${seconds > 1 ? 's' : ''}`;
        }
        setCountdownText(timeText);
      }
      updateCountdown();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      countdownInterval.current = setInterval(updateCountdown, 1000);
      return () => {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      };
    }
  }, [taskStatus?.nextAvailableAt]);

  const handleConfirmHelperNotice = () => {
    if (dontShowHelperNotice) {
      localStorage.setItem('hideHelperNotice', '1');
    }
    setShowHelperNotice(false);
  };

  const fetchUserBadges = async () => {
    try {
      const response = await fetch('/api/user/badges');
      if (response.ok) {
        const data = await response.json();
        setUserBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Erro ao buscar emblemas:', error);
    }
  };

  const fetchTaskStatus = async () => {
    try {
      const response = await fetch('/api/tasks/daily', { credentials: 'include' });
      const data = await response.json();
      setTaskStatus({ 
        canDoTask: data.canDoTask, 
        message: data.message,
        nextAvailableAt: data.nextAvailableAt 
      });
    } catch (error) {
      setTaskStatus(null);
    }
  };

  const fetchRedeemRequests = async () => {
    try {
      const response = await fetch('/api/redeem/requests', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRedeemRequests(data.requests || []);
      }
    } catch (error) {
      setRedeemRequests([]);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    fetchTaskStatus();
    fetchUserBadges();
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/redeem/requests/${id}/approve`, { method: 'POST', credentials: 'include' });
      fetchRedeemRequests();
    } catch (error) {}
  };
  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/redeem/requests/${id}/reject`, { method: 'POST', credentials: 'include' });
      fetchRedeemRequests();
    } catch (error) {}
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  };

  const handleEventSuccess = () => {
    fetchEvents();
  };

  const handleNewsSuccess = () => {
    fetchNews();
  };

  const fetchUsers = async (page: number) => {
    setUsersLoading(true);
    try {
      const response = await fetch(`/api/users?page=${page}&pageSize=10`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log('Resposta da API /api/users:', data); // <-- Adicionado para debug
        setUsers(data.users || []);
        setUsersTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      setUsers([]);
      setUsersTotalPages(1);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleViewUser = (user: any) => {
    console.log('handleViewUser chamado com:', user);
    console.log('Estado atual - selectedUser:', selectedUser);
    console.log('Estado atual - showUserModal:', showUserModal);
    
    setSelectedUser(user);
    setShowUserModal(true);
    
    console.log('Estados atualizados - selectedUser:', user);
    console.log('Estados atualizados - showUserModal:', true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este usuário? Essa ação não pode ser desfeita.')) return;
    
    try {
      console.log('Tentando eliminar usuário:', id);
      const response = await fetch(`/api/users/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usuário eliminado:', data);
        fetchUsers(usersPage);
      } else {
        const errorData = await response.json();
        console.error('Erro ao eliminar usuário:', errorData);
        alert('Erro ao eliminar usuário: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao eliminar usuário. Verifique a conexão.');
    }
  };

  const handleMakeHelper = async (id: string) => {
    try {
      console.log('Tentando tornar usuário ajudante:', id);
      const response = await fetch(`/api/users/${id}/make-helper`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usuário promovido a ajudante:', data);
        fetchUsers(usersPage);
      } else {
        const errorData = await response.json();
        console.error('Erro ao promover usuário:', errorData);
        alert('Erro ao promover usuário: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao promover usuário. Verifique a conexão.');
    }
  };

  const handleMakeModerator = async (id: string) => {
    try {
      console.log('Tentando tornar usuário moderador:', id);
      const response = await fetch(`/api/users/${id}/make-moderator`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usuário promovido a moderador:', data);
        fetchUsers(usersPage);
      } else {
        const errorData = await response.json();
        console.error('Erro ao promover usuário:', errorData);
        alert('Erro ao promover usuário: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao promover usuário. Verifique a conexão.');
    }
  };

  const handleRemoveHelper = async (id: string) => {
    try {
      console.log('Tentando remover usuário como ajudante:', id);
      const response = await fetch(`/api/users/${id}/remove-helper`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usuário removido como ajudante:', data);
        fetchUsers(usersPage);
      } else {
        const errorData = await response.json();
        console.error('Erro ao remover usuário:', errorData);
        alert('Erro ao remover usuário: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao remover usuário. Verifique a conexão.');
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const res = await fetch('/api/help');
      if (res.ok) {
        const data = await res.json();
        setHelpRequests(data.helpRequests || []);
      }
    } catch {}
  };
  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/suggestion');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {}
  };

  const handleConcludeHelp = async (id: string) => {
    await fetch('/api/help', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setShowHelpDetail(null);
    fetchHelpRequests();
  };
  const handleConcludeSuggestion = async (id: string) => {
    await fetch('/api/suggestion', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setShowSuggestionDetail(null);
    fetchSuggestions();
  };

  // Componente Skeleton
  const Skeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 font-poppins">
              <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Skeleton para Sistema de Doações */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-600 rounded w-48"></div>
            <div className="h-12 bg-gray-600 rounded w-32"></div>
          </div>
        </div>

        {/* Skeleton para Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Skeleton para Progresso */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-600 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                <div className="h-2 bg-gray-600 rounded-full mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-20"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-600 rounded w-28 mb-2"></div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-12 h-12 bg-gray-600 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton para Tarefas Diárias */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
              <div className="ml-4">
                <div className="h-6 bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-48"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-600 rounded w-24"></div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-600 rounded w-full"></div>
          </div>
        </div>

        {/* Skeleton para Roleta */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-48 mb-6"></div>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Skeleton para Eventos e Notícias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-600 rounded w-24 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-600 rounded w-20 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="h-4 bg-gray-600 rounded w-36 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-28"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Seções reutilizáveis
  const doacoes = (
    <div className="container mx-auto px-4 mt-4">
      <DonationStatus />
    </div>
  );
  const progresso = (
    <div className="container mx-auto px-4 mt-8">
      {/* Seu Progresso e Meus Emblemas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Seção de Progresso */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">⭐ Seu Progresso</h2>
          <div className="space-y-4">
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-xs text-white">{user?.level}</span>
                </div>
                <span className="text-purple-300">Nível {user?.level}</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-purple-900/30 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="text-sm text-purple-200 mt-1">{100 - experience} até o próximo</div>
            </div>

            <div>
              <h3 className="text-white mb-2">Meus Emblemas</h3>
              <div className="bg-blue-900/50 rounded-lg p-4">
                {userBadges.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {userBadges.slice(0, 8).map((userBadge, index) => {
                      // Tenta pegar a imagem pelo nome do badge
                      const badgeName = userBadge.badge.name;
                      const badgeImg = badgeImages[badgeName] || userBadge.badge.image || null;
                      return (
                        <div key={index} className="relative group">
                          {badgeImg ? (
                            <div className="w-20 h-20 flex items-center justify-center bg-transparent">
                              <Image
                                src={badgeImg}
                                alt={badgeName}
                                width={80}
                                height={80}
                                className="object-contain mx-auto"
                                style={{ borderRadius: 20, background: 'transparent' }}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl cursor-help transition-transform hover:scale-110">
                              {userBadge.badge.icon}
                            </div>
                          )}
                          {/* Tooltip */}
                          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${
                            activeTooltip === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <div className="font-semibold mb-1">{badgeName}</div>
                            <div className="text-gray-300 text-xs">{userBadge.badge.description}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                          </div>
                        </div>
                      );
                    })}
                    {userBadges.length > 8 && (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">
                        +{userBadges.length - 8}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full mb-2"></div>
                    <p className="text-gray-400">Nenhum emblema conquistado ainda</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Participe de doações e atividades para ganhar seus primeiros emblemas!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Tarefas Diárias */}
        <div className="md:col-span-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-semibold text-white">Tarefas Diárias</h2>
                <p className="text-gray-400">
                  Teste seus conhecimentos sobre Habbo Etiqueta e ganhe pontos!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold">5 pontos</div>
                <div className="text-sm text-gray-400">por resposta correta</div>
              </div>
              <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                <div className="text-blue-400 font-bold">Renovação diária</div>
                <div className="text-sm text-gray-400">a cada 24 horas</div>
              </div>
            </div>

                          {taskStatus && !taskStatus.canDoTask ? (
                <div className="w-full py-6 text-center text-lg text-green-400 bg-green-900/20 rounded-lg font-semibold flex flex-col items-center justify-center gap-2">
                  <span>✅ Você já completou a tarefa de hoje!</span>
                  {taskStatus.nextAvailableAt && (
                    <span className="text-sm text-green-200 flex items-center gap-1">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
                      Próxima tarefa em: <span className="font-mono ml-1">{countdown}</span>
                    </span>
                  )}
                </div>
            ) : (
              <button 
                onClick={handleStartQuiz}
                className={`w-full py-3 rounded-lg font-medium transition-colors bg-purple-500 hover:bg-purple-600 text-white`}
                disabled={taskStatus ? !taskStatus.canDoTask : false}
              >
                {taskStatus && taskStatus.canDoTask ? 'Começar Tarefa Diária' : 'Volte amanhã para novas tarefas'}
              </button>
            )}

            <p className="text-sm text-gray-400 mt-4 text-center">
              💡 Dica: As tarefas são liberadas a cada 24 horas e testam seus conhecimentos sobre comportamento adequado no Habbo Hotel!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  const roleta = (
    <div className="container mx-auto px-4 mt-4">
      <RouletteWheel user={user} />
    </div>
  );
  const eventos = (
    <div className="container mx-auto px-4 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <h2 className="text-3xl font-bold text-white">
          Últimos Eventos
        </h2>
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <button 
            onClick={() => setShowAddEvent(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Adicionar Evento</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {events.length > 0 ? events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">{event.emoji}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                <p className="text-sm text-gray-400">{event.date}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">{event.description || 'Sem descrição'}</p>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                {event.type}
              </span>
              <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                {event.status}
              </span>
            </div>
          </div>
        )) : (
          <div className="md:col-span-3 text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento ainda</h3>
            <p className="text-gray-400">Fique atento para novos eventos em breve!</p>
          </div>
        )}
      </div>
    </div>
  );
  const noticias = (
    <div className="container mx-auto px-4 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <h2 className="text-3xl font-bold text-white">
          Últimas Notícias
        </h2>
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <button 
            onClick={() => setShowAddNews(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>📝</span>
            <span>Adicionar Notícia</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {news.length > 0 ? news.slice(0, 3).map((news) => (
          <div
            key={news.id}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{news.date}</span>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  {news.type}
                </span>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => {/* TODO: Implementar edição */}}
                      className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                      title="Editar notícia"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {/* TODO: Implementar exclusão */}}
                      className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                      title="Excluir notícia"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {news.title}
            </h3>
            <p className="text-gray-300">
              {news.description}
            </p>
          </div>
        )) : (
          <div className="md:col-span-3 text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma notícia ainda</h3>
            <p className="text-gray-400">Fique atento para novidades em breve!</p>
          </div>
        )}
      </div>
    </div>
  );
  const footer = (
    <footer className="py-8 bg-black/20">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-400">
          <p className="font-light">© 2025 T513 - Uma nova Era!</p>
          <p className="text-sm mt-2 font-light">
            Não afiliado oficialmente ao Habbo Hotel.
          </p>
        </div>
      </div>
    </footer>
  );
  // Seções específicas por role
  const pedidosResgate = user?.role === 'admin' ? (
    <div className="container mx-auto px-4 mt-6 mb-4">
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
            Pedidos de Resgate
            {redeemRequests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-yellow-900 bg-yellow-300 rounded-full">
                {redeemRequests.length}
              </span>
            )}
          </h2>
          <button
            onClick={fetchRedeemRequests}
            className="text-xs text-yellow-200 hover:text-yellow-100 bg-yellow-700/30 px-3 py-1 rounded-lg"
          >
            Atualizar
          </button>
        </div>
        {redeemRequests.length === 0 ? (
          <div className="text-yellow-200 text-sm">Nenhum pedido de resgate pendente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-yellow-100">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left">Usuário</th>
                  <th className="px-3 py-2 text-left">Pontos</th>
                  <th className="px-3 py-2 text-left">Câmbios</th>
                  <th className="px-3 py-2 text-left">Nível</th>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {redeemRequests.map((req) => (
                  <tr key={req.id} className="border-b border-yellow-800/30">
                    <td className="px-3 py-2">{req.user.nickname}</td>
                    <td className="px-3 py-2">{req.points}</td>
                    <td className="px-3 py-2">{req.amountC}</td>
                    <td className="px-3 py-2">{req.user.level}</td>
                    <td className="px-3 py-2">{new Date(req.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button onClick={() => handleApprove(req.id)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs">Aceitar</button>
                      <button onClick={() => handleReject(req.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs">Recusar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  ) : null;
  const listaUsuarios = (user?.role === 'admin' || user?.role === 'moderator') ? (
    <div className="container mx-auto px-4 mt-8 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">👥 Lista de Usuários</h2>
      {usersLoading ? (
        <div className="text-white">Carregando...</div>
      ) : (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left">Avatar</th>
                  <th className="px-3 py-2 text-left">Nick</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left">Pontos</th>
                  <th className="px-3 py-2 text-left">Nível</th>
                  <th className="px-3 py-2 text-left">Tarefas</th>
                  <th className="px-3 py-2 text-left">Criado em</th>
                  <th className="px-3 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/10">
                    <td className="px-3 py-2">
                      <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${u.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`} alt={u.nickname} className="w-10 h-10 rounded-full" />
                    </td>
                    <td className="px-3 py-2">{u.nickname}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'moderator' ? 'bg-purple-600 text-white' :
                        u.role === 'helper' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {u.role === 'moderator' ? 'Moderador' :
                         u.role === 'helper' ? 'Ajudante' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{u.points}</td>
                    <td className="px-3 py-2">{u.level}</td>
                    <td className="px-3 py-2">{u.tasksCompleted || 0}</td>
                    <td className="px-3 py-2">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-2 flex flex-wrap gap-2">
                      {/* Visualizar: ajudante, moderador, admin */}
                      {(user.role === 'admin' || user.role === 'moderator' || user.role === 'helper') && (
                        <button onClick={() => handleViewUser(u)} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs">Visualizar</button>
                      )}
                      {/* Eliminar: moderador, admin */}
                      {(user.role === 'admin' || user.role === 'moderator') && (
                        <button onClick={() => handleDeleteUser(u.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs">Eliminar</button>
                      )}
                      {/* Adicionar como ajudante: moderador, admin */}
                      {(user.role === 'admin' || user.role === 'moderator') && u.role === 'user' && (
                        <button onClick={() => handleMakeHelper(u.id)} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs">Adicionar como Ajudante</button>
                      )}
                      {/* Adicionar como moderador: apenas admin */}
                      {user.role === 'admin' && (u.role === 'user' || u.role === 'helper') && (
                        <button onClick={() => handleMakeModerator(u.id)} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs">Adicionar como Moderador</button>
                      )}
                      {/* Remover como ajudante: moderador, admin */}
                      {(user.role === 'admin' || user.role === 'moderator') && u.role === 'helper' && (
                        <button onClick={() => handleRemoveHelper(u.id)} className="px-2 py-1 bg-yellow-800 hover:bg-yellow-900 text-white rounded-lg text-xs">Remover como Ajudante</button>
                      )}
                      {/* Rebaixar moderador: apenas admin */}
                      {user.role === 'admin' && u.role === 'moderator' && (
                        <button onClick={() => handleRemoveHelper(u.id)} className="px-2 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs">Rebaixar Moderador</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="lg:hidden grid gap-4">
            {users.map((u) => (
              <div key={u.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${u.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`} 
                    alt={u.nickname} 
                    className="w-12 h-12 rounded-full flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">{u.nickname}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                      u.role === 'moderator' ? 'bg-purple-600 text-white' :
                      u.role === 'helper' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {u.role === 'moderator' ? 'Moderador' :
                       u.role === 'helper' ? 'Ajudante' : 'Usuário'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-300">Pontos:</span>
                    <span className="text-white font-semibold ml-2">{u.points}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Nível:</span>
                    <span className="text-white font-semibold ml-2">{u.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Tarefas:</span>
                    <span className="text-white font-semibold ml-2">{u.tasksCompleted || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Criado:</span>
                    <span className="text-white font-semibold ml-2 text-xs">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Visualizar: ajudante, moderador, admin */}
                  {(user.role === 'admin' || user.role === 'moderator' || user.role === 'helper') && (
                    <button onClick={() => handleViewUser(u)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">
                      👁️ Visualizar
                    </button>
                  )}
                  {/* Eliminar: moderador, admin */}
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">
                      🗑️ Eliminar
                    </button>
                  )}
                  {/* Adicionar como ajudante: moderador, admin */}
                  {(user.role === 'admin' || user.role === 'moderator') && u.role === 'user' && (
                    <button onClick={() => handleMakeHelper(u.id)} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium">
                      ⭐ Ajudante
                    </button>
                  )}
                  {/* Adicionar como moderador: apenas admin */}
                  {user.role === 'admin' && (u.role === 'user' || u.role === 'helper') && (
                    <button onClick={() => handleMakeModerator(u.id)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium">
                      👑 Moderador
                    </button>
                  )}
                  {/* Remover como ajudante: moderador, admin */}
                  {(user.role === 'admin' || user.role === 'moderator') && u.role === 'helper' && (
                    <button onClick={() => handleRemoveHelper(u.id)} className="px-3 py-2 bg-yellow-800 hover:bg-yellow-900 text-white rounded-lg text-xs font-medium">
                      ⭐ Remover
                    </button>
                  )}
                  {/* Rebaixar moderador: apenas admin */}
                  {user.role === 'admin' && u.role === 'moderator' && (
                    <button onClick={() => handleRemoveHelper(u.id)} className="px-3 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-medium">
                      👑 Rebaixar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button 
              onClick={() => {
                const newPage = usersPage - 1;
                setUsersPage(newPage);
                fetchUsers(newPage);
              }} 
              disabled={usersPage <= 1}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Anterior
            </button>
            <span className="text-white px-4 py-2">
              Página {usersPage} de {usersTotalPages}
            </span>
            <button 
              onClick={() => {
                const newPage = usersPage + 1;
                setUsersPage(newPage);
                fetchUsers(newPage);
              }} 
              disabled={usersPage >= usersTotalPages}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  ) : null;
  const pedidosAjuda = (user?.role === 'admin' || user?.role === 'moderator') ? (
    <div className="container mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Lista de Pedidos de Ajuda */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📢 Pedidos de Ajuda</h2>
        {helpRequests.length === 0 ? (
          <div className="text-gray-300">Nenhum pedido de ajuda pendente.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {helpRequests.map((h) => (
              <li key={h.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{h.subject}</div>
                  <div className="text-gray-300 text-sm">{h.user.nickname}</div>
                </div>
                <button onClick={() => setShowHelpDetail(h)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs">Visualizar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Lista de Sugestões */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Sugestões</h2>
        {suggestions.length === 0 ? (
          <div className="text-gray-300">Nenhuma sugestão pendente.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {suggestions.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{s.subject}</div>
                  <div className="text-gray-300 text-sm">{s.user.nickname}</div>
                </div>
                <button onClick={() => setShowSuggestionDetail(s)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs">Visualizar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  ) : null;
  const sugestoes = (user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'helper') ? (
    <div className="container mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Lista de Pedidos de Ajuda */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📢 Pedidos de Ajuda</h2>
        {helpRequests.length === 0 ? (
          <div className="text-gray-300">Nenhum pedido de ajuda pendente.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {helpRequests.map((h) => (
              <li key={h.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{h.subject}</div>
                  <div className="text-gray-300 text-sm">{h.user.nickname}</div>
                </div>
                <button onClick={() => setShowHelpDetail(h)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs">Visualizar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Lista de Sugestões */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Sugestões</h2>
        {suggestions.length === 0 ? (
          <div className="text-gray-300">Nenhuma sugestão pendente.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {suggestions.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{s.subject}</div>
                  <div className="text-gray-300 text-sm">{s.user.nickname}</div>
                </div>
                <button onClick={() => setShowSuggestionDetail(s)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs">Visualizar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  ) : null;
  const pedidoAjuda = user?.role === 'helper' ? (
    <div className="container mx-auto px-4 mt-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📢 Pedido de Ajuda</h2>
        {helpRequests.length === 0 ? (
          <div className="text-gray-300">Nenhum pedido de ajuda pendente.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {helpRequests.map((h) => (
              <li key={h.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{h.subject}</div>
                  <div className="text-gray-300 text-sm">{h.user.nickname}</div>
                </div>
                <button onClick={() => setShowHelpDetail(h)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs">Visualizar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  ) : null;

  // Renderização por role
  if (isLoading) {
    return <Skeleton />;
  }
  
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 font-poppins">
        <Header />
        {doacoes}
        {pedidosResgate}
        {roleta}
        {listaUsuarios}
        {sugestoes}
        {eventos}
        {noticias}
        {footer}
        {showQuiz && <DailyTaskQuiz onClose={handleCloseQuiz} />}
        {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onSuccess={handleEventSuccess} />}
        {showAddNews && <AddNewsModal onClose={() => setShowAddNews(false)} onSuccess={handleNewsSuccess} />}
        
        {/* Modal de Visualizar Usuário */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
              <div className="p-6">
                {/* Header do Modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">👤 Detalhes do Usuário</h2>
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="space-y-4">
                  {/* Avatar e Nome */}
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${selectedUser.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=l`} 
                      alt={selectedUser.nickname} 
                      className="w-16 h-16 rounded-full bg-white/10 p-1" 
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedUser.nickname}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.role === 'moderator' ? 'bg-purple-600 text-white' :
                        selectedUser.role === 'helper' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {selectedUser.role === 'moderator' ? 'Moderador' :
                         selectedUser.role === 'helper' ? 'Ajudante' : 'Usuário'}
                      </span>
                    </div>
                  </div>

                  {/* Informações Detalhadas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Pontos</span>
                      <div className="text-white font-bold text-lg">{selectedUser.points}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Nível</span>
                      <div className="text-white font-bold text-lg">{selectedUser.level}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Tarefas</span>
                      <div className="text-white font-bold text-lg">{selectedUser.tasksCompleted || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">ID</span>
                      <div className="text-white font-mono text-xs truncate">{selectedUser.id}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Email</span>
                    <div className="text-white font-medium truncate">{selectedUser.email}</div>
                  </div>

                  {/* Data de Criação */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Membro desde</span>
                    <div className="text-white font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <button 
                      onClick={() => {
                        setShowUserModal(false);
                        handleDeleteUser(selectedUser.id);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (user?.role === 'moderator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 font-poppins">
        <Header />
        {doacoes}
        {progresso}
        {roleta}
        {listaUsuarios}
        {sugestoes}
        {eventos}
        {noticias}
        {footer}
        {showQuiz && <DailyTaskQuiz onClose={handleCloseQuiz} />}
        {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onSuccess={handleEventSuccess} />}
        {showAddNews && <AddNewsModal onClose={() => setShowAddNews(false)} onSuccess={handleNewsSuccess} />}
        
        {/* Modal de Visualizar Usuário */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
              <div className="p-6">
                {/* Header do Modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">👤 Detalhes do Usuário</h2>
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="space-y-4">
                  {/* Avatar e Nome */}
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${selectedUser.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=l`} 
                      alt={selectedUser.nickname} 
                      className="w-16 h-16 rounded-full bg-white/10 p-1" 
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedUser.nickname}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.role === 'moderator' ? 'bg-purple-600 text-white' :
                        selectedUser.role === 'helper' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {selectedUser.role === 'moderator' ? 'Moderador' :
                         selectedUser.role === 'helper' ? 'Ajudante' : 'Usuário'}
                      </span>
                    </div>
                  </div>

                  {/* Informações Detalhadas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Pontos</span>
                      <div className="text-white font-bold text-lg">{selectedUser.points}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Nível</span>
                      <div className="text-white font-bold text-lg">{selectedUser.level}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Tarefas</span>
                      <div className="text-white font-bold text-lg">{selectedUser.tasksCompleted || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">ID</span>
                      <div className="text-white font-mono text-xs truncate">{selectedUser.id}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Email</span>
                    <div className="text-white font-medium truncate">{selectedUser.email}</div>
                  </div>

                  {/* Data de Criação */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Membro desde</span>
                    <div className="text-white font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <button 
                      onClick={() => {
                        setShowUserModal(false);
                        handleDeleteUser(selectedUser.id);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (user?.role === 'helper') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 font-poppins">
        <Header />
        {doacoes}
        {progresso}
        {roleta}
        {pedidoAjuda}
        {sugestoes}
        {eventos}
        {noticias}
        {footer}
        {showQuiz && <DailyTaskQuiz onClose={handleCloseQuiz} />}
        {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onSuccess={handleEventSuccess} />}
        {showAddNews && <AddNewsModal onClose={() => setShowAddNews(false)} onSuccess={handleNewsSuccess} />}
        
        {/* Modal de Visualizar Usuário */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
              <div className="p-6">
                {/* Header do Modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">👤 Detalhes do Usuário</h2>
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="space-y-4">
                  {/* Avatar e Nome */}
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${selectedUser.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=l`} 
                      alt={selectedUser.nickname} 
                      className="w-16 h-16 rounded-full bg-white/10 p-1" 
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedUser.nickname}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.role === 'moderator' ? 'bg-purple-600 text-white' :
                        selectedUser.role === 'helper' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {selectedUser.role === 'moderator' ? 'Moderador' :
                         selectedUser.role === 'helper' ? 'Ajudante' : 'Usuário'}
                      </span>
                    </div>
                  </div>

                  {/* Informações Detalhadas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Pontos</span>
                      <div className="text-white font-bold text-lg">{selectedUser.points}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Nível</span>
                      <div className="text-white font-bold text-lg">{selectedUser.level}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Tarefas</span>
                      <div className="text-white font-bold text-lg">{selectedUser.tasksCompleted || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">ID</span>
                      <div className="text-white font-mono text-xs truncate">{selectedUser.id}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Email</span>
                    <div className="text-white font-medium truncate">{selectedUser.email}</div>
                  </div>

                  {/* Data de Criação */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Membro desde</span>
                    <div className="text-white font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // User padrão
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 font-poppins">
      <Header />
      {doacoes}
      {progresso}
      {roleta}
      {eventos}
      {noticias}
      {footer}
      {showQuiz && <DailyTaskQuiz onClose={handleCloseQuiz} />}
      {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onSuccess={handleEventSuccess} />}
      {showAddNews && <AddNewsModal onClose={() => setShowAddNews(false)} onSuccess={handleNewsSuccess} />}
    </div>
  );
}

// Mapeamento dos nomes dos emblemas para imagens
const badgeImages: Record<string, string> = {
  'Bem-vindo': '/imagens/bem-vindo.png',
  'Primeiro Passo': '/imagens/primeiro-passo.png',
  'Estudioso': '/imagens/estudioso.png',
  'Dedicado': '/imagens/dedicado.png',
  'Persistente': '/imagens/persistente.png',
  'Lenda': '/imagens/lenda.png',
  '1 Doação': '/imagens/1-doacao.png',
  '5 Doações': '/imagens/5-doacoes.png',
  '10 Doações': '/imagens/10-doacoes.png',
  '20 Doações': '/imagens/20-doacoes.png',
  '40 Doações': '/imagens/40-doacoes.png',
};

// Dados mockados
const latestEvents = [
  {
    id: 1,
    title: "Mega Evento de Verão",
    date: "24/07",
    emoji: "🎮",
    type: "Evento Especial",
    status: "Em Breve"
  },
  {
    id: 2,
    title: "Caça ao Tesouro",
    date: "22/07",
    emoji: "🎯",
    type: "Competição",
    status: "Finalizado"
  },
  {
    id: 3,
    title: "Quiz da T513",
    date: "20/07",
    emoji: "🎲",
    type: "Quiz",
    status: "Finalizado"
  }
];

const latestNews = [
  {
    id: 1,
    title: "Nova Temporada de Eventos",
    date: "23/07",
    description: "Confira os próximos eventos que vão acontecer!",
    type: "Novidade"
  },
  {
    id: 2,
    title: "Sistema de Níveis Atualizado",
    date: "22/07",
    description: "Agora você ganha mais pontos por tarefa!",
    type: "Atualização"
  },
  {
    id: 3,
    title: "Novo Sistema de Emblemas",
    date: "21/07",
    description: "Desbloqueie emblemas especiais participando de eventos!",
    type: "Novidade"
  }
];