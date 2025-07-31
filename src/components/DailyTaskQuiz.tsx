"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  order: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuizResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface DailyTaskQuizProps {
  onClose: () => void;
}

export default function DailyTaskQuiz({ onClose }: DailyTaskQuizProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [nextTaskTimer, setNextTaskTimer] = useState(0);
  const [wasReloaded, setWasReloaded] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [showCompleteWarning, setShowCompleteWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTaskTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDailyTask();
    
    // Detectar se houve reload na página
    const wasReloaded = sessionStorage.getItem('taskReloaded');
    if (wasReloaded) {
      setWasReloaded(true);
      setShowReloadWarning(true);
      sessionStorage.removeItem('taskReloaded');
    }
    
    // Marcar que pode ter reload na próxima vez
    sessionStorage.setItem('taskReloaded', 'true');
    
    return () => {
      sessionStorage.removeItem('taskReloaded');
    };
  }, []);

  const fetchDailyTask = async () => {
    try {
      const response = await fetch('/api/tasks/daily', { credentials: 'include' });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao carregar tarefa');
        return;
      }

      if (!data.canDoTask) {
        setError(data.message);
        return;
      }

      setTask(data.task);
      setPointsPerQuestion(data.pointsPerQuestion);
    } catch (error) {
      setError('Erro ao carregar tarefa diária');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (task?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log("[DEBUG] handleSubmit chamado");
    console.log("[DEBUG] task:", task);
    console.log("[DEBUG] answers:", answers);
    console.log("[DEBUG] Object.keys(answers).length:", Object.keys(answers).length);
    console.log("[DEBUG] task?.questions.length:", task?.questions.length);
    
    if (!task || Object.keys(answers).length !== task.questions.length) {
      console.log("[DEBUG] Erro: não respondeu todas as perguntas");
      setError('Por favor, responda todas as perguntas');
      return;
    }

    setSubmitting(true);
    console.log("[DEBUG] Iniciando submissão...");
    
    try {
      const submitAnswers = task.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id]
      }));
      
      console.log("[DEBUG] submitAnswers:", submitAnswers);

      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          answers: submitAnswers
        })
      });

      console.log("[DEBUG] Response status:", response.status);
      const data = await response.json();
      console.log("[DEBUG] Response data:", data);

      if (!response.ok) {
        console.log("[DEBUG] Erro na resposta:", data.error);
        setError(data.error || 'Erro ao submeter respostas');
        return;
      }

      console.log("[DEBUG] Sucesso! Definindo resultados...");
      setResults(data.results);
      setQuizCompleted(true);
      
      // Iniciar timer para próxima tarefa (24 horas = 86400 segundos)
      setNextTaskTimer(86400);
      if (nextTaskTimerRef.current) clearInterval(nextTaskTimerRef.current);
      nextTaskTimerRef.current = setInterval(() => {
        setNextTaskTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    } catch (error) {
      console.error("[DEBUG] Erro catch:", error);
      setError('Erro ao submeter respostas');
    } finally {
      console.log("[DEBUG] Finalizando submissão");
      setSubmitting(false);
    }
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);
  const getOptionValue = (question: Question, letter: string) => {
    switch (letter) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
      default: return '';
    }
  };

  // Função para obter tempo por dificuldade
  const getTimeForDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 15;
      case 'MEDIUM': return 20;
      case 'HARD': return 25;
      default: return 15;
    }
  };

  // Função para formatar tempo restante
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Resetar timer ao trocar de pergunta
  useEffect(() => {
    if (!task) return;
    const currentQ = task.questions[currentQuestion];
    const time = getTimeForDifficulty((currentQ as any).difficulty || 'EASY');
    setTimer(time);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, task]);

  // Cleanup dos timers quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextTaskTimerRef.current) clearInterval(nextTaskTimerRef.current);
    };
  }, []);

  // Avançar automaticamente ao zerar o timer
  useEffect(() => {
    if (timer === 0 && task) {
      // Se não respondeu, avança sem resposta
      if (!answers[task.questions[currentQuestion].id]) {
        handleNext();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            Carregando tarefa diária...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Ops!</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && results) {
    const score = results.filter(r => r.isCorrect).length;
    const totalPoints = wasReloaded ? 0 : score * pointsPerQuestion;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Aviso de reload */}
          {showReloadWarning && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Aviso Importante</h3>
                  <p className="text-red-300 text-sm">
                    Como você deu reload na página, ganhou 0 pontos e só poderá completar a tarefa daqui a 24 horas.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {score === results.length ? '🎉' : score >= results.length / 2 ? '👍' : '😔'}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Quiz Concluído!</h3>
            <p className="text-gray-300">
              Você acertou {score} de {results.length} perguntas
            </p>
            <p className={`font-semibold ${wasReloaded ? 'text-red-400' : 'text-yellow-400'}`}>
              {wasReloaded ? '0 pontos ganhos (devido ao reload)' : `+${totalPoints} pontos ganhos!`}
            </p>
            
            {/* Timer para próxima tarefa */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl">
              <h4 className="text-blue-400 font-semibold mb-2">⏰ Próxima Tarefa Disponível em:</h4>
              <div className="text-2xl font-mono text-blue-300">
                {formatTimeRemaining(nextTaskTimer)}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {results.map((result, index) => (
              <div key={result.questionId} className="bg-black/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`text-2xl ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {result.isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-2">
                      {index + 1}. {result.questionText}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      Sua resposta: <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {result.userAnswer}) {result.options[result.userAnswer as keyof typeof result.options]}
                      </span>
                    </p>
                    {!result.isCorrect && (
                      <p className="text-sm text-green-400 mb-2">
                        Resposta correta: {result.correctAnswer}) {result.options[result.correctAnswer as keyof typeof result.options]}
                      </p>
                    )}
                    {!result.isCorrect && (
                      <p className="text-sm text-gray-400 bg-black/30 rounded p-2">
                        💡 {result.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const currentQ = task.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / task.questions.length) * 100;
  const allAnswered = Object.keys(answers).length === task.questions.length;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowCompleteWarning(true)}
    >
      <div 
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">{task.title}</h3>
            <p className="text-gray-400">Pergunta {currentQuestion + 1} de {task.questions.length}</p>
          </div>
          <div className="text-gray-400">
            🔒
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-4">
            {currentQ.questionText}
          </h4>
          
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <button
                key={letter}
                onClick={() => handleAnswerSelect(currentQ.id, letter)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answers[currentQ.id] === letter
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="font-medium">{letter})</span> {getOptionValue(currentQ, letter)}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={true}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg opacity-50 cursor-not-allowed"
            style={{ pointerEvents: 'none' }}
          >
            Anterior
          </button>
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {pointsPerQuestion} pontos por pergunta
            </p>
            <p className="text-yellow-400 text-lg font-bold mt-1">
              Tempo: {timer}s
            </p>
          </div>
          {currentQuestion === task.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Enviando...' : 'Finalizar'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          )}
        </div>
      </div>
      
      {/* Modal de aviso para completar tarefa */}
      {showCompleteWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-yellow-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-4">Complete a Tarefa Primeiro!</h3>
              <p className="text-gray-300 mb-6">
                Você precisa completar a tarefa diária antes de sair. 
                Não é possível cancelar uma vez iniciada.
              </p>
              <button
                onClick={() => setShowCompleteWarning(false)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Entendi, vou continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 