
require('dotenv').config();

const key = process.env.GROQ_API_KEY || '';
const configuredModel = process.env.GROQ_MODEL || '(not set)';

console.log('--- Dayflow Groq diagnostic ---');
console.log('GROQ_API_KEY loaded:', key ? `yes (starts with "${key.slice(0, 6)}...", length ${key.length})` : 'NO — .env is missing GROQ_API_KEY or was not loaded');
console.log('GROQ_MODEL configured:', configuredModel);
console.log('');

if (!key) {
  console.log('Fix: open backend/.env and set GROQ_API_KEY=gsk_your-real-key-here');
  console.log('Get a key at https://console.groq.com/keys');
  process.exit(1);
}

if (!key.startsWith('gsk_')) {
  console.log('WARNING: a real Groq key normally starts with "gsk_". Yours does not.');
  console.log('You may have pasted a placeholder, a truncated key, or a key with extra quotes/spaces.');
}

(async () => {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const body = await res.json();

    if (res.status === 401) {
      console.log('Result: 401 Unauthorized — this API key is invalid, revoked, or mistyped.');
      console.log('Fix: generate a fresh key at https://console.groq.com/keys and paste it into .env exactly, with no quotes.');
      return;
    }

    if (!res.ok) {
      console.log(`Result: Groq returned HTTP ${res.status}`);
      console.log(JSON.stringify(body, null, 2));
      return;
    }

    const ids = (body.data || []).map((m) => m.id).sort();
    console.log(`Result: key is VALID. You have access to ${ids.length} models:\n`);
    ids.forEach((id) => console.log(id === configuredModel ? `  * ${id}   <-- currently configured` : `    ${id}`));

    if (!ids.includes(configuredModel)) {
      console.log(`\nYour .env GROQ_MODEL ("${configuredModel}") is NOT in this list.`);
      const suggestion = ids.find((id) => id.includes('instant')) || ids[0];
      if (suggestion) console.log(`Try setting: GROQ_MODEL=${suggestion}`);
    } else {
      console.log('\nYour configured GROQ_MODEL is valid — the chatbot should work.');
    }
  } catch (err) {
    console.log('Could not reach Groq at all:', err.message);
    console.log('Check your internet connection / firewall / proxy.');
  }
})();
