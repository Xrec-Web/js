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

    // Function to initialize form once it's in the DOM
    const initializeForm = () => {
      const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
      const form = document.querySelector('#wf-form-Apply-Job-Form');
      const applyButton = document.querySelector('#apply-button'); // Updated to use ID

      if (!inputElement || !form || !applyButton) {
        return false;
      }

      console.log('[APPLY JOB] All elements found. Initializing FilePond and form handler.');

      // Initialize FilePond
      const pond = FilePond.create(inputElement, {
        credits: false,
        name: 'fileToUpload',
        storeAsFile: true,
      });

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

      return true;
    };

    // Observe modal insertion into DOM
    const observer = new MutationObserver(() => {
      if (initializeForm()) {
        observer.disconnect(); // Stop observing once initialized
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
});
