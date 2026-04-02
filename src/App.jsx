import { useState } from 'react';
import { Map, FileText, Mic, ChevronRight } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MindMapViewer from './components/MindMapViewer';
import ScriptEditor from './components/ScriptEditor';
import AudioGenerator from './components/AudioGenerator';
import { callOpenAI } from './services/openai';
import { MIND_MAP_SYSTEM_PROMPT, buildMindMapUserPrompt } from './prompts/mindMapPrompt';
import { CONTENT_SYSTEM_PROMPT, buildContentUserPrompt } from './prompts/contentPrompt';
import logoFull from './assets/Logo.png';
import logoSmall from './assets/smallwhitelogo.png';
import patternBg from './assets/whiteelement.png';

const STEPS = [
  { id: 'input', label: 'Input', icon: FileText },
  { id: 'mindmap', label: 'Mapa Mental', icon: Map },
  { id: 'scripts', label: 'Roteiros', icon: FileText },
  { id: 'audio', label: 'Narração', icon: Mic },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);
  const [contentData, setContentData] = useState(null);

  const handleGenerate = async (text, specialInstructions) => {
    setLoading(true);
    setError(null);

    try {
      const mindMap = await callOpenAI(
        MIND_MAP_SYSTEM_PROMPT,
        buildMindMapUserPrompt(text, specialInstructions)
      );
      setMindMapData(mindMap);
      setCurrentStep('mindmap');

      const content = await callOpenAI(
        CONTENT_SYSTEM_PROMPT,
        buildContentUserPrompt(mindMap)
      );
      setContentData(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (stepId) => {
    if (stepId === 'input') {
      setCurrentStep('input');
      return;
    }
    if (stepId === 'mindmap' && mindMapData) setCurrentStep('mindmap');
    if (stepId === 'scripts' && contentData) setCurrentStep('scripts');
    if (stepId === 'audio' && contentData) setCurrentStep('audio');
  };

  return (
    <div className="min-h-screen bg-allos-950 relative">
      {/* Subtle pattern background */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `url(${patternBg})`, backgroundSize: '400px' }}
      />

      <header className="border-b border-allos-800/60 bg-allos-950/90 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSmall} alt="Allos" className="w-9 h-9 opacity-90" />
              <div>
                <h1 className="text-lg font-bold text-cream leading-tight tracking-wide">
                  Allos <span className="text-allos-400 font-normal">Ensina</span>
                </h1>
                <p className="text-xs text-cream-muted">Ecossistema de Conteúdo Acadêmico</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted =
                  (step.id === 'input' && mindMapData) ||
                  (step.id === 'mindmap' && contentData) ||
                  (step.id === 'scripts' && contentData);

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => navigateTo(step.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-allos-500/15 text-allos-300'
                          : isCompleted
                          ? 'text-gold-500 hover:bg-allos-900/50'
                          : 'text-cream-muted cursor-default'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{step.label}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-allos-800 mx-1" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-300 text-sm">
            <strong>Erro:</strong> {error}
            <button onClick={() => setError(null)} className="ml-3 underline hover:no-underline">
              Fechar
            </button>
          </div>
        )}

        {currentStep === 'input' && (
          <Dashboard onGenerate={handleGenerate} loading={loading} />
        )}

        {currentStep === 'mindmap' && mindMapData && (
          <MindMapViewer
            data={mindMapData}
            onNext={() => contentData && setCurrentStep('scripts')}
            hasContent={!!contentData}
            loading={loading}
          />
        )}

        {currentStep === 'scripts' && contentData && (
          <ScriptEditor
            data={contentData}
            onNext={() => setCurrentStep('audio')}
          />
        )}

        {currentStep === 'audio' && contentData && (
          <AudioGenerator content={contentData} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-allos-800/40 mt-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <img src={logoFull} alt="Allos" className="h-6 opacity-40" />
          <p className="text-xs text-cream-muted/50">Associação Allos</p>
        </div>
      </footer>
    </div>
  );
}
