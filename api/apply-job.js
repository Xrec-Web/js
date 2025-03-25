// api/apply-job.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get job ID from query parameter
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  
  // Replace with your Loxo credentials
  const AGENCY_SLUG = 'rover-recruitment';
  const BEARER_TOKEN = 'YOUR_BEARER_TOKEN';
  
  try {
    // Forward the application data to Loxo
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${id}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit application' });
  }
}
