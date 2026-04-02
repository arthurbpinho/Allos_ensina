const OPENAI_KEY = 'allos_openai_api_key';
const HF_KEY = 'allos_hf_api_key';

// OpenAI
export function getApiKey() {
  const key = localStorage.getItem(OPENAI_KEY);
  if (!key) throw new Error('Chave da OpenAI não configurada. Configure nas configurações.');
  return key;
}

export function setApiKey(key) {
  localStorage.setItem(OPENAI_KEY, key.trim());
}

export function removeApiKey() {
  localStorage.removeItem(OPENAI_KEY);
}

export function hasApiKey() {
  return !!localStorage.getItem(OPENAI_KEY);
}

// Hugging Face
export function getHfApiKey() {
  return localStorage.getItem(HF_KEY) || '';
}

export function setHfApiKey(key) {
  localStorage.setItem(HF_KEY, key.trim());
}

export function removeHfApiKey() {
  localStorage.removeItem(HF_KEY);
}

export function hasHfApiKey() {
  return !!localStorage.getItem(HF_KEY);
}
