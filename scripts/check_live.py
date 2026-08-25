import urllib.request
import ssl
import sys
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://pdrworld.com/products/sfp-400g?cachebust=9999', headers={'User-Agent': 'WhatsApp/2.21.12.21 A', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'})
res = urllib.request.urlopen(req, timeout=10, context=ctx)
txt = res.read().decode('utf-8', errors='ignore')

print('Title tag:', re.findall(r'<title>(.*?)</title>', txt))
print('OG Title:', re.findall(r'<meta property="og:title" content="(.*?)"', txt))
print('OG URL:', re.findall(r'<meta property="og:url" content="(.*?)"', txt))
print('Server Headers:')
for k, v in res.getheaders():
    if k.lower() in ['server', 'x-cache', 'cf-cache-status', 'age', 'cache-control', 'last-modified', 'etag']:
        print(f'  {k}: {v}')
