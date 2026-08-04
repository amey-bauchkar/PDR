const https = require('https');

const TOKEN = process.env.VERCEL_TOKEN || '';
const TEAM_ID = process.env.VERCEL_TEAM_ID || '';
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || '';

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || '';
const NEW_SUPABASE_ANON_KEY = process.env.NEW_SUPABASE_ANON_KEY || '';
const NEW_SERVICE_ROLE_KEY = process.env.NEW_SERVICE_ROLE_KEY || '';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  // 1. Get existing env vars
  console.log('Getting existing env vars...');
  const envRes = await apiRequest('GET', `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&decrypt=false`);
  
  if (envRes.status !== 200) {
    console.error('Failed to get env vars:', envRes.body);
    return;
  }
  
  const envVars = envRes.body.envs || [];
  console.log('Found', envVars.length, 'env vars');
  
  // 2. Find and update/create the Supabase env vars
  const updates = [
    { key: 'VITE_SUPABASE_URL', value: NEW_SUPABASE_URL },
    { key: 'VITE_SUPABASE_ANON_KEY', value: NEW_SUPABASE_ANON_KEY },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: NEW_SERVICE_ROLE_KEY },
  ];
  
  for (const update of updates) {
    const existing = envVars.find(e => e.key === update.key);
    if (existing) {
      // Delete the existing one first (to avoid type conflict)
      console.log(`Deleting old ${update.key} (id: ${existing.id})...`);
      await apiRequest('DELETE', `/v9/projects/${PROJECT_ID}/env/${existing.id}?teamId=${TEAM_ID}`);
    }
    // Create fresh
    console.log(`Creating ${update.key}...`);
    const postRes = await apiRequest('POST', `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, [{
      key: update.key,
      value: update.value,
      target: ['production', 'preview', 'development'],
      type: 'encrypted'
    }]);
    if (postRes.status === 200 || postRes.status === 201) {
      console.log(`Created ${update.key} successfully.`);
    } else {
      console.error(`Failed to create ${update.key}:`, JSON.stringify(postRes.body));
    }
  }
  
  // 3. Get latest deployment to redeploy
  console.log('\nGetting latest deployment...');
  const deploymentsRes = await apiRequest('GET', `/v6/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&limit=1&target=production`);
  
  if (deploymentsRes.status !== 200) {
    console.error('Failed to get deployments:', deploymentsRes.body);
    return;
  }
  
  const deployments = deploymentsRes.body.deployments || [];
  if (deployments.length === 0) {
    console.log('No deployments found. Triggering new deployment via git push...');
    return;
  }
  
  const latestDeployment = deployments[0];
  console.log('Latest deployment:', latestDeployment.uid, latestDeployment.url);
  
  // 4. Redeploy
  console.log('\nTriggering redeploy...');
  const redeployRes = await apiRequest('POST', `/v13/deployments?teamId=${TEAM_ID}&forceNew=1`, {
    name: latestDeployment.name,
    deploymentId: latestDeployment.uid,
    target: 'production',
  });
  
  if (redeployRes.status === 200 || redeployRes.status === 201) {
    console.log('Redeploy triggered successfully!');
    console.log('New deployment URL:', redeployRes.body.url);
  } else {
    console.error('Failed to redeploy:', JSON.stringify(redeployRes.body));
  }
}

run().catch(console.error);
