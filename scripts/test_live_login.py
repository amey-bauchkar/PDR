import urllib.request
import ssl
import sys
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://pdrworld.com/api/auth/login'
payload = json.dumps({'email': 'admin@pdrworld.com', 'password': 'Autopdr123'}).encode('utf-8')

req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
try:
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    print('HTTP Status:', res.getcode())
    print('Response:', res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print('Error Body:', e.read().decode('utf-8'))
except Exception as e:
    print('Error:', str(e))
