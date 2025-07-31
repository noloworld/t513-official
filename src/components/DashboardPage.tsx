"use client";

import { useTask } from "@/contexts/TaskContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DonationStatus from "@/components/DonationStatus";
import RouletteWheel from "@/components/RouletteWheel";
// Importe outros componentes necessários para as seções: Pedido de Ajuda, Sugestões, Lista de Usuários, Últimos Eventos, Últimas Notícias, Footer, etc.

export default function DashboardPage() {
  const { level, experience, participations, badges, dailyTaskAvailable } = useTask();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redeemRequests, setRedeemRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchRedeemRequests();
    }
  }, [loading, user, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e2875] to-[#0f1436] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Seções reutilizáveis
  const doacoes = <div className="container mx-auto px-4 mt-4"><DonationStatus /></div>;
  const progresso = (
    <div className="container mx-auto px-4 mt-8">
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
              {badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((badge, index) => (
                    <div key={index} className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  ))}
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
    </div>
  );
  const tarefas = (
    <div className="container mx-auto px-4 mt-4">
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

        <button 
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            dailyTaskAvailable 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'bg-gray-500 cursor-not-allowed text-gray-300'
          }`}
          disabled={!dailyTaskAvailable}
        >
          {dailyTaskAvailable ? 'Começar Tarefa Diária' : 'Volte amanhã para novas tarefas'}
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          💡 Dica: As tarefas são liberadas a cada 24 horas e testam seus conhecimentos sobre comportamento adequado no Habbo Hotel!
        </p>
      </div>
    </div>
  );
  const roleta = (
    <div className="container mx-auto px-4 mt-4">
      <RouletteWheel user={user} />
    </div>
  );
  // Outras seções: eventos, notícias, footer, etc.
  const eventos = (
    <div className="container mx-auto px-4 mt-4">{/* Últimos Eventos */}</div>
  );
  const noticias = (
    <div className="container mx-auto px-4 mt-4">{/* Últimas Notícias */}</div>
  );
  const footer = (
    <footer className="text-center text-gray-400 py-6">© 2025 T513 - Uma nova Era!</footer>
  );
  // Seções específicas por role (exemplo)
  const pedidosResgate = user?.role === 'admin' || user?.role === 'moderator' ? (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  ) : null;
  const listaUsuarios = user?.role === 'admin' || user?.role === 'moderator' ? (
    <div className="container mx-auto px-4 mt-4">
      {/* ...Lista de Usuários... */}
    </div>
  ) : null;
  const pedidosAjuda = user?.role === 'admin' || user?.role === 'moderator' ? (
    <div className="container mx-auto px-4 mt-4">
      {/* ...Pedidos de Ajuda... */}
    </div>
  ) : null;
  const sugestoes = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'helper' ? (
    <div className="container mx-auto px-4 mt-4">
      {/* ...Sugestões... */}
    </div>
  ) : null;
  const pedidoAjuda = user?.role === 'helper' ? (
    <div className="container mx-auto px-4 mt-4">
      {/* ...Pedido de Ajuda... */}
    </div>
  ) : null;

  // Renderização por role
  if (user?.role === 'admin') {
    return <>{doacoes}{pedidosResgate}{roleta}{listaUsuarios}{pedidosAjuda}{sugestoes}{eventos}{noticias}{footer}</>;
  }
  if (user?.role === 'moderator') {
    return <>{doacoes}{progresso}{tarefas}{roleta}{listaUsuarios}{pedidosAjuda}{sugestoes}{eventos}{noticias}{footer}</>;
  }
  if (user?.role === 'helper') {
    return <>{doacoes}{progresso}{tarefas}{roleta}{pedidoAjuda}{sugestoes}{eventos}{noticias}{footer}</>;
  }
  // User padrão
  return <>{doacoes}{progresso}{tarefas}{roleta}{eventos}{noticias}{footer}</>;
} 