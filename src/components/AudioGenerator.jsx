import { useState, useRef } from 'react';
import { Mic, Download, Play, Pause, Loader2, Video, Film, Fish, Sparkles } from 'lucide-react';
import { generateNarrationOpenAI, generateNarrationFish } from '../services/tts';
import { hasHfApiKey } from '../services/apiKey';

export default function AudioGenerator({ content }) {
  const [selectedScript, setSelectedScript] = useState('youtube');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [usedEngine, setUsedEngine] = useState(null);
  const audioRef = useRef(null);

  const getScriptText = () => {
    if (selectedScript === 'youtube') {
      return content.youtubeScript?.blocks?.map((b) => b.script).join('\n\n') || '';
    }
    const r = content.reelsScript;
    return r ? `${r.hook}\n\n${r.script}\n\n${r.callToAction}` : '';
  };

  const handleGenerate = async (engine) => {
    const text = getScriptText();
    if (!text) return;

    setLoading(true);
    setLoadingEngine(engine);
    setError(null);
    setAudioUrl(null);

    try {
      const url = engine === 'fish'
        ? await generateNarrationFish(text)
        : await generateNarrationOpenAI(text);
      setAudioUrl(url);
      setUsedEngine(engine);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingEngine(null);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    const ext = usedEngine === 'fish' ? 'wav' : 'mp3';
    a.download = `narracao-${selectedScript}-${usedEngine}-${Date.now()}.${ext}`;
    a.click();
  };

  const scriptPreview = getScriptText();
  const hfAvailable = hasHfApiKey();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-cream">Gerador de Narração</h2>
      <p className="text-cream-muted text-sm">
        Selecione o roteiro e escolha o modelo de voz para gerar a narração.
      </p>

      {/* Script Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setSelectedScript('youtube');
            setAudioUrl(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${
            selectedScript === 'youtube'
              ? 'bg-allos-500/15 border-allos-500/60 text-allos-300'
              : 'bg-allos-900/40 border-allos-800/50 text-cream-muted hover:border-allos-700/50'
          }`}
        >
          <Video className="w-4 h-4" />
          Roteiro YouTube
        </button>
        <button
          onClick={() => {
            setSelectedScript('reels');
            setAudioUrl(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${
            selectedScript === 'reels'
              ? 'bg-allos-500/15 border-allos-500/60 text-allos-300'
              : 'bg-allos-900/40 border-allos-800/50 text-cream-muted hover:border-allos-700/50'
          }`}
        >
          <Film className="w-4 h-4" />
          Roteiro Reels
        </button>
      </div>

      {/* Preview */}
      <div className="bg-allos-900/50 border border-allos-800/50 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-cream-muted mb-3">Prévia do texto para narração</h3>
        <div className="max-h-48 overflow-y-auto text-sm text-cream-dim leading-relaxed whitespace-pre-wrap">
          {scriptPreview || 'Nenhum roteiro disponível.'}
        </div>
        <p className="text-xs text-cream-muted/50 mt-3">
          {scriptPreview.split(/\s+/).filter(Boolean).length} palavras
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-300 text-sm">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Generate Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* OpenAI Button */}
        <button
          onClick={() => handleGenerate('openai')}
          disabled={loading || !scriptPreview}
          className="py-4 rounded-xl bg-gradient-to-r from-allos-600 to-allos-700 text-cream font-semibold hover:from-allos-500 hover:to-allos-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-allos-500/10 border border-allos-500/20"
        >
          {loadingEngine === 'openai' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span className="text-sm">
            {loadingEngine === 'openai' ? 'Gerando...' : 'Gerar com OpenAI'}
          </span>
          <span className="text-[10px] text-cream-muted font-normal">
            Voz Ash - TTS HD
          </span>
        </button>

        {/* Fish Speech Button */}
        <button
          onClick={() => handleGenerate('fish')}
          disabled={loading || !scriptPreview || !hfAvailable}
          title={!hfAvailable ? 'Configure a chave do Hugging Face nas configurações (botão API Key)' : ''}
          className={`py-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center gap-1.5 shadow-lg border ${
            hfAvailable
              ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-allos-950 hover:from-gold-500 hover:to-gold-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-500/10 border-gold-500/30'
              : 'bg-allos-900/30 text-cream-muted border-allos-800/30 cursor-not-allowed opacity-50'
          }`}
        >
          {loadingEngine === 'fish' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Fish className="w-5 h-5" />
          )}
          <span className="text-sm">
            {loadingEngine === 'fish' ? 'Gerando...' : 'Gerar com Fish Speech'}
          </span>
          <span className={`text-[10px] font-normal ${hfAvailable ? 'text-allos-900/60' : 'text-cream-muted/50'}`}>
            {hfAvailable ? 'Hugging Face - Voz natural' : 'Requer chave Hugging Face'}
          </span>
        </button>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-allos-900/50 border border-allos-800/50 rounded-2xl p-6 space-y-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-allos-500 text-cream flex items-center justify-center hover:bg-allos-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-cream font-medium">Narração gerada</p>
              <p className="text-cream-muted text-sm">
                {selectedScript === 'youtube' ? 'Roteiro YouTube' : 'Roteiro Reels'}
                {' — '}
                {usedEngine === 'fish' ? 'Fish Speech' : 'OpenAI Ash'}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 hover:bg-gold-500/25 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
