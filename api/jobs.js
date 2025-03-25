// api/jobs.js
export default async function handler(req, res) {
  // Allow requests from your Webflow site
  res.setHeader('Access-Control-Allow-Origin', '*');  // Replace * with your Webflow domain for better security
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Replace with your Loxo credentials
  const AGENCY_SLUG = 'rover-recruitment'; // Replace with your agency slug
  const BEARER_TOKEN = 'YOUR_BEARER_TOKEN'; // Replace with your actual token
  
  try {
    // Get data from Loxo
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Return the data to the client
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Loxo:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
