const pg = require('pg');
const { Client } = pg;

const regions = [
  'ap-northeast-2',
  'ap-northeast-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1'
];

async function testRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.gfzknettmaclomxyimjf:prd%401234_p22@${host}:6543/postgres`;
    console.log(`Testing region: ${region} (${host})...`);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    try {
      await client.connect();
      console.log(`SUCCESS! Connected to region: ${region}`);
      await client.end();
      return;
    } catch (err) {
      console.log(`Region ${region} failed: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  console.log('All regions failed.');
}

testRegions();
