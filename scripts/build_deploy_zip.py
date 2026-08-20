import os
import zipfile
import sys

def make_zip(source_dir, output_zip_path):
    print(f"Creating Linux-compatible zip archive: {output_zip_path}")
    
    # Remove existing zip if any
    if os.path.exists(output_zip_path):
        os.remove(output_zip_path)
        
    dist_dir = os.path.join(source_dir, 'dist')
    backend_dir = os.path.join(source_dir, 'backend')
    
    file_count = 0
    
    with zipfile.ZipFile(output_zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        # 1. Add everything inside dist/ to root of zip
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                # FORCE FORWARD SLASHES FOR LINUX / HOSTINGER COMPATIBILITY
                posix_path = rel_path.replace('\\', '/')
                zf.write(full_path, posix_path)
                file_count += 1

        # 2. Add backend/ (excluding node_modules)
        for root, dirs, files in os.walk(backend_dir):
            # Skip node_modules
            dirs[:] = [d for d in dirs if d != 'node_modules' and d != '.git']
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                posix_path = rel_path.replace('\\', '/')
                zf.write(full_path, posix_path)
                file_count += 1

        # 3. Add root config files
        for extra_file in ['package.json', 'package-lock.json', '.env']:
            fp = os.path.join(source_dir, extra_file)
            if os.path.exists(fp):
                zf.write(fp, extra_file)
                file_count += 1

    size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)
    print(f"SUCCESS: Added {file_count} files.")
    print(f"Archive Size: {size_mb:.2f} MB")
    print(f"Location: {output_zip_path}")

if __name__ == '__main__':
    project_dir = r"c:\Users\SEBIN\Desktop\PDR2"
    out_zip = r"C:\Users\SEBIN\Desktop\pdrworld-deploy.zip"
    make_zip(project_dir, out_zip)
