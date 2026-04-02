import { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import logoFull from '../assets/Logo.png';

export default function Dashboard({ onGenerate, loading }) {
  const [text, setText] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    try {
      const content = await parseFile(file);
      setText(content);
      setFileName(file.name);
    } catch (err) {
      alert(err.message);
    } finally {
      setFileLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onGenerate(text.trim(), specialInstructions.trim());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <img src={logoFull} alt="Allos" className="h-14 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-bold text-cream mb-3">
          Transforme texto acadêmico em conteúdo
        </h2>
        <p className="text-cream-muted text-lg">
          Upload de material ou cole seu texto para gerar mapas mentais, roteiros e narrações.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-allos-700/50 rounded-2xl p-10 text-center cursor-pointer hover:border-allos-500/60 hover:bg-allos-500/5 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
        {fileLoading ? (
          <Loader2 className="w-10 h-10 text-allos-400 mx-auto animate-spin" />
        ) : (
          <Upload className="w-10 h-10 text-allos-600 mx-auto mb-3" />
        )}
        <p className="text-cream-dim font-medium">
          {fileName || 'Clique para enviar um arquivo'}
        </p>
        <p className="text-cream-muted text-sm mt-1">PDF, TXT ou DOCX</p>
      </div>

      {/* Text Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-cream-dim mb-2">
          <FileText className="w-4 h-4 text-allos-400" />
          Texto Base
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o texto acadêmico, trecho de livro, resumo de PDF ou qualquer material que deseja transformar em conteúdo..."
          rows={10}
          className="w-full bg-allos-900/60 border border-allos-700/40 rounded-xl px-4 py-3 text-cream placeholder-cream-muted/50 focus:outline-none focus:ring-2 focus:ring-allos-500/40 focus:border-allos-500/60 resize-y text-sm"
        />
        <p className="text-xs text-cream-muted/60 mt-1">
          {text.length > 0 ? `${text.split(/\s+/).filter(Boolean).length} palavras` : ''}
        </p>
      </div>

      {/* Special Instructions */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-cream-dim mb-2">
          <AlertCircle className="w-4 h-4 text-gold-500" />
          Instruções Especiais (opcional)
        </label>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder='Ex: "Evite a interpretação comum de que...", "Foque na perspectiva de...", "O público-alvo são estudantes de graduação..."'
          rows={3}
          className="w-full bg-allos-900/60 border border-allos-700/40 rounded-xl px-4 py-3 text-cream placeholder-cream-muted/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 resize-y text-sm"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-allos-500 to-allos-600 text-cream font-semibold text-lg hover:from-allos-400 hover:to-allos-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-allos-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando ecossistema de conteúdo...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Gerar Ecossistema de Conteúdo
          </>
        )}
      </button>
    </div>
  );
}
