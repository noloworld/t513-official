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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDailyTask();
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
    if (!task || Object.keys(answers).length !== task.questions.length) {
      setError('Por favor, responda todas as perguntas');
      return;
    }

    setSubmitting(true);
    try {
      const submitAnswers = task.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id]
      }));

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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao submeter respostas');
        return;
      }

      setResults(data.results);
      setQuizCompleted(true);
    } catch (error) {
      setError('Erro ao submeter respostas');
    } finally {
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
    const totalPoints = score * pointsPerQuestion;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {score === results.length ? '🎉' : score >= results.length / 2 ? '👍' : '😔'}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Quiz Concluído!</h3>
            <p className="text-gray-300">
              Você acertou {score} de {results.length} perguntas
            </p>
            <p className="text-yellow-400 font-semibold">
              +{totalPoints} pontos ganhos!
            </p>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">{task.title}</h3>
            <p className="text-gray-400">Pergunta {currentQuestion + 1} de {task.questions.length}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
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
    </div>
  );
} 