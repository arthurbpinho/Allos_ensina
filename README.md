# Allos Ensina

Gerador de Ecossistema de Conteúdo Acadêmico — transforma textos e materiais acadêmicos em mapas mentais interativos, roteiros para YouTube, Reels, posts de carrossel para Instagram e narrações em áudio.

## Demo

Acesse: [arthurbpinho.github.io/Allos_ensina](https://arthurbpinho.github.io/Allos_ensina/)

## Visão Geral

O Allos Ensina opera em um fluxo de duas etapas (Two-Step Chain):

1. **Agente Arquiteto de Mapas Mentais** — analisa o texto com rigor científico, mantendo fidelidade aos autores originais, e gera um mapa mental denso (40-60 nós) com parágrafos completos, pontos-chave e citações por nó.
2. **Agente Roteirista e Narrador** — percorre o mapa mental como uma visita guiada, gerando roteiro de aula para YouTube, roteiro de Reels/Shorts e texto para carrossel de Instagram.

O usuário pode então gerar narração em áudio dos roteiros via **OpenAI TTS** (6 vozes) ou **Fish Audio** (vozes personalizadas em PT-BR), e baixar o mapa mental como HTML interativo para acompanhar a narração.

## Funcionalidades

- Upload de arquivos PDF, TXT e DOCX ou input de texto direto
- Campo de "Instruções Especiais" para direcionar a análise da IA
- Mapa mental interativo com React Flow (4 níveis de profundidade, nós clicáveis com painel lateral)
- MiniMap para navegação rápida em mapas grandes
- Download do mapa mental como HTML standalone (abre offline em qualquer navegador)
- Roteiro de YouTube estruturado como narração guiada do mapa, com notas de entonação
- Roteiro de Reels com gancho, roteiro e call to action
- Carrossel de Instagram com slides tipados (capa, conteúdo, final)
- Botão de copiar texto em cada roteiro
- Dois motores de narração com seletores de voz:
  - **OpenAI TTS HD** — Alloy, Ash, Coral, Nova, Sage, Shimmer
  - **Fish Audio** — vozes personalizadas (Bolsonaro, Capitão Nascimento, Iberê, Naruto, Goku, Lula)
- Player de áudio integrado com download em MP3
- Chaves de API armazenadas apenas no localStorage do navegador (seguro para deploy público)
- Identidade visual da Associação Allos

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Ícones:** Lucide React
- **Mapa Mental:** @xyflow/react (React Flow)
- **Parser de arquivos:** pdfjs-dist (PDF), mammoth (DOCX)
- **IA:** OpenAI GPT-4o-mini (JSON mode)
- **Narração:** OpenAI TTS HD + Fish Audio (via Cloudflare Worker proxy)
- **Deploy:** GitHub Pages + GitHub Actions
- **CORS Proxy:** Cloudflare Worker (para Fish Audio)

## Pré-requisitos

- Node.js 18+
- Chave de API da OpenAI (obrigatória — usada para IA e narração OpenAI)
- Chave de API do Fish Audio (opcional — para narração com vozes personalizadas)

## Instalação

```bash
git clone https://github.com/arthurbpinho/Allos_ensina.git
cd Allos_ensina
npm install
```

## Executando

```bash
npm run dev
```

Acesse `http://localhost:5173/Allos_ensina/`.

Ao abrir o app pela primeira vez, uma tela de setup pedirá suas chaves de API. As chaves ficam salvas no localStorage do navegador.

## Build de produção

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

O deploy é automático via GitHub Actions a cada push na branch `main`. O workflow está em `.github/workflows/deploy.yml`.

Para configurar em um fork:
1. Vá em Settings → Pages → Source → selecione **GitHub Actions**
2. Push na branch `main`

## Cloudflare Worker (CORS Proxy para Fish Audio)

O Fish Audio não envia headers CORS, então um Cloudflare Worker é usado como proxy. Para configurar:

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Create Worker
2. Nomeie como `fish-proxy`
3. Deploy, depois clique em Edit Code
4. Cole o conteúdo de `cloudflare-worker/worker.js`
5. Deploy novamente
6. Atualize a URL do worker em `src/services/tts.js` se necessário

## Estrutura do Projeto

```
src/
├── components/
│   ├── ApiKeySetup.jsx       # Tela de configuração de chaves de API
│   ├── Dashboard.jsx         # Tela de input (upload + texto + instruções)
│   ├── MindMapViewer.jsx     # Visualização interativa do mapa mental
│   ├── ScriptEditor.jsx      # Editor de roteiros com abas (YouTube/Reels/Carrossel)
│   └── AudioGenerator.jsx    # Narração com seletores de voz (OpenAI + Fish)
├── services/
│   ├── apiKey.js             # Gerenciamento de chaves (localStorage)
│   ├── openai.js             # Integração com API da OpenAI (chat)
│   └── tts.js                # TTS: OpenAI + Fish Audio com chunking
├── prompts/
│   ├── mindMapPrompt.js      # System prompt do Agente Arquiteto
│   └── contentPrompt.js      # System prompt do Agente Roteirista (narração guiada)
├── utils/
│   ├── fileParser.js         # Parser de PDF, TXT e DOCX
│   └── exportMindMap.js      # Gerador de HTML standalone do mapa mental
├── assets/                   # Logos e elementos visuais da Allos
├── App.jsx                   # Componente principal com orquestração do fluxo
├── main.jsx                  # Entry point
└── index.css                 # Tailwind CSS com tema Allos
cloudflare-worker/
└── worker.js                 # CORS proxy para Fish Audio
```

## Fluxo de Uso

1. **Configuração** — Na primeira vez, insira sua chave OpenAI (obrigatória) e Fish Audio (opcional).
2. **Input** — Faça upload de um arquivo ou cole o texto acadêmico. Opcionalmente, adicione instruções especiais.
3. **Mapa Mental** — Visualize o mapa mental interativo. Clique nos nós para ver conteúdo completo no painel lateral. Baixe o mapa como HTML para acompanhar offline.
4. **Roteiros** — Navegue entre as abas YouTube, Reels e Carrossel para revisar e copiar os textos gerados.
5. **Narração** — Escolha a voz (OpenAI ou Fish Audio), gere o áudio, ouça no player integrado e baixe o MP3.

## Licença

Uso privado — Associação Allos.
