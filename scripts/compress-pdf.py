import os
import sys
import io
import fitz
from PIL import Image

def compress_pocket_otdr():
    src_path = os.path.join(os.path.dirname(__file__), '../public/datasheets/pocket-otdr.pdf')
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        return

    orig_size = os.path.getsize(src_path)
    print(f"Compressing {src_path} (original: {orig_size / (1024*1024):.2f} MB)...")

    doc = fitz.open(src_path)
    processed_xrefs = set()

    for p in range(len(doc)):
        for img in doc[p].get_images():
            xref = img[0]
            if xref in processed_xrefs:
                continue
            processed_xrefs.add(xref)
            base_img = doc.extract_image(xref)
            image_bytes = base_img["image"]
            try:
                pil_img = Image.open(io.BytesIO(image_bytes))
                if pil_img.mode in ("RGBA", "P"):
                    pil_img = pil_img.convert("RGB")
                out_bytes = io.BytesIO()
                pil_img.save(out_bytes, format="JPEG", quality=85, optimize=True)
                new_data = out_bytes.getvalue()
                if len(new_data) < len(image_bytes):
                    doc.update_stream(xref, new_data)
            except Exception as e:
                print(f"Skipping xref {xref}: {e}")

    temp_path = src_path + ".tmp"
    doc.save(temp_path, garbage=4, deflate=True)
    doc.close()

    new_size = os.path.getsize(temp_path)
    print(f"Compressed size: {new_size / (1024*1024):.2f} MB")
    if new_size < orig_size:
        os.replace(temp_path, src_path)
        print(f"Successfully optimized {src_path}!")
    else:
        os.remove(temp_path)

if __name__ == '__main__':
    compress_pocket_otdr()
