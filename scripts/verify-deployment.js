#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that a Vercel deployment has successfully propagated
 * to the production URL by checking the deployment-version meta tag.
 * 
 * Usage:
 *   node scripts/verify-deployment.js
 * 
 * Environment Variables:
 *   VERCEL_GIT_COMMIT_SHA - The commit SHA of the current deployment
 *   PRODUCTION_URL - The production URL to verify (defaults to https://pdrworld.com)
 */

import https from 'https';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://pdrworld.com';
const EXPECTED_COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA;
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 15000; // 15 seconds

/**
 * Fetch the production URL and extract the deployment-version meta tag
 */
function fetchDeploymentVersion(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Extract deployment-version meta tag using regex
        const metaTagMatch = data.match(/<meta\s+name="deployment-version"\s+content="([^"]+)"\s*\/?>/i);
        
        if (metaTagMatch && metaTagMatch[1]) {
          resolve(metaTagMatch[1]);
        } else {
          reject(new Error('deployment-version meta tag not found in HTML'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Verify deployment with retry logic
 */
async function verifyDeployment() {
  if (!EXPECTED_COMMIT_SHA) {
    console.error('❌ Error: VERCEL_GIT_COMMIT_SHA environment variable is not set');
    console.log('This script should be run in a Vercel deployment environment.');
    process.exit(1);
  }

  console.log('🔍 Verifying deployment...');
  console.log(`   Production URL: ${PRODUCTION_URL}`);
  console.log(`   Expected commit SHA: ${EXPECTED_COMMIT_SHA}`);
  console.log('');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Attempt ${attempt}/${MAX_RETRIES}...`);

    try {
      const deployedVersion = await fetchDeploymentVersion(PRODUCTION_URL);
      console.log(`   Deployed version: ${deployedVersion}`);

      if (deployedVersion === EXPECTED_COMMIT_SHA) {
        console.log('');
        console.log('✅ Success! Deployment verified.');
        console.log(`   Production is serving commit ${EXPECTED_COMMIT_SHA}`);
        process.exit(0);
      } else {
        console.log(`   ⚠️  Version mismatch (expected: ${EXPECTED_COMMIT_SHA})`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    if (attempt < MAX_RETRIES) {
      console.log(`   Retrying in ${RETRY_INTERVAL_MS / 1000} seconds...`);
      console.log('');
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS));
    }
  }

  console.log('');
  console.log('❌ Deployment verification failed after ' + MAX_RETRIES + ' attempts');
  console.log('   The production URL is not serving the expected commit SHA.');
  console.log('   This may indicate:');
  console.log('   - CDN propagation is taking longer than expected');
  console.log('   - The deployment did not complete successfully');
  console.log('   - Cache headers are not configured correctly');
  process.exit(1);
}

// Run verification
verifyDeployment().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
