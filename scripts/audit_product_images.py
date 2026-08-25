import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

slugs = [
    'cleaner-pen', 'cassette-cleaner', 'mpo-cleaner', 'wall-mount', 
    'fdb', 'htb', 'fusion-splicer', 'easyget-wifi', 'pon-power-meter',
    'cat6-patch-cord', 'rack-mount-fms'
]

print("=" * 65)
print("PRODUCT DETAIL PAGE REAL IMAGE AUDIT:")
print("=" * 65)
for slug in slugs:
    path = f'dist/products/{slug}/index.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    img_m = re.search(r'class="pd-image"[^>]*src="([^"]+)"', html)
    print(f'{slug:25} -> {img_m.group(1) if img_m else "NOT FOUND"}')
print("=" * 65)
