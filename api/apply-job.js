// File: /api/apply-job.js
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Set CORS headers to allow your Webflow site
  res.setHeader('Access-Control-Allow-Origin', 'https://loxo-buildout.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get job ID from query parameter
  const jobId = req.query.id;
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  
  // Your Loxo credentials
  const AGENCY_SLUG = 'skys-the-limit-staffing'; // Replace with correct slug if needed
  const BEARER_TOKEN = process.env.LOXO_BEARER_TOKEN; // Will set this in Vercel
  
  try {
    // Get raw request body (for forwarding file uploads)
    const rawBody = await buffer(req);
    
    // Forward to Loxo API
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': req.headers['content-type'],
      },
      body: rawBody
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Return success response
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ error: 'Failed to submit application. Please try again later.' });
  }
}
