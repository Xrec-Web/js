import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, jobid');

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Enforce POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ Support job ID via query or header
  const jobId = req.headers['jobid'] || req.query.id;
  if (!jobId) {
    return res.status(400).json({ error: 'Missing Job ID' });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[ERROR] Form parse failed:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const { name, email, phone, linkedin } = fields;
    const resumeFile = files.resume;

    if (!resumeFile) {
      return res.status(400).json({ error: 'Missing resume file' });
    }

    try {
      // ✅ Upload resume to Loxo
      const resumeStream = fs.createReadStream(resumeFile.filepath);
      const formData = new FormData();
      formData.append('file', resumeStream, resumeFile.originalFilename);

      const uploadRes = await fetch('https://api.loxo.co/resume/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LOXO_BEARER_TOKEN}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.resume_id) {
        console.error('[UPLOAD ERROR]', uploadData);
        return res.status(500).json({
          error: 'Resume upload failed',
          details: uploadData,
        });
      }

      const resumeId = uploadData.resume_id;

      // ✅ Submit job application to Loxo
      const applyRes = await fetch(`https://api.loxo.co/job/apply/${jobId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LOXO_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: name || '',
          last_name: '', // Optional
          email: email || '',
          phone: phone || '',
          resume_id: resumeId,
          linkedin_url: linkedin || '',
        }),
      });

      const applyData = await applyRes.json();

      if (!applyRes.ok) {
        console.error('[APPLY ERROR]', applyData);
        return res.status(applyRes.status).json({
          error: 'Application failed',
          details: applyData,
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[SERVER ERROR]', error);
      return res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
}
