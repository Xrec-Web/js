(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  function setupFileUpload() {
    const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
    if (!inputElement) {
      console.warn('[LOXO APPLY JOB] No file input found.');
      return null;
    }

    return FilePond.create(inputElement, {
      credits: false,
      name: 'fileToUpload',
      storeAsFile: true,
    });
  }

  function setupFormSubmission(jobId, pond) {
    const form = document.getElementById('wf-form-Form-Apply-Job');
    if (!form) {
      console.warn('[LOXO APPLY JOB] No form found.');
      return;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const file = pond.getFile();
      if (!file) {
        alert('Please upload a resume.');
        return;
      }

      const email = document.getElementById('Email')?.value;
      const name = document.getElementById('Name')?.value;
      const phone = document.getElementById('Phone')?.value;
      const linkedin = document.getElementById('LinkedIn')?.value;

      if (!email || !name || !phone || !linkedin) {
        alert('Please complete all fields.');
        return;
      }

      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('linkedin', linkedin);
      formData.append('resume', file.file, file.file.name);

      const submitButton = form.querySelector('.submit-button-apply-job');
      if (submitButton) {
        submitButton.value = 'Please Wait...';
        submitButton.disabled = true;
        submitButton.style.cursor = 'not-allowed';
      }

      try {
        const response = await fetch(`${API_BASE_URL}/apply-job`, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            JobId: jobId,
          },
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          Toastify({
            text: 'Your application was successfully sent!',
            duration: 2000,
            gravity: 'top',
            position: 'center',
            style: { background: '#527853', color: '#FFFFFF' },
          }).showToast();

          pond.removeFile();
          form.reset();
          document.querySelector('.fs_modal-1_close-2')?.click();
        } else {
          console.error('[ERROR] Form submission failed:', result);
          alert('Failed to submit application. Please try again.');
        }
      } catch (err) {
        console.error('[ERROR] Form submission error:', err);
        alert('An error occurred. Please try again.');
      } finally {
        if (submitButton) {
          submitButton.value = 'Submit';
          submitButton.disabled = false;
          submitButton.style.cursor = 'pointer';
        }
      }
    });
  }

  function initialize() {
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      console.warn('[LOXO APPLY JOB] No job ID found in URL.');
      return;
    }

    console.log('[LOXO APPLY JOB] Initializing for Job ID:', jobId);
    const pond = setupFileUpload();
    if (pond) {
      setupFormSubmission(jobId, pond);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
