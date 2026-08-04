/**
 * Script to copy missing PDF files from OLD Supabase storage to NEW Supabase storage.
 * Run with: node scripts/copy-missing-datasheets.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const OLD_SUPABASE_URL = 'https://dontisnmqeigdftjoolm.supabase.co';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbnRpc25tcWVpZ2RmdGpvb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1MDk5NCwiZXhwIjoyMDk4NjI2OTk0fQ.YpuSgL8TKRbKXPKrMNF3FkVhIPJnKNWbhNuHQ5LsqKs';

const NEW_SUPABASE_URL = 'https://gfzknettmaclomxyimjf.supabase.co';
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUxNDY3OSwiZXhwIjoyMTAwMDkwNjc5fQ.bQyfGptg_f8LcVAQbNG5wmdsrxyxvqWjDZs8ZoG0MDk';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SERVICE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_KEY);

// Missing files identified from audit
const MISSING = [
  { slug: 'heat-shrink-closure', folder: 'heat-shrink-closure', file: '1783685981663-spliceclosure_datasheet_v2.pdf' },
  { slug: 'hybrid-adapter', folder: 'hybrid-adapter', file: '1783769413822-hybrid-adapter-datasheet.pdf' },
  { slug: 'mode-conditioning', folder: 'mode-conditioning', file: '1783933535825-modeconditioningpatchcord_datasheet.pdf' },
  { slug: 'mpo-cleaner', folder: 'mpo-cleaner', file: '1783331693873-mpo_cleaner_pen_datasheet.pdf' },
  { slug: 'next-gen-splicer', folder: 'next-gen-splicer', file: '1783686257868-fusion-splicer-pdr4107s-datasheet.pdf' },
  { slug: 'olps', folder: 'olps', file: '1783598367118-olps_datasheet.pdf' },
  { slug: 'pocket-otdr', folder: 'pocket-otdr', file: '1783161519593-nanootdr_datasheet.pdf' },
  { slug: 'pof-patchcord', folder: 'pof-patchcord', file: '1783685352468-pof_cableassembly_datasheet.pdf' },
  { slug: 'pon-power-meter', folder: 'pon-power-meter', file: '1783686148091-pdr4213b_ponpowermeter_datasheet.pdf' },
  { slug: 'rapid-push', folder: 'rapid-push', file: '1783933819314-fttx-smart-bullet-drop-cable-assembly.pdf' },
  { slug: 'regular-opm', folder: 'regular-opm', file: '1783939428411-miniopticalpowermeter_pdr60_datasheet.pdf' },
  { slug: 'sfp-40g', folder: 'sfp-40g', file: '1783500860898-pdr-catalogue-2024-1-.pdf' },
  { slug: 'sfp-10g-dual', folder: 'sfp-10g-dual', file: '1783330961102-optical_transceivers_datasheet_v2.pdf' },
  { slug: 'sfp-1g-bidi', folder: 'sfp-1g-bidi', file: '1783330977657-optical_transceivers_datasheet_v2.pdf' },
  { slug: 'sfp-25g-bidi', folder: 'sfp-25g-bidi', file: '1783331001548-optical_transceivers_datasheet_v2.pdf' },
  { slug: 'sfp-400g', folder: 'sfp-400g', file: '1783331023801-optical_transceivers_datasheet_v2.pdf' },
  { slug: 'smart-sfp', folder: 'smart-sfp', file: '1784289225669-optismart-sfp_otdr.pdf' },
  { slug: 'vfl', folder: 'vfl', file: '1783943932912-bml209_faultlocator_datasheet.pdf' },
  { slug: 'wall-mount', folder: 'wall-mount', file: '1783331162594-wallmountenclosure_datasheet_v2.pdf' },
  { slug: 'htb', folder: 'htb', file: '1783331186274-htb_datasheet_v2.pdf' },
  { slug: 'uav-fiber-optic-spool', folder: 'uav-fiber-optic-spool', file: '1783756573231-pdr_drone_fiber_optic_spool_datasheet.pdf' },
  { slug: 'fpv-optical-terminal', folder: 'fpv-optical-terminal', file: '1783768918509-fpv_optical_terminal_datasheet.pdf' },
  { slug: 'wifi-wireless-fiber-endface-microscope', folder: 'wifi-wireless-fiber-endface-microscope', file: '1784288945242-easyget-wifi-wireless-fiber-endface-microscope.pdf' },
  { slug: 'fusion-splicer', folder: 'fusion-splicer', file: '1783161488386-fusionsplicer_pdr618h_datasheet.pdf' },
  { slug: 'horizontal-closure', folder: 'horizontal-closure', file: '1783932352691-horizontalspliceclosure_htsc-tl16_datasheet.pdf' },
  { slug: 'mpo-assembly', folder: 'mpo-assembly', file: '1783331667551-mpo_cableassembly_datasheet_corrected.pdf' },
  { slug: 'plc-splitter', folder: 'plc-splitter', file: '1783934879647-plc_splitter_datasheet.pdf' },
  { slug: 'rack-mount-fms', folder: 'rack-mount-fms', file: '1783331143774-rackmount_fms_datasheet_v5_rackonly.pdf' },
  { slug: 'sfp-10g-bidi', folder: 'sfp-10g-bidi', file: '1783330935268-optical_transceivers_datasheet_v2.pdf' },
  { slug: 'sfp-copper', folder: 'sfp-copper', file: '1783331063123-optical_transceivers_datasheet_v2.pdf' },
  { slug: 'smpte-assembly', folder: 'smpte-assembly', file: '1783933573432-smpte_cableassembly_datasheet.pdf' },
  { slug: 'sfp-1g-dual', folder: 'sfp-1g-dual', file: '1783331080477-optical_transceivers_datasheet_v2.pdf' },
];

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function copyMissing() {
  let success = 0;
  let failed = 0;

  for (const item of MISSING) {
    const storagePath = `${item.folder}/${item.file}`;
    const publicUrl = `${OLD_SUPABASE_URL}/storage/v1/object/public/product-datasheets/${storagePath}`;

    process.stdout.write(`Copying ${item.slug} (${item.file})... `);

    try {
      // Download from old storage
      const fileBuffer = await downloadFile(publicUrl);

      // Upload to new storage
      const { error } = await newSupabase.storage
        .from('product-datasheets')
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) {
        console.log(`FAILED upload: ${error.message}`);
        failed++;
      } else {
        console.log(`OK (${Math.round(fileBuffer.length / 1024)}KB)`);
        success++;
      }
    } catch (err) {
      console.log(`FAILED download: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Copied: ${success}, Failed: ${failed}`);
}

copyMissing().catch(console.error);
