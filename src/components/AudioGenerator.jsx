import { useState, useRef } from 'react';
import { Mic, Download, Play, Pause, Loader2, Video, Film, Fish, Sparkles } from 'lucide-react';
import { generateNarrationOpenAI, generateNarrationFish } from '../services/tts';
import { hasFishApiKey } from '../services/apiKey';

const OPENAI_VOICES = [
  { id: 'alloy', label: 'Alloy (neutro, equilibrado)' },
  { id: 'ash', label: 'Ash (confiante, articulado)' },
  { id: 'coral', label: 'Coral (calorosa, expressiva)' },
  { id: 'nova', label: 'Nova (jovem, animada)' },
  { id: 'sage', label: 'Sage (professoral, reflexivo)' },
  { id: 'shimmer', label: 'Shimmer (suave e calma)' },
];

const FISH_VOICES = [
  { id: '', label: 'Voz padrão Fish' },
  { id: '4744963f03b24efeb8e29b86aca419a0', label: 'Jair Bolsonaro' },
  { id: '102bccca7dc64b6b8f8494c199c5d153', label: 'Capitão Nascimento' },
  { id: '0889ee96fd82421b8ad9e126c4d73312', label: 'Iberê (Manual do Mundo)' },
  { id: 'd339e19362fc42dc8e3f4a6be653ff83', label: 'Naruto' },
  { id: 'dd4f0d11604541689cbb6c69de8067d9', label: 'Goku' },
  { id: '0be16728414f4400bc287f13fea51eed', label: 'Lula' },
];

export default function AudioGenerator({ content }) {
  const [selectedScript, setSelectedScript] = useState('youtube');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [usedEngine, setUsedEngine] = useState(null);
  const [usedVoiceLabel, setUsedVoiceLabel] = useState('');
  const [openaiVoice, setOpenaiVoice] = useState('sage');
  const [fishVoiceId, setFishVoiceId] = useState('');
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
      let url;
      if (engine === 'fish') {
        url = await generateNarrationFish(text, fishVoiceId || null);
        setUsedVoiceLabel(FISH_VOICES.find(v => v.id === fishVoiceId)?.label || 'Voz padrão');
      } else {
        url = await generateNarrationOpenAI(text, openaiVoice);
        setUsedVoiceLabel(OPENAI_VOICES.find(v => v.id === openaiVoice)?.label || openaiVoice);
      }
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
    a.download = `narracao-${selectedScript}-${usedEngine}-${Date.now()}.mp3`;
    a.click();
  };

  const scriptPreview = getScriptText();
  const fishAvailable = hasFishApiKey();

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

      {/* OpenAI Voice Selector */}
      <div className="bg-allos-900/40 border border-allos-800/40 rounded-xl p-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-allos-300 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Voz OpenAI
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {OPENAI_VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setOpenaiVoice(voice.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border text-left ${
                openaiVoice === voice.id
                  ? 'bg-allos-500/20 border-allos-500/50 text-allos-200'
                  : 'bg-allos-900/50 border-allos-700/30 text-cream-muted hover:border-allos-500/30 hover:text-cream-dim'
              }`}
            >
              {voice.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fish Voice Selector */}
      {fishAvailable && (
        <div className="bg-allos-900/40 border border-allos-800/40 rounded-xl p-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3">
            <Fish className="w-3.5 h-3.5" />
            Voz Fish Audio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FISH_VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setFishVoiceId(voice.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  fishVoiceId === voice.id
                    ? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
                    : 'bg-allos-900/50 border-allos-700/30 text-cream-muted hover:border-gold-500/30 hover:text-cream-dim'
                }`}
              >
                {voice.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
            {OPENAI_VOICES.find(v => v.id === openaiVoice)?.label || openaiVoice}
          </span>
        </button>

        {/* Fish Audio Button */}
        <button
          onClick={() => handleGenerate('fish')}
          disabled={loading || !scriptPreview || !fishAvailable}
          title={!fishAvailable ? 'Configure a chave do Fish Audio nas configurações (botão API Key)' : ''}
          className={`py-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center gap-1.5 shadow-lg border ${
            fishAvailable
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
            {loadingEngine === 'fish' ? 'Gerando...' : 'Gerar com Fish Audio'}
          </span>
          <span className={`text-[10px] font-normal ${fishAvailable ? 'text-allos-900/60' : 'text-cream-muted/50'}`}>
            {fishAvailable
              ? FISH_VOICES.find(v => v.id === fishVoiceId)?.label || 'Voz padrão'
              : 'Requer chave Fish Audio'}
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
                {usedVoiceLabel}
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
