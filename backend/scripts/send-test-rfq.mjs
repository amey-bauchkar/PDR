import fetch from 'node-fetch';

async function send() {
  const url = 'http://localhost:3001/api/rfq/submit';
  const body = {
    sessionHash: 'live-test-002',
    name: 'Readable Test',
    email: 'readable@example.com',
    company: 'Acme',
    notes: 'Readable test from assistant',
    items: [
      {
        productId: 'Splice-On Connector (SOC)',
        productName: 'Splice-On Connector (SOC)',
        quantity: 6,
        configuration: {
          specs: 'Insertion Loss (IL): < 0.2dB',
          image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80',
        },
      },
      {
        productId: 'Cat6 Patch Cord',
        productName: 'Cat6 Patch Cord',
        quantity: 6,
        configuration: { specs: 'Standard Factory Specs', image: '/images/live/cat-6-patch-cord.webp' },
      },
    ],
  };

  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error('Error sending test RFQ:', err);
    process.exit(1);
  }
}

send();
