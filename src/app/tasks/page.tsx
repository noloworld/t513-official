"use client";

import { useState } from "react";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export default function Tasks() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "Qual é a forma correta de se comportar em um quarto público?",
      options: [
        "Gritar e fazer spam",
        "Respeitar os outros usuários e seguir as regras do quarto",
        "Ignorar todos os usuários",
        "Fazer flood de emotes",
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "O que você deve fazer se alguém está te incomodando?",
      options: [
        "Xingar de volta",
        "Fazer spam no quarto",
        "Reportar e ignorar o usuário",
        "Chamar seus amigos para brigar",
      ],
      correctAnswer: 2,
    },
  ];

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
  };

  const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;

  return (
    <div className="min-h-screen bg-[#13141f] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-[#1a1b26] rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white text-center">Tarefas Diárias</h1>
            <p className="mt-2 text-center text-gray-400">
              Responda 5 perguntas sobre a Habbo Etiqueta
            </p>
            <div className="mt-6 bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-white">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? isSubmitted
                          ? isCorrect
                            ? "bg-green-500/20 border-green-500 text-green-400"
                            : "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "border-gray-700 text-gray-300 hover:bg-white/5"
                    }`}
                    onClick={() => !isSubmitted && setSelectedAnswer(index)}
                    disabled={isSubmitted}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {!isSubmitted ? (
                <button
                  className={`w-full py-4 rounded-lg font-medium transition-colors ${
                    selectedAnswer !== null
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </button>
              ) : (
                <button
                  className="w-full py-4 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-colors"
                  onClick={() => {
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1);
                      setSelectedAnswer(null);
                      setIsSubmitted(false);
                    }
                  }}
                >
                  {currentQuestion < questions.length - 1
                    ? "Próxima Pergunta"
                    : "Finalizar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 