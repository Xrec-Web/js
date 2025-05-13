(function () {
  console.log('[APPLY JOB] DOM ready, starting script');

  // Global flag to check if everything is initialized
  let isReady = false;

  // Function to handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    // Ensure that the file input exists
    const fileInput = document.querySelector('input[type="file"][name="fileToUpload"]');
    if (!fileInput) {
      console.warn('[APPLY JOB] File input element not found.');
      alert('Please upload a resume.');
      return false;
    }

    // Initialize FilePond instance
    const pond = FilePond.find(fileInput);
    if (!pond) {
      console.warn('[APPLY JOB] FilePond instance not found.');
      alert('Please upload a resume.');
      return false;
    }

    const file = pond.getFile(); // Get the uploaded file via FilePond
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

    const jobId = new URLSearchParams(window.location.search).get('id'); // Get job ID from URL
    if (!jobId) {
      console.error('[ERROR] No job ID found.');
      alert('Error: Job ID not found.');
      return false;
    }

    // Prepare options for the API request
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
      // Send the application data to the server
      const response = await fetch(`${API_BASE_URL}/apply-job`, options);
      const responseData = await response.json();

      if (responseData.success) {
        // Close the modal and show success message
        document.querySelector('.fs_modal-1_close-2').click();
        Toastify({
          text: 'Your application was successfully sent!',
          duration: 2000,
          gravity: 'top',
          position: 'center',
          style: { background: '#527853', color: '#FFFFFF' },
        }).showToast();

        // Reset the form and remove the file from FilePond
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
      // Re-enable the submit button after the request is complete
      submitButton.value = 'Submit';
      submitButton.style.cursor = 'pointer';
      submitButton.removeAttribute('disabled');
    }
  }

  // Function to initialize FilePond and bind submit event
  function initializeFilePond() {
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

        // Now that everything is ready, set the isReady flag
        isReady = true;
        console.log('[APPLY JOB] All dependencies are ready.');
      });
    } else {
      console.warn('[APPLY JOB] File input not found.');
    }
  }

  // Function to check if job-detail.js has initialized the job data
  function checkJobDetailInitialization() {
    const jobDetailElement = document.querySelector('.job-detail-container'); // Or a more specific selector
    if (jobDetailElement) {
      console.log('[APPLY JOB] job-detail.js initialized.');
      initializeFilePond(); // Initialize FilePond once job details are ready
    } else {
      console.warn('[APPLY JOB] Job detail not initialized yet.');
    }
  }

  // Wait for DOMContentLoaded to ensure the page is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[APPLY JOB] DOM is fully loaded.');

    // Check if job-detail.js has initialized
    const interval = setInterval(() => {
      if (isReady) {
        clearInterval(interval);  // Stop checking once everything is ready
        console.log('[APPLY JOB] All dependencies are ready to go.');
      }
    }, 200);  // Check every 200ms until everything is ready

    // Call the function to check job-detail.js initialization
    checkJobDetailInitialization();
  });
})();
