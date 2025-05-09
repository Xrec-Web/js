// File: /api/apply-job.js
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS headers for Webflow
  res.setHeader('Access-Control-Allow-Origin', 'https://loxo-buildout.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight OK
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jobId = req.query.id;
  if (!jobId) {
    return res.status(400).json({ error: 'Missing job ID' });
  }

  const AGENCY_SLUG = process.env.AGENCY_SLUG;
  const BEARER_TOKEN = process.env.LOXO_BEARER_TOKEN;

  try {
    const rawBody = await buffer(req);

    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': req.headers['content-type'],
      },
      body: rawBody,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Loxo API error:', result);
      return res.status(response.status).json({ error: 'Failed to apply', details: result });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
