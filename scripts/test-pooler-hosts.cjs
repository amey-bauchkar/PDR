const pg = require('pg');
const { Client } = pg;

const hosts = [
  'aws-0-ap-northeast-2.pooler.supabase.com',
  'aws-1-ap-northeast-2.pooler.supabase.com',
  'aws-2-ap-northeast-2.pooler.supabase.com',
  'aws-3-ap-northeast-2.pooler.supabase.com'
];

const ports = [5432, 6543];

async function testHosts() {
  for (const host of hosts) {
    for (const port of ports) {
      const connectionString = `postgresql://postgres.gfzknettmaclomxyimjf:prd%401234_p22@${host}:${port}/postgres`;
      console.log(`Testing host: ${host} on port ${port}...`);
      const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      try {
        await client.connect();
        console.log(`SUCCESS! Connected to host: ${host} on port ${port}`);
        await client.end();
        return;
      } catch (err) {
        console.log(`Host ${host}:${port} failed: ${err.message}`);
        await client.end().catch(() => {});
      }
    }
  }
  console.log('All host combinations failed.');
}

testHosts();
