document.addEventListener('DOMContentLoaded', () => {
  console.log('[apply-job.js] DOM loaded');

  const jobId = new URLSearchParams(window.location.search).get('id');
  if (!jobId) {
    console.warn('[apply-job.js] No jobId found in URL.');
    return;
  }

  const form = document.getElementById('wf-form-Form-Apply-Job');
  if (!form) {
    console.error('[apply-job.js] Form with ID wf-form-Form-Apply-Job not found.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Debug: Log all form fields
    console.log('[apply-job.js] FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    const file = formData.get('fileToUpload');
    if (!file || !(file instanceof File) || file.size === 0) {
      alert('Please upload a resume');
      return;
    }

    try {
      const response = await fetch(`https://loxo-buildout.vercel.app/api/apply-job?id=${jobId}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[apply-job.js] Error submitting form to Loxo:', result);
        alert('There was a problem submitting your application. Please try again.');
        return;
      }

      console.log('[apply-job.js] Submission successful:', result);
      alert('Application submitted successfully!');
      form.reset();
    } catch (error) {
      console.error('[apply-job.js] Submission failed:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
