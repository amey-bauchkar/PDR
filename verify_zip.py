import zipfile
import sys

zip_path = r'C:\Users\SEBIN\Desktop\pdrworld-deploy.zip'

try:
    with zipfile.ZipFile(zip_path, 'r') as zf:
        file_list = zf.namelist()
        
        # Validation checks
        has_index = 'index.html' in file_list
        has_htaccess = '.htaccess' in file_list
        has_assets = any(f.startswith('assets/') for f in file_list)
        
        # Check for any backslashes in paths
        has_backslashes = any('\\' in f for f in file_list)
        
        print(f"Total files in zip: {len(file_list)}")
        print(f"index.html present: {has_index}")
        print(f".htaccess present: {has_htaccess}")
        print(f"assets/ folder present: {has_assets}")
        print(f"Any backslashes in paths? {has_backslashes}")
        
        # Print a few sample files
        print("\nSample files:")
        for f in file_list[:10]:
            print(f" - {f}")
            
        print("\nVerification Summary:")
        if has_index and has_htaccess and has_assets and not has_backslashes:
            print("✅ Zip file looks correct. Paths use forward slashes and key build files are present.")
        else:
            print("❌ Zip file might have an issue.")

except Exception as e:
    print(f"Error reading zip file: {e}")
