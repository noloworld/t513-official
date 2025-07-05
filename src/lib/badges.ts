// Definição dos emblemas do sistema
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'registration' | 'tasks' | 'donations' | 'level';
  condition: string;
  requirement: number;
}

export const BADGES: BadgeDefinition[] = [
  // Emblema de Registro
  {
    id: 'welcome',
    name: 'Bem-vindo',
    description: 'Registrou-se na plataforma',
    icon: '🎉',
    category: 'registration',
    condition: 'register',
    requirement: 1
  },
  
  // Emblemas de Tarefas
  {
    id: 'first_task',
    name: 'Primeiro Passo',
    description: 'Completou sua primeira tarefa diária',
    icon: '🌟',
    category: 'tasks',
    condition: 'complete_tasks',
    requirement: 1
  },
  {
    id: 'task_10',
    name: 'Estudioso',
    description: 'Completou 10 tarefas diárias',
    icon: '📚',
    category: 'tasks',
    condition: 'complete_tasks',
    requirement: 10
  },
  {
    id: 'task_20',
    name: 'Dedicado',
    description: 'Completou 20 tarefas diárias',
    icon: '🎯',
    category: 'tasks',
    condition: 'complete_tasks',
    requirement: 20
  },
  {
    id: 'task_30',
    name: 'Persistente',
    description: 'Completou 30 tarefas diárias',
    icon: '🏆',
    category: 'tasks',
    condition: 'complete_tasks',
    requirement: 30
  },
  {
    id: 'task_40',
    name: 'Mestre das Tarefas',
    description: 'Completou 40 tarefas diárias',
    icon: '👑',
    category: 'tasks',
    condition: 'complete_tasks',
    requirement: 40
  },
  {
    id: 'task_50',
    name: 'Lenda',
    description: 'Completou 50 tarefas diárias',
    icon: '⭐',
    category: 'tasks',
    condition: 'complete_tasks',
    requirement: 50
  },
  
  // Emblemas de Doações
  {
    id: 'first_donation',
    name: 'Generoso',
    description: 'Participou de sua primeira doação',
    icon: '💝',
    category: 'donations',
    condition: 'participate_donations',
    requirement: 1
  },
  {
    id: 'donation_5',
    name: 'Benfeitor',
    description: 'Participou de 5 doações',
    icon: '🎁',
    category: 'donations',
    condition: 'participate_donations',
    requirement: 5
  },
  {
    id: 'donation_10',
    name: 'Filantropo',
    description: 'Participou de 10 doações',
    icon: '💎',
    category: 'donations',
    condition: 'participate_donations',
    requirement: 10
  },
  {
    id: 'donation_20',
    name: 'Mecenas',
    description: 'Participou de 20 doações',
    icon: '🏅',
    category: 'donations',
    condition: 'participate_donations',
    requirement: 20
  },
  {
    id: 'donation_40',
    name: 'Patrono',
    description: 'Participou de 40 doações',
    icon: '🥇',
    category: 'donations',
    condition: 'participate_donations',
    requirement: 40
  },
  {
    id: 'donation_50',
    name: 'Anjo da Caridade',
    description: 'Participou de 50 doações',
    icon: '😇',
    category: 'donations',
    condition: 'participate_donations',
    requirement: 50
  },
  
  // Emblemas de Nível
  {
    id: 'level_10',
    name: 'Novato',
    description: 'Alcançou o nível 10',
    icon: '🥉',
    category: 'level',
    condition: 'reach_level',
    requirement: 10
  },
  {
    id: 'level_25',
    name: 'Experiente',
    description: 'Alcançou o nível 25',
    icon: '🥈',
    category: 'level',
    condition: 'reach_level',
    requirement: 25
  },
  {
    id: 'level_50',
    name: 'Veterano',
    description: 'Alcançou o nível 50',
    icon: '🥇',
    category: 'level',
    condition: 'reach_level',
    requirement: 50
  },
  {
    id: 'level_75',
    name: 'Elite',
    description: 'Alcançou o nível 75',
    icon: '💫',
    category: 'level',
    condition: 'reach_level',
    requirement: 75
  },
  {
    id: 'level_100',
    name: 'Lendário',
    description: 'Alcançou o nível máximo 100',
    icon: '🌟',
    category: 'level',
    condition: 'reach_level',
    requirement: 100
  }
];

// Função para verificar quais emblemas um usuário deve ganhar
export function checkEarnedBadges(userStats: {
  tasksCompleted: number;
  donationsParticipated: number;
  level: number;
  isRegistered: boolean;
}): BadgeDefinition[] {
  const earnedBadges: BadgeDefinition[] = [];
  
  for (const badge of BADGES) {
    let shouldEarn = false;
    
    switch (badge.condition) {
      case 'register':
        shouldEarn = userStats.isRegistered;
        break;
      case 'complete_tasks':
        shouldEarn = userStats.tasksCompleted >= badge.requirement;
        break;
      case 'participate_donations':
        shouldEarn = userStats.donationsParticipated >= badge.requirement;
        break;
      case 'reach_level':
        shouldEarn = userStats.level >= badge.requirement;
        break;
    }
    
    if (shouldEarn) {
      earnedBadges.push(badge);
    }
  }
  
  return earnedBadges;
}

// Função para obter o próximo emblema a ser conquistado em uma categoria
export function getNextBadge(
  category: BadgeDefinition['category'],
  currentValue: number
): BadgeDefinition | null {
  const categoryBadges = BADGES.filter(badge => badge.category === category)
    .sort((a, b) => a.requirement - b.requirement);
  
  return categoryBadges.find(badge => currentValue < badge.requirement) || null;
} 