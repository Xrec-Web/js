document.addEventListener('DOMContentLoaded', () => {
  console.log('[apply-job.js] DOM ready');

  const form = document.querySelector('#wf-form-Form-Apply-Job');
  if (!form) {
    console.warn('[apply-job.js] Form not found');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const jobId = params.get('id');
  if (!jobId) {
    console.error('[apply-job.js] No jobId found in URL.');
    return;
  }
  console.log('[apply-job.js] Found jobId:', jobId);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    // FilePond or other input must have name="fileToUpload"
    if (!formData.get('fileToUpload')) {
      alert('Please upload a resume.');
      return;
    }

    try {
      const response = await fetch(`/api/apply-job.js?id=${jobId}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Application submitted!');
      } else {
        console.error('[apply-job.js] Submission failed:', result);
        alert('Application failed: ' + result.error);
      }
    } catch (error) {
      console.error('[apply-job.js] Error submitting form:', error);
      alert('An error occurred.');
    }
  });
});
