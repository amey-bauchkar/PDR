const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://gfzknettmaclomxyimjf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUxNDY3OSwiZXhwIjoyMTAwMDkwNjc5fQ.bQyfGptg_f8LcVAQbNG5wmdsrxyxvqWjDZs8ZoG0MDk';
const BUCKET = 'product-datasheets';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  
  if (buckets?.some((bucket) => bucket.name === BUCKET)) {
    console.log(`Bucket ${BUCKET} already exists.`);
    return;
  }

  console.log(`Creating bucket ${BUCKET}...`);
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
  });
  if (error) throw error;
  console.log(`Bucket ${BUCKET} created successfully as Public.`);
}

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList);
    } else {
      fileList.push(name);
    }
  }
  return fileList;
}

async function run() {
  try {
    await ensureBucket();
    
    const extractedDir = path.resolve('../datasheet/extracted');
    if (!fs.existsSync(extractedDir)) {
      console.error(`Extracted directory not found: ${extractedDir}`);
      return;
    }
    
    console.log('Scanning extracted files...');
    const allFiles = getFiles(extractedDir);
    const pdfFiles = allFiles.filter(f => f.toLowerCase().endsWith('.pdf'));
    console.log(`Found ${pdfFiles.length} PDF files to upload.`);

    for (let i = 0; i < pdfFiles.length; i++) {
      const filePath = pdfFiles[i];
      // Get path relative to the extracted directory
      const relativePath = path.relative(extractedDir, filePath).replace(/\\/g, '/');
      
      console.log(`[${i + 1}/${pdfFiles.length}] Uploading ${relativePath}...`);
      const fileBuffer = fs.readFileSync(filePath);
      
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(relativePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });
        
      if (error) {
        console.error(`Failed to upload ${relativePath}:`, error.message);
      } else {
        console.log(`Uploaded ${relativePath} successfully.`);
      }
    }
    
    console.log('Datasheet uploads completed!');
  } catch (err) {
    console.error('Error during upload run:', err);
  }
}

run();
