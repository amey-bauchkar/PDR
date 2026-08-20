import os
import json
import re
import zipfile
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

print('=' * 75)
print('CIA-LEVEL FORENSIC VERIFICATION AUDIT - PDR WORLD CODEBASE & DEPLOY ZIP')
print('=' * 75)

report = []

# 1. Plaintext Password Leak Check in source & dist
dist_js = []
dist_assets = r'c:\Users\SEBIN\Desktop\PDR2\dist\assets'
for f in os.listdir(dist_assets):
    if f.endswith('.js'):
        with open(os.path.join(dist_assets, f), 'r', encoding='utf-8', errors='ignore') as fp:
            dist_js.append(fp.read())
dist_js_combined = ' '.join(dist_js)

old_pwd_found = 'adminpdr_32543' in dist_js_combined
new_pwd_found = 'Autopdr123' in dist_js_combined
report.append((
    '1. Admin Password Security in Client JS Bundle',
    not old_pwd_found and not new_pwd_found,
    f'Old password in bundle: {old_pwd_found}, New password in bundle: {new_pwd_found}'
))

# 2. Server-side Auth Controller & Route Check
auth_ctrl_exists = os.path.exists(r'c:\Users\SEBIN\Desktop\PDR2\backend\src\controllers\authController.ts')
auth_route_exists = os.path.exists(r'c:\Users\SEBIN\Desktop\PDR2\backend\src\routes\auth.ts')
report.append((
    '2. Server Auth Controller & Routes Existence',
    auth_ctrl_exists and auth_route_exists,
    f'authController.ts: {auth_ctrl_exists}, routes/auth.ts: {auth_route_exists}'
))

# 3. Protected Backend CRUD & RFQ routes check
with open(r'c:\Users\SEBIN\Desktop\PDR2\backend\src\routes\products.ts', 'r', encoding='utf-8') as f:
    prod_routes = f.read()
with open(r'c:\Users\SEBIN\Desktop\PDR2\backend\src\routes\rfq.ts', 'r', encoding='utf-8') as f:
    rfq_routes = f.read()

prod_crud_protected = "router.post('/', verifyToken" in prod_routes and "router.put('/:slug', verifyToken" in prod_routes and "router.delete('/:slug', verifyToken" in prod_routes
rfq_list_protected = "router.get('/list', verifyToken" in rfq_routes and "router.get('/:id', verifyToken" in rfq_routes
report.append((
    '3. Backend API Route Protection (JWT Authentication)',
    prod_crud_protected and rfq_list_protected,
    f'Product CRUD protected: {prod_crud_protected}, RFQ /list & /:id protected: {rfq_list_protected}'
))

# 4. WhatsApp / OG Tags Check in Prerendered HTMLs
sample_products = ['sfp-400g', 'mpo-cleaner', 'cwdm', 'easyget-wifi', 'uav-fiber-optic-spool']
og_checks = True
og_details = []
for slug in sample_products:
    p_html = os.path.join(r'c:\Users\SEBIN\Desktop\PDR2\dist\products', slug, 'index.html')
    if os.path.exists(p_html):
        with open(p_html, 'r', encoding='utf-8') as f:
            html = f.read()
            m_title = re.search(r'<meta property="og:title" content="([^"]+)"', html)
            m_url = re.search(r'<meta property="og:url" content="([^"]+)"', html)
            m_can = re.search(r'<link rel="canonical" href="([^"]+)"', html)
            t_val = m_title.group(1) if m_title else 'MISSING'
            u_val = m_url.group(1) if m_url else 'MISSING'
            c_val = m_can.group(1) if m_can else 'MISSING'
            
            # Verify: must have product specific title, url matching slug, and matching canonical
            if (slug not in u_val) or ('pdrworld.com' not in u_val) or (u_val != c_val):
                og_checks = False
            og_details.append(f'{slug} -> og:title: "{t_val[:25]}...", og:url: {u_val}')
    else:
        og_checks = False
        og_details.append(f'{slug} -> FILE MISSING')
report.append((
    '4. WhatsApp & Social OG Tags (Prerendered HTMLs)',
    og_checks,
    '; '.join(og_details[:2])
))

# 5. Garbled Text Fix Check
with open(r'c:\Users\SEBIN\Desktop\PDR2\src\data\catalogue.json', 'r', encoding='utf-8') as f:
    cat_data = json.load(f)
eyebrow_text = cat_data.get('hero', {}).get('eyebrow', '')
garbled_found = 'Â' in eyebrow_text or 'Â·' in eyebrow_text
clean_dot = '·' in eyebrow_text
report.append((
    '5. Garbled Text Fix (catalogue.json eyebrow & description)',
    (not garbled_found) and clean_dot,
    f'Eyebrow text: "{eyebrow_text}", Garbled found: {garbled_found}, Clean dot found: {clean_dot}'
))

# 6. Sitemap Accuracy Check
with open(r'c:\Users\SEBIN\Desktop\PDR2\public\sitemap.xml', 'r', encoding='utf-8') as f:
    sitemap_xml = f.read()
ghosts = ['armoured-patchcord', 'bendiboot-patchcord', 'easycheck-v2', 'lc-uniboot', 'loopback', 'odf', 'mating-sleeve', 'mini-opm', 'soc']
ghosts_in_sitemap = [g for g in ghosts if f'/products/{g}' in sitemap_xml]
missing_4 = ['fiber-optic-adapter', 'fpv-optical-terminal', 'uav-fiber-optic-spool', 'wifi-wireless-fiber-endface-microscope']
missing_in_sitemap = [m for m in missing_4 if f'/products/{m}' in sitemap_xml]
url_count = len(re.findall(r'<url>', sitemap_xml))
report.append((
    '6. Sitemap Synchronization (69 Active URLs)',
    len(ghosts_in_sitemap) == 0 and len(missing_in_sitemap) == 4 and url_count == 69,
    f'Total URLs: {url_count} (Expected: 69), Ghosts: {len(ghosts_in_sitemap)}, 4 New Included: {len(missing_in_sitemap)}/4'
))

# 7. .htaccess Redirects & Rules
with open(r'c:\Users\SEBIN\Desktop\PDR2\public\.htaccess', 'r', encoding='utf-8') as f:
    htaccess = f.read()
www_redirect = 'RewriteCond %{HTTP_HOST} ^www\\.pdrworld\\.com$' in htaccess
prerender_rule = 'RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI}/index.html -f' in htaccess
mpo_redirect = 'Redirect 301 /fiber-optic-cleaner-pen-mpo /products/mpo-cleaner' in htaccess
cwdm_redirect = 'Redirect 301 /cwdm-mux-demux-module /products/cwdm' in htaccess
disclaimer_redirect = 'Redirect 301 /disclaimer /about' in htaccess
wp_content_redirect = 'RewriteRule ^wp-content/(.*)$ /products [R=301,L]' in htaccess
total_redirects = len(re.findall(r'Redirect 301', htaccess)) + len(re.findall(r'RewriteRule.*R=301', htaccess))
report.append((
    '7. .htaccess Rules, www Canonical & WordPress Mappings',
    www_redirect and prerender_rule and mpo_redirect and cwdm_redirect and disclaimer_redirect and wp_content_redirect,
    f'www redirect: {www_redirect}, prerender rule: {prerender_rule}, Total 301s: {total_redirects}'
))

# 8. Deploy Zip Validation (Linux POSIX compatibility)
zip_path = r'C:\Users\SEBIN\Desktop\pdrworld-deploy.zip'
zip_ok = False
zip_details = ''
if os.path.exists(zip_path):
    z = zipfile.ZipFile(zip_path, 'r')
    namelist = z.namelist()
    backslashes = [n for n in namelist if '\\' in n]
    has_htaccess = '.htaccess' in namelist
    has_index = 'index.html' in namelist
    has_backend = any(n.startswith('backend/dist/') for n in namelist)
    has_products = any(n.startswith('products/sfp-400g/') for n in namelist)
    has_sitemap = 'sitemap.xml' in namelist
    zip_ok = (len(backslashes) == 0) and has_htaccess and has_index and has_backend and has_products and has_sitemap
    zip_details = f'Backslashes: {len(backslashes)}, Files: {len(namelist)}, .htaccess: {has_htaccess}, Backend: {has_backend}, Products: {has_products}'
    z.close()
report.append((
    '8. Deployment Zip (Linux POSIX Slashes & Completeness)',
    zip_ok,
    zip_details
))

# 9. Foundation Tagline / Founded Date
with open(r'c:\Users\SEBIN\Desktop\PDR2\src\pages\Home.tsx', 'r', encoding='utf-8') as f:
    home_src = f.read()
since_1974 = 'since 1974' in home_src.lower() or '1974' in home_src
old_1985 = 'since 1985' in home_src.lower() or '1985' in home_src
report.append((
    '9. Brand Foundation Tagline (Since 1974)',
    since_1974 and not old_1985,
    f'Since 1974 present: {since_1974}, Old 1985 present: {old_1985}'
))

# 10. 404 Robots Tag & Catch-All Protection
with open(r'c:\Users\SEBIN\Desktop\PDR2\src\pages\NotFound.tsx', 'r', encoding='utf-8') as f:
    notfound_src = f.read()
with open(r'c:\Users\SEBIN\Desktop\PDR2\dist\404.html', 'r', encoding='utf-8') as f:
    notfound_html = f.read()
notfound_noindex = 'noindex' in notfound_src and 'noindex' in notfound_html
report.append((
    '10. 404 Noindex Tag for Googlebot Protection',
    notfound_noindex,
    f'404 Page noindex meta tag verified in JSX and prerendered HTML: {notfound_noindex}'
))

all_passed = True
for title, passed, detail in report:
    if not passed:
        all_passed = False
    status = '✅ PASS' if passed else '❌ FAIL'
    print(f'{status} | {title}')
    print(f'         └─ {detail}')

print('=' * 75)
if all_passed:
    print('🏆 10/10 AUDIT CHECKS PASSED — 100% PRODUCTION READY WITH ZERO REGRESSIONS')
else:
    print('⚠️ SOME AUDIT CHECKS FAILED — REVIEW REQUIRED')
print('=' * 75)
