// /api/apply-job.js

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jobId = req.headers['jobid'];
  if (!jobId) {
    return res.status(400).json({ error: 'Missing Job ID' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing error' });

    const { name, email, phone, linkedin } = fields;
    const resumeFile = files.resume;

    if (!resumeFile) {
      return res.status(400).json({ error: 'Missing resume file' });
    }

    try {
      const resumeStream = fs.createReadStream(resumeFile.filepath);
      const formData = new FormData();
      formData.append('file', resumeStream, resumeFile.originalFilename);

      const uploadRes = await fetch('https://api.loxo.co/resume/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LOXO_API_KEY}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        return res.status(500).json({ error: 'Resume upload failed', details: uploadData });
      }

      const resumeId = uploadData.resume_id;

      const applyRes = await fetch(`https://api.loxo.co/job/apply/${jobId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LOXO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: name,
          last_name: '',
          email,
          phone,
          resume_id: resumeId,
          linkedin_url: linkedin,
        }),
      });

      const applyData = await applyRes.json();

      if (!applyRes.ok) {
        return res.status(applyRes.status).json({ error: 'Application failed', details: applyData });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
}
