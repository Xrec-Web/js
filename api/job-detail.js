// api/job-detail.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${id}`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch job details' });
  }
}
