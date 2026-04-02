import { getApiKey } from './apiKey';

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const MAX_CHARS = 4000;

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

async function ttsRequest(input) {
  const response = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input,
      voice: 'onyx',
      response_format: 'mp3',
      speed: 1.15,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI TTS error: ${response.status}`);
  }

  return response.blob();
}

export async function generateNarration(text) {
  const cleanText = text
    .replace(/\[.*?\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const chunks = splitText(cleanText);

  const blobs = [];
  for (const chunk of chunks) {
    const blob = await ttsRequest(chunk);
    blobs.push(blob);
  }

  const combined = new Blob(blobs, { type: 'audio/mpeg' });
  return URL.createObjectURL(combined);
}
