import os
import zipfile

def create_zip(source_dir, output_filename, ignore_dirs):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                file_path = os.path.join(root, file)
                # Ensure the root folder itself is not included in the path inside zip
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

if __name__ == "__main__":
    source = r"c:\Users\SEBIN\Desktop\PDR2"
    dest = r"c:\Users\SEBIN\Desktop\PDR_Hostinger_Source_Upload.zip"
    ignore = ["node_modules", ".git", "dist", ".cache"]
    create_zip(source, dest, ignore)
    print(f"Created {dest}")
