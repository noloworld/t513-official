// Função para calcular o multiplicador de pontos baseado no nível
export function getPointMultiplier(level: number): number {
  if (level >= 1 && level <= 19) return 1;
  if (level >= 20 && level <= 29) return 2;
  if (level >= 30 && level <= 39) return 3;
  if (level >= 40 && level <= 49) return 4;
  if (level >= 50 && level <= 59) return 5;
  if (level >= 60 && level <= 69) return 6;
  if (level >= 70 && level <= 79) return 7;
  if (level >= 80 && level <= 89) return 8;
  if (level >= 90 && level <= 99) return 9;
  if (level >= 100) return 10;
  
  return 1; // fallback
}

// Função para calcular pontos por pergunta baseado no nível
export function getPointsPerQuestion(level: number): number {
  const basePoints = 5;
  const multiplier = getPointMultiplier(level);
  return basePoints * multiplier;
}

// Função para calcular pontos totais de uma tarefa
export function calculateTaskPoints(level: number, correctAnswers: number): number {
  const pointsPerQuestion = getPointsPerQuestion(level);
  return correctAnswers * pointsPerQuestion;
}

// Função para calcular experiência necessária para o próximo nível
export function getExperienceForLevel(level: number): number {
  // Cada nível requer 100 pontos * nível atual
  return level * 100;
}

// Função para calcular o nível baseado nos pontos totais
export function calculateLevel(totalPoints: number): number {
  if (totalPoints <= 0) return 1;
  
  let level = 1;
  let accumulatedPoints = 0;
  
  // Calcular pontos necessários para cada nível
  for (let i = 1; i <= 100; i++) {
    const pointsForThisLevel = getExperienceForLevel(i);
    accumulatedPoints += pointsForThisLevel;
    
    if (totalPoints < accumulatedPoints) {
      return i;
    }
  }
  
  return 100; // Máximo nível
}

// Função para calcular pontos restantes para o próximo nível
export function getPointsToNextLevel(currentPoints: number, currentLevel: number): number {
  if (currentLevel >= 100) return 0;
  
  const pointsForCurrentLevel = Array.from({ length: currentLevel }, (_, i) => getExperienceForLevel(i + 1))
    .reduce((sum, points) => sum + points, 0);
  
  const pointsForNextLevel = pointsForCurrentLevel + getExperienceForLevel(currentLevel + 1);
  
  return pointsForNextLevel - currentPoints;
} 