// File: /api/jobs.js
export default async function handler(req, res) {
  // Set CORS headers to allow your Webflow site
  res.setHeader('Access-Control-Allow-Origin', 'https://loxo-buildout.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Your Loxo credentials (use environment variables)
  const AGENCY_SLUG = process.env.AGENCY_SLUG; // Replace with correct slug if needed
  const BEARER_TOKEN = process.env.LOXO_BEARER_TOKEN;
  
  try {
    // Server-side request to Loxo (protected from CORS issues)
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Return data to client
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ error: 'Unable to load job listings. Please try again later.' });
  }
}
