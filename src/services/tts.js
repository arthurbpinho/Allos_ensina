import { getApiKey, getHfApiKey } from './apiKey';

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const FISH_SPEECH_URL = 'https://router.huggingface.co/hf-inference/models/fishaudio/fish-speech-1.5';
const MAX_CHARS = 4000;

function cleanText(text) {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitText(text) {
  if (text.length <= MAX_CHARS) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHARS) {
      chunks.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf('. ', MAX_CHARS);
    if (splitAt === -1 || splitAt < MAX_CHARS * 0.5) {
      splitAt = remaining.lastIndexOf(' ', MAX_CHARS);
    }
    if (splitAt === -1) {
      splitAt = MAX_CHARS;
    } else {
      splitAt += 1;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks;
}

// ── OpenAI TTS ──

async function openaiTtsRequest(input) {
  const response = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input,
      voice: 'ash',
      response_format: 'mp3',
      speed: 1.1,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI TTS error: ${response.status}`);
  }

  return response.blob();
}

export async function generateNarrationOpenAI(text) {
  const chunks = splitText(cleanText(text));

  const blobs = [];
  for (const chunk of chunks) {
    const blob = await openaiTtsRequest(chunk);
    blobs.push(blob);
  }

  const combined = new Blob(blobs, { type: 'audio/mpeg' });
  return URL.createObjectURL(combined);
}

// ── Fish Speech (Hugging Face) ──

async function fishTtsRequest(input) {
  const hfKey = getHfApiKey();
  if (!hfKey) throw new Error('Chave do Hugging Face não configurada. Adicione nas configurações (botão API Key no header).');

  const response = await fetch(FISH_SPEECH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hfKey}`,
    },
    body: JSON.stringify({
      inputs: input,
    }),
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Modelo Fish Speech está carregando (cold start). Aguarde ~30s e tente novamente.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Fish Speech error: ${response.status}`);
  }

  return response.blob();
}

export async function generateNarrationFish(text) {
  const chunks = splitText(cleanText(text));

  const blobs = [];
  for (const chunk of chunks) {
    const blob = await fishTtsRequest(chunk);
    blobs.push(blob);
  }

  const combined = new Blob(blobs, { type: 'audio/mpeg' });
  return URL.createObjectURL(combined);
}
