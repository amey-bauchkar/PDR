import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const OLD_PREFIX = 'https://gfzknettmaclomxyimjf.supabase.co/storage/v1/object/public';
  const NEW_PREFIX = '/cdn/storage';

  try {
    const { data: products, error: fetchError } = await supabase
      .from('catalog_products')
      .select('id, image_url, metadata');

    if (fetchError) throw fetchError;

    let updatedCount = 0;

    // Filter products that actually need updates
    const updates = products.map(product => {
      let needsUpdate = false;
      let newImageUrl = product.image_url;
      let newMetadata = { ...product.metadata };

      if (newImageUrl && newImageUrl.includes(OLD_PREFIX)) {
        newImageUrl = newImageUrl.replace(OLD_PREFIX, NEW_PREFIX);
        needsUpdate = true;
      }

      if (newMetadata.datasheet_url && newMetadata.datasheet_url.includes(OLD_PREFIX)) {
        newMetadata.datasheet_url = newMetadata.datasheet_url.replace(OLD_PREFIX, NEW_PREFIX);
        needsUpdate = true;
      }

      if (newMetadata.gallery_urls && Array.isArray(newMetadata.gallery_urls)) {
        const newGallery = newMetadata.gallery_urls.map(url => {
          if (url.includes(OLD_PREFIX)) {
            needsUpdate = true;
            return url.replace(OLD_PREFIX, NEW_PREFIX);
          }
          return url;
        });
        newMetadata.gallery_urls = newGallery;
      }

      if (needsUpdate) {
        return {
          id: product.id,
          image_url: newImageUrl,
          metadata: newMetadata
        };
      }
      return null;
    }).filter(Boolean);

    // Update in parallel (Supabase will handle multiple concurrent requests quickly)
    await Promise.all(updates.map(update => 
      supabase
        .from('catalog_products')
        .update({
          image_url: update.image_url,
          metadata: update.metadata
        })
        .eq('id', update.id)
    ));

    updatedCount = updates.length;

    return res.status(200).json({ success: true, message: `Migrated ${updatedCount} products to CDN proxy.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
