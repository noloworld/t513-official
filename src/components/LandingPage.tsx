"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import DonationStatus from "./DonationStatus";
import { useTask } from "@/contexts/TaskContext";
import DailyTaskQuiz from "./DailyTaskQuiz";
import AddEventModal from "./AddEventModal";
import AddNewsModal from "./AddNewsModal";
import { useState, useEffect } from "react";
import Header from "./Header";

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { level, experience, participations, badges } = useTask();
  const [showQuiz, setShowQuiz] = useState(false);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [taskStatus, setTaskStatus] = useState<{ canDoTask: boolean; message?: string } | null>(null);
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

  // Buscar emblemas do usuário
  useEffect(() => {
    if (user) {
      fetchUserBadges();
      fetchTaskStatus();
    }
    fetchEvents();
    fetchNews();
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
      setTaskStatus({ canDoTask: data.canDoTask, message: data.message });
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
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este usuário? Essa ação não pode ser desfeita.')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchUsers(usersPage);
  };

  const handleMakeHelper = async (id: string) => {
    await fetch(`/api/users/${id}/make-helper`, { method: 'POST', credentials: 'include' });
    fetchUsers(usersPage);
  };

  const handleMakeModerator = async (id: string) => {
    await fetch(`/api/users/${id}/make-moderator`, { method: 'POST', credentials: 'include' });
    fetchUsers(usersPage);
  };

  const handleRemoveHelper = async (id: string) => {
    await fetch(`/api/users/${id}/remove-helper`, { method: 'POST', credentials: 'include' });
    fetchUsers(usersPage);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 font-poppins">
      {/* Header */}
      <Header />

      {/* Donation Status */}
      <div className="container mx-auto px-4 mt-4">
        <DonationStatus />
      </div>

      {/* Pedidos de Resgate para admin/moderador */}
      {user && (user.role === 'admin' || user.role === 'moderator') && (
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
      )}

      {/* Lista de Usuários */}
      {user && (user.role === 'admin' || user.role === 'moderator') && (
        <div className="container mx-auto px-4 mt-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">👥 Lista de Usuários</h2>
            {usersLoading ? (
              <div className="text-white">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-white">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left">Avatar</th>
                      <th className="px-3 py-2 text-left">Nick</th>
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
                          {user.role === 'admin' && u.role !== 'moderator' && (
                            <button onClick={() => handleMakeModerator(u.id)} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs">Adicionar como Moderador</button>
                          )}
                          {/* Remover como ajudante: moderador, admin */}
                          {(user.role === 'admin' || user.role === 'moderator') && u.role === 'helper' && (
                            <button onClick={() => handleRemoveHelper(u.id)} className="px-2 py-1 bg-yellow-800 hover:bg-yellow-900 text-white rounded-lg text-xs">Remover como Ajudante</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Paginação */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button disabled={usersPage === 1} onClick={() => setUsersPage(usersPage - 1)} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Anterior</button>
                  <span className="text-white">Página {usersPage} de {usersTotalPages}</span>
                  <button disabled={usersPage === usersTotalPages} onClick={() => setUsersPage(usersPage + 1)} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Próxima</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listas de Pedidos de Ajuda e Sugestões (admin/mod/helper) */}
      {user && ["admin", "moderator", "helper"].includes(user.role) && (
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
      )}

      {/* Seções para usuário logado */}
      {user && (
        <div className="container mx-auto px-4 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Seção de Progresso */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">⭐ Seu Progresso</h2>
              <div className="space-y-4">
                <div className="bg-purple-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-xs text-white">{user.level}</span>
                    </div>
                    <span className="text-purple-300">Nível {user.level}</span>
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
                        {userBadges.slice(0, 8).map((userBadge, index) => (
                          <div 
                            key={index} 
                            className="relative group"
                          >
                            <div 
                              className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl cursor-help transition-transform hover:scale-110"
                              onTouchStart={() => setActiveTooltip(index)}
                              onTouchEnd={() => setActiveTooltip(null)}
                            >
                              {userBadge.badge.icon}
                            </div>
                            
                            {/* Tooltip */}
                            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${
                              activeTooltip === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <div className="font-semibold mb-1">{userBadge.badge.name}</div>
                              <div className="text-gray-300 text-xs">{userBadge.badge.description}</div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                            </div>
                          </div>
                        ))}
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
                  <div className="w-full py-6 text-center text-lg text-green-400 bg-green-900/20 rounded-lg font-semibold">
                    <span>✅ {taskStatus.message || 'Você já completou a tarefa de hoje! Volte amanhã para mais pontos.'}</span>
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
      )}

      {/* Hero Section - Mostrar apenas quando não estiver logado */}
      {!user && (
        <section className="pt-16 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-6 animate-gradient tracking-tight">
                T513 SYSTEM
              </h1>
              <p className="text-2xl text-gray-300 mb-12 font-light tracking-wide">
                Uma nova era na comunidade Habbo!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mx-auto flex items-center justify-center mb-4">
                    <span className="text-3xl">🎮</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">
                    Eventos Exclusivos
                  </h3>
                  <p className="text-gray-300 font-light">
                    Participe e ganhe prêmios incríveis
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mx-auto flex items-center justify-center mb-4">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">
                    Sistema de Níveis
                  </h3>
                  <p className="text-gray-300 font-light">
                    Evolua e desbloqueie recompensas
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mx-auto flex items-center justify-center mb-4">
                    <span className="text-3xl">👑</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">
                    Comunidade Elite
                  </h3>
                  <p className="text-gray-300 font-light">
                    Faça parte do grupo mais exclusivo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Últimos Eventos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
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
      </section>

      {/* Últimas Notícias */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
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
      </section>

      {/* CTA - Mostrar apenas quando não estiver logado */}
      {!user && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-12 backdrop-blur-md">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Comece sua jornada agora!
                </h2>
                <p className="text-gray-300 mb-8">
                  Junte-se a milhares de jogadores e faça parte dessa comunidade incrível.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href="/auth/signin"
                    className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 transform hover:scale-105"
                  >
                    Fazer Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
                  >
                    Criar Conta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p className="font-light">© 2024 T513 System. Todos os direitos reservados.</p>
            <p className="text-sm mt-2 font-light">
              Não afiliado oficialmente ao Habbo Hotel.
            </p>
          </div>
        </div>
      </footer>

      {/* Quiz Modal */}
      {showQuiz && <DailyTaskQuiz onClose={handleCloseQuiz} />}

      {/* Modais de adicionar evento e notícia */}
      {showAddEvent && (
        <AddEventModal onClose={() => setShowAddEvent(false)} onSuccess={handleEventSuccess} />
      )}
      {showAddNews && (
        <AddNewsModal onClose={() => setShowAddNews(false)} onSuccess={handleNewsSuccess} />
      )}

      {/* Modal de Visualização de Usuário */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Informações do Usuário</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${selectedUser.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=l`} alt={selectedUser.nickname} className="w-24 h-24 rounded-full" />
              <div className="text-white text-lg font-bold">{selectedUser.nickname}</div>
              <div className="text-white text-sm">Nível: {selectedUser.level}</div>
              <div className="text-white text-sm">Pontos: {selectedUser.points}</div>
              <div className="text-white text-sm">Tarefas Realizadas: {selectedUser.tasksCompleted || 0}</div>
              <div className="text-white text-sm">Criado em: {new Date(selectedUser.createdAt).toLocaleString('pt-BR')}</div>
              <div className="text-white text-sm">E-mail: {selectedUser.email}</div>
              <div className="text-white text-sm">Role: {selectedUser.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhe do Pedido de Ajuda */}
      {showHelpDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowHelpDetail(null)}>×</button>
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Detalhe do Pedido de Ajuda</h2>
            <div className="mb-2"><span className="font-semibold">Assunto:</span> {showHelpDetail.subject}</div>
            <div className="mb-2"><span className="font-semibold">Descrição:</span> {showHelpDetail.description}</div>
            <div className="mb-2"><span className="font-semibold">Usuário:</span> {showHelpDetail.user.nickname} ({showHelpDetail.user.email})</div>
            <button onClick={() => handleConcludeHelp(showHelpDetail.id)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg mt-4">Concluído</button>
          </div>
        </div>
      )}
      {/* Modal de Detalhe da Sugestão */}
      {showSuggestionDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowSuggestionDetail(null)}>×</button>
            <h2 className="text-2xl font-bold mb-4 text-green-800">Detalhe da Sugestão</h2>
            <div className="mb-2"><span className="font-semibold">Assunto:</span> {showSuggestionDetail.subject}</div>
            <div className="mb-2"><span className="font-semibold">Descrição:</span> {showSuggestionDetail.description}</div>
            <div className="mb-2"><span className="font-semibold">Usuário:</span> {showSuggestionDetail.user.nickname} ({showSuggestionDetail.user.email})</div>
            <button onClick={() => handleConcludeSuggestion(showSuggestionDetail.id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-4">Concluído</button>
          </div>
        </div>
      )}

      {/* Modal de Aviso para Ajudante */}
      {showHelperNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Bem-vindo, Ajudante!</h2>
            <div className="mb-4 text-gray-800 space-y-2">
              <p>Como <b>ajudante</b>, você é responsável por auxiliar na organização das doações e manter a ordem nos eventos. Suas funções incluem:</p>
              <ul className="list-disc pl-6">
                <li>Ser chamado para realizar ou gerenciar uma doação.</li>
                <li>Expulsar usuários que estiverem causando baderna nos quartos de doação.</li>
                <li>Enviar falas para orientar sobre grupos e uso do site.</li>
                <li>Gerenciar pedidos de ajuda e sugestões no site.</li>
                <li>Participar normalmente das tarefas e eventos como jogador.</li>
              </ul>
              <p className="mt-2">Seja responsável e ajude a comunidade a crescer!</p>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="dontShowHelperNotice"
                checked={dontShowHelperNotice}
                onChange={e => setDontShowHelperNotice(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="dontShowHelperNotice" className="text-gray-700">Não mostrar novamente</label>
            </div>
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg"
              onClick={handleConfirmHelperNotice}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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