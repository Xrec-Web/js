document.addEventListener('DOMContentLoaded', function () {
  console.log('[APPLY JOB] DOM ready');

  const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
  if (!inputElement) {
    console.error('[APPLY JOB] File input not found. Ensure the file input is present in the form.');
    return;
  }

  const pond = FilePond.create(inputElement, {
    credits: false,
    name: 'fileToUpload',
    storeAsFile: true,
  });

  Webflow.push(function () {
    const form = document.querySelector('#wf-form-Apply-Job-Form');
    const applyButton = document.querySelector('.apply-button');

    // Check for form and button
    if (!form) {
      console.error('[APPLY JOB] Job application form not found. Ensure the form has the correct ID.');
      return;
    }

    if (!applyButton) {
      console.error('[APPLY JOB] Apply button not found. Ensure it has class "apply-button".');
      return;
    }

    // Extract job ID from URL (same method as job-detail.js)
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');
    if (!jobId) {
      console.error('[APPLY JOB] No job ID found in URL query string (e.g., ?id=123456).');
      return;
    }

    // Apply the job ID to the button's dataset
    applyButton.setAttribute('data-job-id', jobId);
    console.log(`[APPLY JOB] Job ID set on button: ${jobId}`);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const resumeFile = pond.getFile();
      if (!resumeFile) {
        alert('Please upload a resume.');
        return;
      }

      const formData = new FormData();
      formData.append('email', document.getElementById('email-2')?.value || '');
      formData.append('name', document.getElementById('name-2')?.value || '');
      formData.append('phone', document.getElementById('phone-2')?.value || '');
      formData.append('linkedin', document.getElementById('linkedin-2')?.value || '');
      formData.append('resume', resumeFile.file, resumeFile.file.name);

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'JobId': jobId,
        },
        body: formData,
      };

      // Disable button and show loading state
      applyButton.innerHTML = 'Please Wait...';
      applyButton.disabled = true;

      try {
        const response = await fetch('/api/apply-job', options);
        const data = await response.json();

        if (!response.ok) {
          console.error('[APPLY JOB] API responded with error:', data);
          throw new Error(data?.error || 'Application failed');
        }

        console.log('[APPLY JOB] Application successful:', data);

        Toastify({
          text: 'Your application was successfully sent!',
          duration: 2000,
          gravity: 'top',
          position: 'center',
          style: { background: '#527853', color: '#FFFFFF' },
        }).showToast();

        form.reset();
        pond.removeFile();
        applyButton.innerHTML = 'Submit';
        applyButton.disabled = false;
      } catch (err) {
        console.error('[APPLY JOB] Submission failed:', err);

        Toastify({
          text: 'There was an error submitting your application.',
          duration: 3000,
          gravity: 'top',
          position: 'center',
          style: { background: '#d9534f', color: '#FFFFFF' },
        }).showToast();

        applyButton.innerHTML = 'Submit';
        applyButton.disabled = false;
      }
    });
  });
});
