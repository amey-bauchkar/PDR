import os
import zipfile

def make_zip(source_dir, output_filename):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                # Absolute path of file
                file_path = os.path.join(root, file)
                # Relative path inside the zip
                arcname = os.path.relpath(file_path, source_dir)
                # Force forward slashes for Linux compatibility
                arcname = arcname.replace(os.sep, '/')
                zipf.write(file_path, arcname)

import subprocess

if __name__ == '__main__':
    project_dir = r'C:\Users\SEBIN\Desktop\PDR2'
    print("Generating static HTML pages for all products and routes...")
    subprocess.run(['node', os.path.join(project_dir, 'scripts', 'generate-static-pages.js')], cwd=project_dir, check=True)
    
    src = r'C:\Users\SEBIN\Desktop\PDR2\dist'
    dst = r'C:\Users\SEBIN\Desktop\pdrworld-deploy.zip'
    make_zip(src, dst)
    print("Zip created successfully with forward slashes and full Open Graph static pages.")

