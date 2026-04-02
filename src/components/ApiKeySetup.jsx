import { useState } from 'react';
import { KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import logoFull from '../assets/Logo.png';

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="min-h-screen bg-allos-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src={logoFull} alt="Allos" className="h-12 mx-auto mb-6 opacity-80" />
          <h1 className="text-2xl font-bold text-cream mb-2">Bem-vindo ao Allos Ensina</h1>
          <p className="text-cream-muted text-sm">
            Para usar a plataforma, insira sua chave de API da OpenAI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-cream-dim mb-2">
              <KeyRound className="w-4 h-4 text-allos-400" />
              Chave da API OpenAI
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-allos-900/60 border border-allos-700/40 rounded-xl px-4 py-3 pr-12 text-cream placeholder-cream-muted/40 focus:outline-none focus:ring-2 focus:ring-allos-500/40 focus:border-allos-500/60 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-allos-500 to-allos-600 text-cream font-semibold hover:from-allos-400 hover:to-allos-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Salvar e continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-allos-900/40 border border-allos-800/40 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-allos-300">
            <ShieldCheck className="w-4 h-4" />
            Sua chave está segura
          </div>
          <p className="text-xs text-cream-muted leading-relaxed">
            A chave é armazenada apenas no seu navegador (localStorage) e nunca é enviada para nossos servidores.
            As chamadas são feitas diretamente do seu navegador para a API da OpenAI.
          </p>
        </div>

        <p className="text-center text-xs text-cream-muted/50">
          Não tem uma chave?{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-allos-400 hover:text-allos-300 underline"
          >
            Crie em platform.openai.com
          </a>
        </p>
      </div>
    </div>
  );
}
