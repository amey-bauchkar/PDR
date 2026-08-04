const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve('../datasheet/extracted');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const zipDir = path.resolve('../datasheet');
const files = fs.readdirSync(zipDir);
const zipFiles = files.filter(f => f.toLowerCase().endsWith('.zip'));

console.log(`Found ${zipFiles.length} zip files to extract.`);

for (const file of zipFiles) {
  const filePath = path.join(zipDir, file);
  console.log(`Extracting ${file}...`);
  try {
    // We use powershell Expand-Archive with properly escaped path variables.
    // In PowerShell, we pass the absolute paths in quotes.
    const cmd = `powershell -Command "Expand-Archive -Path '${filePath.replace(/'/g, "''")}' -DestinationPath '${targetDir.replace(/'/g, "''")}' -Force"`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to extract ${file}:`, err.message);
  }
}

console.log('All zip files extracted.');
