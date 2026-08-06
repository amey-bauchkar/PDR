import os
import zipfile

def create_zip(source_dir, output_filename, ignore_dirs):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                # Ensure the root folder itself is not included in the path inside zip
                arcname = os.path.relpath(file_path, source_dir).replace('\\', '/')
                zipf.write(file_path, arcname)

if __name__ == "__main__":
    base_dir = r"c:\Users\SEBIN\Desktop\PDR2"
    
    # 1. Static site zip for Hostinger File Manager
    hostinger_dest = os.path.join(base_dir, "hostinger_deploy.zip")
    dist_dir = os.path.join(base_dir, "dist")
    create_zip(dist_dir, hostinger_dest, ["node_modules", ".git"])
    print(f"Created static deploy zip: {hostinger_dest}")

    # 2. Source code zip for Vercel / GitHub
    source_dest = os.path.join(base_dir, "source_code_deploy.zip")
    ignore = ["node_modules", ".git", "dist", ".cache", ".gemini", "brain"]
    create_zip(base_dir, source_dest, ignore)
    print(f"Created source code deploy zip: {source_dest}")
