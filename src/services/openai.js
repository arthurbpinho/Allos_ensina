import { getApiKey } from './apiKey';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function repairTruncatedJson(text) {
  // Try parsing as-is first
  try {
    return JSON.parse(text);
  } catch {}

  // Try closing open brackets/braces from the end
  let repaired = text.trimEnd();

  // Remove trailing incomplete key-value (e.g. `"key": "some truncat`)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, '');
  repaired = repaired.replace(/,\s*$/, '');

  // Count open brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const ch of repaired) {
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // Close any remaining open structures
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  try {
    return JSON.parse(repaired);
  } catch {
    throw new Error('A resposta da IA foi truncada e não pôde ser reparada. Tente novamente com um texto menor.');
  }
}

export async function callOpenAI(systemPrompt, userPrompt) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_completion_tokens: 16384,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const choice = data.choices[0];
  const content = choice?.message?.content;

  if (!content) throw new Error('Resposta vazia da OpenAI');

  // If finish_reason is 'length', the JSON is likely truncated
  if (choice.finish_reason === 'length') {
    console.warn('Resposta truncada pela OpenAI, tentando reparar JSON...');
    return repairTruncatedJson(content);
  }

  return JSON.parse(content);
}
