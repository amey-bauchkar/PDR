const fs = require('fs');
const lines = fs.readFileSync('C:/Users/shubham dixit/.gemini/antigravity-ide/brain/39cb702b-fac6-4abe-88d5-7f16e8e03e94/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    const match = line.match(/eyJ2I[^'\"]+/);
    if (match) {
      console.log('KEY:', match[0]);
      break;
    }
  }
}
