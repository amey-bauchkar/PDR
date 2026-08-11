fetch('https://gfzknettmaclomxyimjf.supabase.co/functions/v1/rfq', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTQ2NzksImV4cCI6MjEwMDA5MDY3OX0.0f11BpXLPo6ItGkHgLxi0ihPqCkvmELn0BKK7FCY0qY'
  },
  body: JSON.stringify({
    name: 'Test Bot',
    email: 'test@test.com',
    company: 'Test Corp',
    items: [{ productId: 'test', productName: 'Test Item', quantity: 1 }]
  })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
