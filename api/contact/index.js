import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone, company, inquiryType, message } = req.body;
    if (!firstName || !lastName || !email || !phone || !company || !inquiryType) {
      return res.status(400).json({ success: false, error: 'Missing required contact fields' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(201).json({ success: true, data: { id: `local-${Date.now()}`, createdAt: new Date().toISOString() } });
    }

    const { data, error } = await supabase.from('contact_inquiries').insert({
      first_name: firstName.trim(), last_name: lastName.trim(),
      email: email.trim(), phone: phone.trim(),
      company: company.trim(), inquiry_type: inquiryType.trim(),
      message: message?.trim() || '',
    }).select('id, created_at').single();

    if (error || !data) {
      return res.status(500).json({ success: false, error: 'Failed to submit contact inquiry' });
    }
    return res.status(201).json({ success: true, data: { id: data.id, createdAt: data.created_at } });
  } catch (err) {
    console.error('Contact submission error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
