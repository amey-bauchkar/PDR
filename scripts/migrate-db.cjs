const pg = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.gfzknettmaclomxyimjf:prd%401234_p22@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');

    // 1. Run schema.sql
    const schemaPath = path.resolve('supabase/schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    console.log('Schema executed successfully.');

    // 2. Temporarily convert generated hash_key columns to regular text columns
    console.log('Temporarily converting generated hash_key columns to regular columns...');
    const alterTablesTemp = [
      'ALTER TABLE public.product_categories DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.product_categories ADD COLUMN hash_key text;',
      'ALTER TABLE public.catalog_sections DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.catalog_sections ADD COLUMN hash_key text;',
      'ALTER TABLE public.catalog_groups DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.catalog_groups ADD COLUMN hash_key text;',
      'ALTER TABLE public.catalog_products DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.catalog_products ADD COLUMN hash_key text;'
    ];
    for (const sql of alterTablesTemp) {
      await client.query(sql);
    }
    console.log('Converted hash_key columns.');

    // 3. Import data tables in order
    const dataDir = path.resolve('../data tables');
    const files = [
      'product_categories_rows.sql',
      'quote_sessions_rows.sql',
      'quote_requests_rows.sql',
      'catalog_products_rows.sql',
      'catalog_product_features_rows.sql',
      'catalog_product_applications_rows.sql',
      'catalog_product_specs_rows.sql',
      'quote_session_items_rows.sql',
      'quote_request_items_rows.sql',
      'contact_inquiries_rows.sql'
    ];

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        if (sql.trim()) {
          // Disable triggers during data load to prevent foreign key issues
          await client.query('SET session_replication_role = \'replica\';');
          await client.query(sql);
          await client.query('SET session_replication_role = \'origin\';');
          console.log(`Finished executing ${file}.`);
        } else {
          console.log(`${file} is empty, skipping.`);
        }
      } else {
        console.log(`File not found: ${file}, skipping.`);
      }
    }

    // 4. Restore hash_key to a generated column
    console.log('Restoring generated hash_key columns...');
    const alterTablesRestore = [
      'ALTER TABLE public.product_categories DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.product_categories ADD COLUMN hash_key text GENERATED ALWAYS AS (encode(digest(lower(slug), \'sha256\'), \'hex\')) STORED UNIQUE;',
      'ALTER TABLE public.catalog_sections DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.catalog_sections ADD COLUMN hash_key text GENERATED ALWAYS AS (encode(digest(lower(slug), \'sha256\'), \'hex\')) STORED UNIQUE;',
      'ALTER TABLE public.catalog_groups DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.catalog_groups ADD COLUMN hash_key text GENERATED ALWAYS AS (encode(digest(lower(slug), \'sha256\'), \'hex\')) STORED UNIQUE;',
      'ALTER TABLE public.catalog_products DROP COLUMN IF EXISTS hash_key;',
      'ALTER TABLE public.catalog_products ADD COLUMN hash_key text GENERATED ALWAYS AS (encode(digest(lower(slug), \'sha256\'), \'hex\')) STORED UNIQUE;'
    ];
    for (const sql of alterTablesRestore) {
      await client.query(sql);
    }
    console.log('Restored hash_key columns.');

    console.log('Database migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end().catch(() => {});
  }
}

run();
