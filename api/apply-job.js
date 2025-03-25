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
  const BEARER_TOKEN = '8f4998dbcf4615d2c28f8063040d916e49e44d2aca927b5abbef53d7746754e31e49f4aa385ff40368ec86ec1b1e95fddd23c5cb0e7f349259eab2ff83ec9f0f70185b2c56c962e1f432c619a1dad40c3bf76e157c6a6d18c9521452e8d72390c4de9e496fa87236728b9a77cb8a7bd5a0334f795745700526fdc83eb68a3afa';
  
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
