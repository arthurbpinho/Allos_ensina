const OPENAI_KEY = 'allos_openai_api_key';
const FISH_KEY = 'allos_fish_api_key';

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

// Fish Audio
export function getFishApiKey() {
  const key = localStorage.getItem(FISH_KEY);
  if (!key) throw new Error('Chave do Fish Audio não configurada. Adicione nas configurações (botão API Key no header).');
  return key;
}

export function setFishApiKey(key) {
  localStorage.setItem(FISH_KEY, key.trim());
}

export function removeFishApiKey() {
  localStorage.removeItem(FISH_KEY);
}

export function hasFishApiKey() {
  return !!localStorage.getItem(FISH_KEY);
}
