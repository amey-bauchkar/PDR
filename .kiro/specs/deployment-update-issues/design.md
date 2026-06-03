# Deployment Update Issues Bugfix Design

## Overview

This design addresses a critical deployment issue where code changes pushed to the repository do not reflect on the live Vercel-deployed website. The bug manifests when developers push updates to the main branch, Vercel successfully builds and deploys the changes (showing "Ready" status), but the production website continues serving outdated content for an indeterminate period. This creates a disconnect between deployment status and actual user experience, undermining confidence in the deployment pipeline and delaying feature delivery.

The fix approach focuses on three key areas: (1) implementing proper cache-busting mechanisms through versioned assets and meta tags, (2) configuring appropriate HTTP cache headers for both static assets and HTML pages, and (3) establishing deployment verification procedures to ensure changes are live before considering deployment complete.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a Vercel deployment reaches "Ready" status but the production website continues serving content from a previous deployment beyond 60 seconds
- **Property (P)**: The desired behavior - production website serves updated content within 60 seconds of "Ready" status without requiring manual cache clearing
- **Preservation**: Existing build process, API functionality, environment variable handling, and static asset serving that must remain unchanged by the fix
- **Vercel Edge Network**: Vercel's global CDN that caches and serves static assets and pages
- **Cache-Control Header**: HTTP response header that specifies caching directives for browsers and CDN nodes
- **Content Hash**: A hash value (e.g., SHA-256) embedded in asset filenames to enable cache busting when content changes
- **Deployment Version**: A unique identifier (commit SHA or timestamp) that distinguishes one deployment from another
- **Stale-While-Revalidate**: A caching strategy that serves stale content while fetching fresh content in the background
- **Hard Refresh**: Browser action (Ctrl+F5 or Cmd+Shift+R) that bypasses cache and requests fresh content from server
- **CDN Propagation**: The process of distributing updated content across all CDN edge nodes globally

## Bug Details

### Bug Condition

The bug manifests when a developer pushes code changes to the main branch, Vercel completes the build and deployment process with "Ready" status, but users accessing the production website continue to see the previous version. The issue persists even after waiting 5-10 minutes and affects multiple users across different browsers and devices. The root cause involves aggressive caching at multiple layers (browser cache, CDN cache, and potentially Vercel's edge network) without proper cache invalidation mechanisms.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type DeploymentEvent
  OUTPUT: boolean
  
  RETURN input.deploymentStatus == "Ready"
         AND input.timeSinceReady > 60 seconds
         AND productionWebsiteContent != input.deployedCommitContent
         AND userPerformedHardRefresh == false
END FUNCTION
```

### Examples

- **Example 1**: Developer pushes admin panel responsiveness fix at 10:00 AM. Vercel shows "Ready" at 10:02 AM. User accesses admin panel at 10:05 AM on mobile device and sees the old non-responsive layout. Expected: User should see the responsive layout without manual cache clearing.

- **Example 2**: Developer pushes homepage text update at 2:00 PM. Vercel shows "Ready" at 2:01 PM. Multiple users access homepage at 2:10 PM from different locations and browsers, all see old text. Expected: All users should see updated text within 60 seconds of "Ready" status.

- **Example 3**: Developer pushes API endpoint fix at 11:00 AM. Vercel shows "Ready" at 11:02 AM. Frontend makes API call at 11:05 AM and receives response from old endpoint code. Expected: API should execute new code immediately after deployment.

- **Edge Case**: Developer pushes changes at 4:00 PM. Vercel shows "Ready" at 4:02 PM. User who visited site at 3:55 PM (before deployment) refreshes page at 4:05 PM. Expected: User should see new content on refresh without hard refresh (Ctrl+F5).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Vercel build process must continue to exit with code 0 on success and produce dist/ output directory
- Static assets (images, fonts, stylesheets) must continue to return HTTP 200 with correct Content-Type headers
- API endpoints in /api directory must continue to execute latest code and return expected response structures
- Environment variables must continue to be accessible in both server-side (process.env) and client-side (import.meta.env) code
- First-time users and users who haven't visited in 24 hours must continue to receive current deployed version
- Build failures must continue to prevent deployment and exit with non-zero code

**Scope:**
All inputs that do NOT involve a new deployment reaching "Ready" status should be completely unaffected by this fix. This includes:
- Existing user sessions accessing the site before a new deployment
- Static asset requests that are already properly cached with content hashes
- API endpoint calls that are already executing the latest code
- Environment variable access patterns in both client and server code
- Build process behavior for both successful and failed builds

## Hypothesized Root Cause

Based on the bug description and project analysis, the most likely issues are:

1. **Missing Cache-Busting Mechanism**: The index.html file lacks a deployment version meta tag or query parameter that would force browsers and CDN to fetch the new version. Vite generates content-hashed filenames for JS/CSS bundles (e.g., `main.abc123.js`), but the HTML entry point itself may be aggressively cached.

2. **Aggressive CDN Caching**: Vercel's Edge Network may be caching the index.html with long TTL values without proper cache invalidation on new deployments. The default Vercel configuration might not include appropriate `Cache-Control` headers for HTML pages.

3. **Browser Cache Persistence**: Browsers may be caching the HTML page with implicit cache directives, and without explicit `Cache-Control: no-cache` or `must-revalidate` headers, they serve stale content from local cache.

4. **Lack of Deployment Verification**: There's no automated verification step after Vercel reports "Ready" status to confirm that the production URL actually serves the new content. The deployment may be "Ready" in Vercel's system but not yet propagated to all CDN edge nodes.

5. **Missing Cache Headers Configuration**: The vercel.json configuration doesn't specify custom headers for HTML pages, allowing default caching behavior that may be too aggressive for dynamic content.

## Correctness Properties

Property 1: Bug Condition - Deployment Reflects Within 60 Seconds

_For any_ deployment event where Vercel deployment reaches "Ready" status and at least 60 seconds have elapsed, the production website SHALL serve content matching the deployed commit SHA when accessed by any user without requiring hard refresh or cache clearing.

**Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.6**

Property 2: Preservation - Existing Functionality Unchanged

_For any_ website access that does NOT occur within 60 seconds after a new deployment reaches "Ready" status (i.e., stable state operations), the system SHALL produce exactly the same behavior as before the fix, preserving build process, API execution, environment variable access, and static asset serving.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `index.html`

**Function**: HTML entry point

**Specific Changes**:
1. **Add Deployment Version Meta Tag**: Insert a `<meta name="deployment-version" content="{{COMMIT_SHA}}">` tag in the `<head>` section. This will be replaced at build time with the actual commit SHA, providing a visible indicator of which version is deployed.

2. **Add Cache Control Meta Tag**: Insert `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">` to instruct browsers not to cache the HTML page aggressively.

3. **Add Pragma Meta Tag**: Insert `<meta http-equiv="Pragma" content="no-cache">` for backward compatibility with HTTP/1.0 caches.

4. **Add Expires Meta Tag**: Insert `<meta http-equiv="Expires" content="0">` to indicate the page should be considered stale immediately.

**File**: `vercel.json`

**Function**: Vercel deployment configuration

**Specific Changes**:
1. **Add Headers Configuration**: Add a `headers` section to specify custom HTTP headers for different file types:
   ```json
   "headers": [
     {
       "source": "/(.*).html",
       "headers": [
         { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
       ]
     },
     {
       "source": "/",
       "headers": [
         { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
       ]
     },
     {
       "source": "/assets/(.*)",
       "headers": [
         { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
       ]
     }
   ]
   ```

2. **Ensure Build Command Includes Commit SHA**: Verify that the build process has access to `VERCEL_GIT_COMMIT_SHA` environment variable for version tagging.

**File**: `vite.config.ts`

**Function**: Vite build configuration

**Specific Changes**:
1. **Add HTML Transform Plugin**: Create a Vite plugin to inject the commit SHA into the HTML at build time:
   ```typescript
   {
     name: 'html-transform',
     transformIndexHtml(html) {
       return html.replace(
         '{{COMMIT_SHA}}',
         process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev'
       );
     }
   }
   ```

2. **Configure Build Output**: Ensure `build.rollupOptions.output.entryFileNames` and `chunkFileNames` include content hashes (Vite does this by default, but verify it's not overridden).

**File**: `package.json`

**Function**: Build scripts

**Specific Changes**:
1. **Add Post-Deployment Verification Script**: Add a new script `"verify-deployment": "node scripts/verify-deployment.js"` that checks if the deployed site serves the expected commit SHA.

2. **Create Verification Script**: Create `scripts/verify-deployment.js` that:
   - Fetches the production URL
   - Extracts the deployment-version meta tag
   - Compares it with `VERCEL_GIT_COMMIT_SHA`
   - Exits with code 0 if match, code 1 if mismatch
   - Retries up to 5 times with 15-second intervals

**New File**: `scripts/verify-deployment.js`

**Function**: Post-deployment verification

**Specific Changes**:
1. **Implement Verification Logic**: Create a Node.js script that uses `fetch` or `https` module to request the production URL, parse the HTML response, extract the meta tag, and compare versions.

2. **Add Retry Logic**: Implement exponential backoff retry mechanism to account for CDN propagation delays.

3. **Add Logging**: Log each verification attempt with timestamp and result for debugging.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by deploying a change and observing that it doesn't appear on production within 60 seconds, then verify the fix works correctly by confirming new deployments are visible within 60 seconds and that existing functionality remains unchanged.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Deploy a visible change (e.g., add a unique text string to the homepage) to the current unfixed codebase. Monitor the production URL every 15 seconds for 5 minutes after Vercel reports "Ready" status. Check if the change appears without hard refresh. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Homepage Text Change Test**: Add unique timestamp text to homepage, deploy, check if visible within 60 seconds (will fail on unfixed code)
2. **Meta Tag Absence Test**: Check if current production HTML includes deployment version meta tag (will fail on unfixed code - tag doesn't exist)
3. **Cache Header Test**: Inspect HTTP response headers for index.html, verify Cache-Control header (will fail on unfixed code - likely missing or too aggressive)
4. **Multi-User Test**: Have 3 different users in different locations access site within 2 minutes of deployment (will fail on unfixed code - inconsistent results)

**Expected Counterexamples**:
- Production website continues serving old content 5+ minutes after "Ready" status
- HTTP response headers show aggressive caching (e.g., `Cache-Control: max-age=3600`)
- No deployment version indicator in HTML source
- Possible causes: missing cache-busting meta tags, aggressive CDN caching, lack of cache invalidation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (new deployment reaches "Ready" status), the fixed system produces the expected behavior (production serves new content within 60 seconds).

**Pseudocode:**
```
FOR ALL deployment WHERE deployment.status == "Ready" DO
  wait 60 seconds
  response := fetch(productionURL)
  deploymentVersion := extractMetaTag(response, "deployment-version")
  ASSERT deploymentVersion == deployment.commitSHA
  ASSERT response.content matches deployment.commitContent
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (normal website operations outside of deployment windows), the fixed system produces the same result as the original system.

**Pseudocode:**
```
FOR ALL request WHERE NOT (recentDeployment AND withinPropagationWindow) DO
  ASSERT fixedSystem(request) == originalSystem(request)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (different page routes, API endpoints, asset types)
- It catches edge cases that manual unit tests might miss (e.g., unusual query parameters, different user agents)
- It provides strong guarantees that behavior is unchanged for all non-deployment scenarios

**Test Plan**: Observe behavior on UNFIXED code first for normal operations (page loads, API calls, asset requests), then write property-based tests capturing that behavior. Run tests on both unfixed and fixed code to verify identical behavior.

**Test Cases**:
1. **Build Process Preservation**: Observe that `npm run build` exits with code 0 and produces dist/ directory on unfixed code, then verify same behavior after fix
2. **API Endpoint Preservation**: Observe that API endpoints return expected responses on unfixed code, then verify identical responses after fix
3. **Static Asset Preservation**: Observe that images, fonts, CSS files return HTTP 200 with correct Content-Type on unfixed code, then verify same after fix
4. **Environment Variable Preservation**: Observe that both client-side and server-side environment variables are accessible on unfixed code, then verify same after fix

### Unit Tests

- Test HTML transformation plugin correctly injects commit SHA into meta tag
- Test verification script correctly extracts deployment version from HTML response
- Test verification script retry logic with mock HTTP responses
- Test Cache-Control header configuration in vercel.json is correctly applied
- Test that build process fails gracefully if commit SHA is unavailable

### Property-Based Tests

- Generate random deployment scenarios (different commit SHAs, timestamps) and verify production always serves matching version within 60 seconds
- Generate random page routes and verify all routes receive correct Cache-Control headers
- Generate random static asset requests and verify they maintain immutable caching with content hashes
- Test that multiple concurrent users accessing site after deployment all receive new version

### Integration Tests

- Test full deployment flow: push change → Vercel build → verify production serves new content within 60 seconds
- Test deployment verification script runs automatically after Vercel deployment completes
- Test that failed deployments don't affect production (users continue seeing previous successful deployment)
- Test that meta tag version matches Vercel deployment commit SHA in dashboard
- Test that hard refresh is NOT required for users to see new deployment
- Test that CDN propagation completes within 60 seconds across multiple geographic regions
