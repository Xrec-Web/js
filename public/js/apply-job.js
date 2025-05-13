(function () {
  console.log('[APPLY JOB] DOM ready, starting script');

  // Global flag to check if everything is initialized
  let isReady = false;
  let filePondInitialized = false;

  // Function to handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const fileInput = document.querySelector('input[type="file"][name="fileToUpload"]');
    if (!fileInput) {
      console.warn('[APPLY JOB] File input element not found.');
      alert('Please upload a resume.');
      return false;
    }

    const pond = FilePond.find(fileInput);
    if (!pond) {
      console.warn('[APPLY JOB] FilePond instance not found.');
      alert('Please upload a resume.');
      return false;
    }

    const file = pond.getFile();
    if (!file) {
      alert('Please upload a resume.');
      return false;
    }

    // Gather form field data
    const emailEl = document.getElementById('Email');
    const nameEl = document.getElementById('Name');
    const phoneEl = document.getElementById('Phone');
    const linkedinEl = document.getElementById('LinkedIn');

    if (!emailEl || !nameEl || !phoneEl || !linkedinEl) {
      alert('Form is misconfigured. Please contact the site administrator.');
      return false;
    }

    const form = new FormData();
    form.append('email', emailEl.value);
    form.append('name', nameEl.value);
    form.append('phone', phoneEl.value);
    form.append('linkedin', linkedinEl.value);
    form.append('resume', file.file, file.file.name);

    const jobId = new URLSearchParams(window.location.search).get('id');
    if (!jobId) {
      console.error('[ERROR] No job ID found.');
      alert('Error: Job ID not found.');
      return false;
    }

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        JobId: jobId,
      },
      body: form,
    };

    // Disable submit button while waiting for the response
    const submitButton = document.querySelector('.submit-button-apply-job');
    submitButton.value = 'Please Wait...';
    submitButton.style.cursor = 'not-allowed';
    submitButton.setAttribute('disabled', true);

    try {
      const response = await fetch(`${API_BASE_URL}/apply-job`, options);
      const responseData = await response.json();

      if (responseData.success) {
        document.querySelector('.fs_modal-1_close-2').click();
        Toastify({
          text: 'Your application was successfully sent!',
          duration: 2000,
          gravity: 'top',
          position: 'center',
          style: { background: '#527853', color: '#FFFFFF' },
        }).showToast();

        pond.removeFile();
        document.querySelector('#wf-form-Form-Apply-Job').reset();
      } else {
        console.error('Failed to submit the form:', responseData);
        alert('Failed to submit the form. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      submitButton.value = 'Submit';
      submitButton.style.cursor = 'pointer';
      submitButton.removeAttribute('disabled');
    }
  }

  // Function to initialize FilePond and bind submit event
  function initializeFilePond() {
    if (typeof FilePond === 'undefined') {
      console.warn('[APPLY JOB] FilePond library is not loaded yet.');
      setTimeout(initializeFilePond, 500); // Retry in 500ms
      return;
    }

    const fileInput = document.querySelector('input[type="file"][name="fileToUpload"]');
    if (fileInput) {
      const pond = FilePond.create(fileInput, {
        credits: false,
        storeAsFile: true
      });

      pond.on('ready', function() {
        console.log('[APPLY JOB] FilePond is ready.');

        const formElement = document.querySelector('#wf-form-Form-Apply-Job');
        if (formElement) {
          formElement.addEventListener('submit', handleFormSubmit);
          console.log('[APPLY JOB] Form submit listener bound.');
        }

        filePondInitialized = true;
        checkAllReady();
      });
    } else {
      console.warn('[APPLY JOB] File input not found.');
    }
  }

  // Function to check if job-detail.js has initialized the job data
  function checkJobDetailInitialization() {
    const jobDetailElement = document.querySelector('.job-detail-container');
    if (jobDetailElement) {
      console.log('[APPLY JOB] job-detail.js initialized.');
      initializeFilePond();
    } else {
      console.warn('[APPLY JOB] Job detail not initialized yet.');
    }
  }

  // Check if all dependencies are ready
  function checkAllReady() {
    if (filePondInitialized && isReady) {
      console.log('[APPLY JOB] All dependencies are ready. Running script.');
      // Now it's safe to execute apply-job.js functionality
    }
  }

  // Wait for DOMContentLoaded to ensure the page is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[APPLY JOB] DOM is fully loaded.');
    checkJobDetailInitialization(); // Check job details and FilePond initialization
  });
})();
