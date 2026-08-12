import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // We use service role key to bypass RLS for admin operations
    const supabaseKey = Deno.env.get('MY_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Storage not configured (missing env vars)')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Parse the slug from the URL if present
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    const slugFromUrl = lastPart !== 'products-admin' && lastPart !== '' ? decodeURIComponent(lastPart) : null

    if (req.method === 'DELETE') {
      if (!slugFromUrl) throw new Error("Missing slug for deletion")
      const { data, error } = await supabase.from('catalog_products').delete().eq('slug', slugFromUrl).select()
      if (error) throw error
      
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      })
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const product = await req.json()
      const isUpdate = req.method === 'PUT'
      const previousSlug = slugFromUrl || product.slug

      // Category logic
      let categoryId = null
      const fullCategory = product.category || 'Active Components'
      const catParts = fullCategory.split(' > ')
      const mainCatName = catParts[0].trim()
      const subcategoryName = catParts.length > 1 ? catParts.slice(1).join(' > ').trim() : ''
      
      const { data: catData } = await supabase.from('product_categories').select('id').ilike('name', mainCatName).limit(1)
      
      if (catData && catData.length > 0) {
        categoryId = catData[0].id
      } else {
        const { data: newCat } = await supabase.from('product_categories').upsert({
          slug: mainCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          name: mainCatName,
          description: `Category for ${mainCatName}`
        }, { onConflict: 'slug' }).select('id').single()
        if (newCat) categoryId = newCat.id
      }

      const specsMap = (product.specs || []).reduce((acc: any, s: any) => { acc[s.label] = s.value; return acc; }, {})
      
      const productRow = {
        slug: product.slug,
        category_id: categoryId,
        name: product.name,
        title: product.title || `${product.name} | PDR World`,
        tagline: product.tagline || '',
        description: product.description || '',
        canonical_url: product.canonical || `https://pdrworld.com/products/${product.slug}`,
        hero_icon_svg: product.heroIcon || '',
        image_url: product.imageUrl || '',
        status: product.status === 'Active' ? 'published' : (product.status === 'Draft' ? 'draft' : 'archived'),
        metadata: {
          environment: specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor',
          mount_type: specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount',
          capacity: parseInt(specsMap['Capacity'] || specsMap['Ports'] || '0') || 0,
          specs: specsMap,
          subcategory: subcategoryName,
          datasheet_url: product.datasheetUrl || '',
          gallery_urls: product.galleryUrls || [],
          tags: product.tags || [],
        },
        updated_at: new Date().toISOString(),
      }

      if (isUpdate) {
        const { data: orig, error: origError } = await supabase.from('catalog_products').select('id').eq('slug', previousSlug).single()
        if (origError) throw origError
        
        if (orig) {
          const { data: updated, error: updateError } = await supabase.from('catalog_products').update(productRow).eq('id', orig.id).select()
          if (updateError) throw updateError
          
          const dbProdId = orig.id
          await supabase.from('catalog_product_features').delete().eq('product_id', dbProdId)
          await supabase.from('catalog_product_applications').delete().eq('product_id', dbProdId)
          await supabase.from('catalog_product_specs').delete().eq('product_id', dbProdId)
          
          if (product.features?.length) await supabase.from('catalog_product_features').insert(product.features.map((f: string, i: number) => ({ product_id: dbProdId, position: i, feature: f })))
          if (product.applications?.length) await supabase.from('catalog_product_applications').insert(product.applications.map((a: string, i: number) => ({ product_id: dbProdId, position: i, application: a })))
          if (product.specs?.length) await supabase.from('catalog_product_specs').insert(product.specs.map((s: any, i: number) => ({ product_id: dbProdId, position: i, label: s.label, value: s.value })))
        }
      } else {
        const { data: maxSortData, error: maxSortError } = await supabase.from('catalog_products').select('sort_order').order('sort_order', { ascending: false }).limit(1)
        if (maxSortError) throw maxSortError
        
        const nextSortOrder = maxSortData && maxSortData.length > 0 ? (maxSortData[0].sort_order + 1) : 0
        const { data: inserted, error: insertError } = await supabase.from('catalog_products').insert({ ...productRow, sort_order: nextSortOrder }).select().single()
        
        if (insertError) throw insertError
        
        if (inserted) {
          const dbProdId = inserted.id
          if (product.features?.length) await supabase.from('catalog_product_features').insert(product.features.map((f: string, i: number) => ({ product_id: dbProdId, position: i, feature: f })))
          if (product.applications?.length) await supabase.from('catalog_product_applications').insert(product.applications.map((a: string, i: number) => ({ product_id: dbProdId, position: i, application: a })))
          if (product.specs?.length) await supabase.from('catalog_product_specs').insert(product.specs.map((s: any, i: number) => ({ product_id: dbProdId, position: i, label: s.label, value: s.value })))
        }
      }

      return new Response(JSON.stringify({ success: true, data: product }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      })
    }

    // Unhandled method
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 405 
    })

  } catch (err: any) {
    console.error('Error handling product API:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process product',
        message: err.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
