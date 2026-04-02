import { useState } from 'react';
import { KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import logoFull from '../assets/Logo.png';
import { getHfApiKey } from '../services/apiKey';

export default function ApiKeySetup({ onSave }) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [hfKey, setHfKey] = useState(getHfApiKey());
  const [showOpenai, setShowOpenai] = useState(false);
  const [showHf, setShowHf] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (openaiKey.trim()) {
      onSave(openaiKey.trim(), hfKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-allos-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src={logoFull} alt="Allos" className="h-12 mx-auto mb-6 opacity-80" />
          <h1 className="text-2xl font-bold text-cream mb-2">Bem-vindo ao Allos Ensina</h1>
          <p className="text-cream-muted text-sm">
            Configure suas chaves de API para usar a plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OpenAI Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-cream-dim mb-2">
              <KeyRound className="w-4 h-4 text-allos-400" />
              Chave da API OpenAI
              <span className="text-red-400 text-xs">(obrigatória)</span>
            </label>
            <div className="relative">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-allos-900/60 border border-allos-700/40 rounded-xl px-4 py-3 pr-12 text-cream placeholder-cream-muted/40 focus:outline-none focus:ring-2 focus:ring-allos-500/40 focus:border-allos-500/60 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
              >
                {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-cream-muted/50 mt-1">
              Usada para IA (GPT-4o-mini) e narração OpenAI TTS.{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-allos-400 underline">
                Criar chave
              </a>
            </p>
          </div>

          {/* HF Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-cream-dim mb-2">
              <KeyRound className="w-4 h-4 text-gold-500" />
              Chave do Hugging Face
              <span className="text-cream-muted text-xs">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type={showHf ? 'text' : 'password'}
                value={hfKey}
                onChange={(e) => setHfKey(e.target.value)}
                placeholder="hf_..."
                className="w-full bg-allos-900/60 border border-allos-700/40 rounded-xl px-4 py-3 pr-12 text-cream placeholder-cream-muted/40 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowHf(!showHf)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
              >
                {showHf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-cream-muted/50 mt-1">
              Necessária para narração com Fish Speech (voz mais natural).{' '}
              <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-gold-400 underline">
                Criar token
              </a>
            </p>
          </div>

          <button
            type="submit"
            disabled={!openaiKey.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-allos-500 to-allos-600 text-cream font-semibold hover:from-allos-400 hover:to-allos-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Salvar e continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-allos-900/40 border border-allos-800/40 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-allos-300">
            <ShieldCheck className="w-4 h-4" />
            Suas chaves estão seguras
          </div>
          <p className="text-xs text-cream-muted leading-relaxed">
            As chaves são armazenadas apenas no seu navegador (localStorage) e nunca são enviadas para nossos servidores.
            As chamadas são feitas diretamente do seu navegador para as APIs.
          </p>
        </div>
      </div>
    </div>
  );
}
