import urllib.request
import ssl
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://pdrworld.com/images/live/fiber-optic-cleaner-pen.webp',
    'https://pdrworld.com/images/live/optical-fiber-wall-mount-enclosure.webp',
    'https://pdrworld.com/images/live/cassette-cleaner.webp',
    'https://pdrworld.com/images/live/fiber-optic-cleaner-pen-mpo.webp',
    'https://pdrworld.com/images/live/rack-mount-fiber-management-system.webp'
]

print("TESTING DIRECT LIVE ASSET URLS:")
for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=10, context=ctx)
        print(f'{u.split("/")[-1]:45} -> Status: {res.getcode()} | Size: {len(res.read())} bytes')
    except Exception as e:
        print(f'{u.split("/")[-1]:45} -> ERROR: {str(e)}')
