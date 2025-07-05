"use client";
import { useState } from "react";

interface RedeemPointsModalProps {
  userPoints: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RedeemPointsModal({ userPoints, onClose, onSuccess }: RedeemPointsModalProps) {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const amountC = Math.floor(points / 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) setPoints(0);
    else setPoints(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (points < 10 || points > userPoints) {
      setError("Insira uma quantidade válida de pontos (mínimo 10, máximo " + userPoints + ")");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ points })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Erro ao solicitar resgate");
        setLoading(false);
        return;
      }
      setSuccess(true);
      onSuccess();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError("Erro ao solicitar resgate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Resgatar Pontos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Pontos para resgatar *</label>
            <input
              type="number"
              min={10}
              max={userPoints}
              step={10}
              value={points}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Ex: 100"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Você possui <b>{userPoints}</b> pontos.</p>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Você irá receber</label>
            <div className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white text-lg">
              <span className="font-bold text-yellow-400">{amountC}</span> câmbios (1C a cada 10 pontos)
            </div>
          </div>
          {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}
          {success && <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-lg">Solicitação enviada!</div>}
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50">{loading ? "Enviando..." : "Resgatar Pontos"}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 