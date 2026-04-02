const STORAGE_KEY = 'allos_openai_api_key';

export function getApiKey() {
  const key = localStorage.getItem(STORAGE_KEY);
  if (!key) throw new Error('Chave da OpenAI não configurada. Configure nas configurações.');
  return key;
}

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function removeApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey() {
  return !!localStorage.getItem(STORAGE_KEY);
}
