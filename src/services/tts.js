import { getApiKey, getFishApiKey } from './apiKey';

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const FISH_TTS_URL = 'https://api.fish.audio/v1/tts';
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
    blobs.push(await openaiTtsRequest(chunk));
  }
  return URL.createObjectURL(new Blob(blobs, { type: 'audio/mpeg' }));
}

// ── Fish Audio TTS ──

// Default voice: use null for Fish default, or set a reference_id
// Users can browse voices at https://fish.audio and copy the model ID from the URL
const FISH_DEFAULT_REFERENCE_ID = null;

async function fishTtsRequest(input, referenceId) {
  const body = {
    text: input,
    format: 'mp3',
    mp3_bitrate: 128,
    normalize: true,
    latency: 'normal',
    prosody: {
      speed: 1,
      volume: 0,
    },
  };

  if (referenceId) {
    body.reference_id = referenceId;
  }

  const response = await fetch(FISH_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getFishApiKey()}`,
      'model': 'speech-1.5',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.detail || `Fish Audio error: ${response.status}`);
  }

  return response.blob();
}

export async function generateNarrationFish(text, referenceId = FISH_DEFAULT_REFERENCE_ID) {
  const chunks = splitText(cleanText(text));
  const blobs = [];
  for (const chunk of chunks) {
    blobs.push(await fishTtsRequest(chunk, referenceId));
  }
  return URL.createObjectURL(new Blob(blobs, { type: 'audio/mpeg' }));
}
