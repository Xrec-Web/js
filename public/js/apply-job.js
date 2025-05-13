document.addEventListener('DOMContentLoaded', function () {
  console.log('[APPLY JOB] DOM ready');

  Webflow.push(function () {
    // Extract job ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');
    if (!jobId) {
      console.error('[APPLY JOB] No job ID found in URL');
      return;
    }
    console.log(`[APPLY JOB] Job ID from URL: ${jobId}`);

    // Start polling for the file input and form
    const initInterval = setInterval(() => {
      const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
      const form = document.querySelector('#wf-form-Apply-Job-Form');
      const applyButton = document.querySelector('.apply-button');

      if (!inputElement || !form || !applyButton) {
        // Keep waiting until all elements are ready
        return;
      }

      clearInterval(initInterval); // Stop polling once everything is found
      console.log('[APPLY JOB] All required elements found. Initializing form.');

      // Initialize FilePond
      const pond = FilePond.create(inputElement, {
        credits: false,
        name: 'fileToUpload',
        storeAsFile: true,
      });

      // Attach job ID to button
      applyButton.setAttribute('data-job-id', jobId);

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
            JobId: jobId,
          },
          body: formData,
        };

        applyButton.innerHTML = 'Please Wait...';
        applyButton.disabled = true;

        try {
          const response = await fetch('/api/apply-job', options);
          const data = await response.json();

          if (!response.ok) {
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
        } catch (err) {
          console.error('[APPLY JOB] Submission error:', err);
          Toastify({
            text: 'There was an error submitting your application.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: { background: '#d9534f', color: '#FFFFFF' },
          }).showToast();
        } finally {
          applyButton.innerHTML = 'Submit';
          applyButton.disabled = false;
        }
      });
    }, 300); // Check every 300ms
  });
});
