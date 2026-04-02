# Allos Ensina

Gerador de Ecossistema de Conteúdo Acadêmico — transforma textos e materiais acadêmicos em mapas mentais, roteiros para YouTube, Reels, posts de carrossel para Instagram e narrações em áudio.

## Visão Geral

O Allos Ensina opera em um fluxo de duas etapas (Two-Step Chain):

1. **Agente Arquiteto de Mapas Mentais** — analisa o texto com rigor científico, mantendo fidelidade aos autores originais, e gera uma estrutura de mapa mental em JSON (nós, conexões e citações-chave).
2. **Agente Roteirista e Narrador** — a partir do mapa mental, produz roteiro de aula para YouTube, roteiro de Reels/Shorts e texto para carrossel de Instagram.

Opcionalmente, o usuário pode gerar narração em áudio (MP3) dos roteiros via OpenAI TTS.

## Funcionalidades

- Upload de arquivos PDF, TXT e DOCX ou input de texto direto
- Campo de "Instruções Especiais" para direcionar a análise da IA
- Visualização interativa do mapa mental com React Flow (arrastar, zoom, pan)
- Exibição de citações-chave extraídas do material original
- Roteiro de YouTube estruturado em blocos com notas de entonação
- Roteiro de Reels com gancho, roteiro e call to action
- Carrossel de Instagram com slides tipados (capa, conteúdo, final)
- Botão de copiar texto em cada roteiro
- Geração de narração em áudio com player integrado e download em MP3
- Interface dark com stepper de navegação entre etapas

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Ícones:** Lucide React
- **Mapa Mental:** @xyflow/react (React Flow)
- **Parser de arquivos:** pdfjs-dist (PDF), mammoth (DOCX)
- **IA:** OpenAI GPT-4o-mini (JSON mode)
- **Narração:** OpenAI TTS HD (voz Onyx)

## Pré-requisitos

- Node.js 18+
- Chave de API da OpenAI (usada tanto para IA quanto para narração)

## Instalação

```bash
git clone <url-do-repositorio>
cd allos-ensina
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto a partir do exemplo:

```bash
cp .env.example .env
```

Preencha as variáveis:

```env
VITE_OPENAI_API_KEY=sk-sua-chave-openai
```

## Executando

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── Dashboard.jsx         # Tela de input (upload + texto + instruções)
│   ├── MindMapViewer.jsx     # Visualização interativa do mapa mental
│   ├── ScriptEditor.jsx      # Editor de roteiros com abas (YouTube/Reels/Carrossel)
│   └── AudioGenerator.jsx    # Geração e reprodução de narração
├── services/
│   ├── openai.js             # Integração com API da OpenAI
│   └── tts.js                # Integração com OpenAI TTS
├── prompts/
│   ├── mindMapPrompt.js      # System prompt do Agente Arquiteto
│   └── contentPrompt.js      # System prompt do Agente Roteirista
├── utils/
│   └── fileParser.js         # Parser de PDF, TXT e DOCX
├── App.jsx                   # Componente principal com orquestração do fluxo
├── main.jsx                  # Entry point
└── index.css                 # Tailwind CSS
```

## Fluxo de Uso

1. **Input** — Faça upload de um arquivo ou cole o texto acadêmico. Opcionalmente, adicione instruções especiais (ex: "Foque na perspectiva de Lacan", "O público são estudantes de graduação").
2. **Mapa Mental** — Visualize o mapa mental gerado com os conceitos, subconceitos, exemplos práticos e citações. Arraste e faça zoom para explorar.
3. **Roteiros** — Navegue entre as abas YouTube, Reels e Carrossel para revisar e copiar os textos gerados.
4. **Narração** — Selecione o roteiro desejado (YouTube ou Reels), gere o áudio, ouça no player integrado e baixe o MP3.

## Licença

Uso privado.
