import { useState } from 'react';
import {
  Video,
  Film,
  LayoutGrid,
  ArrowRight,
  Clock,
  Copy,
  Check,
} from 'lucide-react';

const TABS = [
  { id: 'youtube', label: 'YouTube', icon: Video },
  { id: 'reels', label: 'Reels', icon: Film },
  { id: 'carousel', label: 'Carrossel', icon: LayoutGrid },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-allos-800/60 text-cream-dim hover:bg-allos-700/50 text-xs transition-colors border border-allos-700/30"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-gold-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}

function YoutubeTab({ data }) {
  if (!data) return null;

  const fullScript = data.blocks?.map((b) => b.script).join('\n\n') || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-cream">{data.title}</h3>
          <p className="text-cream-muted text-sm flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5" />
            {data.estimatedDuration}
          </p>
        </div>
        <CopyButton text={fullScript} />
      </div>

      <div className="space-y-3">
        {data.blocks?.map((block) => (
          <div
            key={block.blockNumber}
            className="bg-allos-900/50 border border-allos-800/50 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-allos-500/20 text-allos-300 flex items-center justify-center text-xs font-bold">
                  {block.blockNumber}
                </span>
                <h4 className="text-allos-300 font-semibold text-sm">{block.blockName}</h4>
              </div>
              <span className="text-cream-muted text-xs">{block.estimatedTime}</span>
            </div>
            {block.toneNote && (
              <span className="inline-block text-xs text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded mb-3 border border-gold-500/20">
                {block.toneNote}
              </span>
            )}
            <p className="text-cream-dim text-sm leading-relaxed whitespace-pre-wrap">
              {block.script}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReelsTab({ data }) {
  if (!data) return null;

  const fullScript = `GANCHO: ${data.hook}\n\n${data.script}\n\nCTA: ${data.callToAction}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-cream">{data.title}</h3>
          <p className="text-cream-muted text-sm flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5" />
            {data.duration}
          </p>
        </div>
        <CopyButton text={fullScript} />
      </div>

      <div className="bg-allos-900/50 border border-allos-800/50 rounded-xl p-5 space-y-4">
        <div>
          <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">
            Gancho (3s)
          </span>
          <p className="text-cream font-semibold mt-1">{data.hook}</p>
        </div>
        <hr className="border-allos-800/60" />
        <div>
          <span className="text-xs font-semibold text-allos-400 uppercase tracking-wider">
            Roteiro
          </span>
          <p className="text-cream-dim text-sm leading-relaxed mt-1 whitespace-pre-wrap">
            {data.script}
          </p>
        </div>
        <hr className="border-allos-800/60" />
        <div>
          <span className="text-xs font-semibold text-allos-300 uppercase tracking-wider">
            Call to Action
          </span>
          <p className="text-cream-dim text-sm mt-1">{data.callToAction}</p>
        </div>
      </div>
    </div>
  );
}

function CarouselTab({ data }) {
  if (!data) return null;

  const fullText = data.slides
    ?.map(
      (s) =>
        `[Slide ${s.slideNumber}] ${s.title}\n${s.body || s.subtitle || ''}\n${s.highlight || ''}${s.callToAction || ''}`
    )
    .join('\n\n');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-cream">
          Carrossel Instagram ({data.totalSlides} slides)
        </h3>
        <CopyButton text={fullText} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.slides?.map((slide) => (
          <div
            key={slide.slideNumber}
            className={`rounded-xl p-5 border ${
              slide.type === 'capa'
                ? 'bg-gradient-to-br from-allos-800/60 to-allos-900/80 border-allos-500/40'
                : slide.type === 'final'
                ? 'bg-gradient-to-br from-allos-800/40 to-allos-900/60 border-gold-500/30'
                : 'bg-allos-900/50 border-allos-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                Slide {slide.slideNumber}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  slide.type === 'capa'
                    ? 'bg-allos-500/20 text-allos-300'
                    : slide.type === 'final'
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'bg-allos-800/40 text-cream-muted'
                }`}
              >
                {slide.type}
              </span>
            </div>
            <h4 className="text-cream font-semibold text-sm mb-2">{slide.title}</h4>
            {slide.subtitle && (
              <p className="text-cream-muted text-xs">{slide.subtitle}</p>
            )}
            {slide.body && (
              <p className="text-cream-dim text-sm leading-relaxed">{slide.body}</p>
            )}
            {slide.highlight && (
              <p className="text-gold-400 text-xs font-medium mt-2 italic">
                "{slide.highlight}"
              </p>
            )}
            {slide.callToAction && (
              <p className="text-allos-300 text-xs font-medium mt-2">
                {slide.callToAction}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScriptEditor({ data, onNext }) {
  const [activeTab, setActiveTab] = useState('youtube');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cream">Roteiros Gerados</h2>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-allos-500 text-cream font-medium hover:bg-allos-400 transition-colors text-sm"
        >
          Gerar Narração
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-allos-900/60 rounded-xl p-1 border border-allos-800/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-allos-500 text-cream'
                  : 'text-cream-muted hover:text-cream-dim hover:bg-allos-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'youtube' && <YoutubeTab data={data.youtubeScript} />}
        {activeTab === 'reels' && <ReelsTab data={data.reelsScript} />}
        {activeTab === 'carousel' && <CarouselTab data={data.carouselPost} />}
      </div>
    </div>
  );
}
