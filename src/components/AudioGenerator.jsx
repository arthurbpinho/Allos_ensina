import { useState, useRef } from 'react';
import { Mic, Download, Play, Pause, Loader2, Video, Film } from 'lucide-react';
import { generateNarration } from '../services/tts';

export default function AudioGenerator({ content }) {
  const [selectedScript, setSelectedScript] = useState('youtube');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const getScriptText = () => {
    if (selectedScript === 'youtube') {
      return content.youtubeScript?.blocks?.map((b) => b.script).join('\n\n') || '';
    }
    const r = content.reelsScript;
    return r ? `${r.hook}\n\n${r.script}\n\n${r.callToAction}` : '';
  };

  const handleGenerate = async () => {
    const text = getScriptText();
    if (!text) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const url = await generateNarration(text);
      setAudioUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    a.download = `narracao-${selectedScript}-${Date.now()}.mp3`;
    a.click();
  };

  const scriptPreview = getScriptText();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-cream">Gerador de Narração</h2>
      <p className="text-cream-muted text-sm">
        Selecione o roteiro e gere a narração em áudio via OpenAI.
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

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !scriptPreview}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-allos-500 to-allos-600 text-cream font-semibold text-lg hover:from-allos-400 hover:to-allos-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-allos-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando narração...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Gerar Narração
          </>
        )}
      </button>

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
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 hover:bg-gold-500/25 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Baixar MP3
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
