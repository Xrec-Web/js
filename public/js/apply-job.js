(function () {
  console.log('[APPLY JOB] DOM ready, starting script');

  // Function to handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    // Wait until FilePond is fully initialized
    let pond = FilePond.find(document.querySelector('input[type="file"][name="fileToUpload"]'));

    // Add an interval check if FilePond is still initializing
    let retries = 0;
    const maxRetries = 10; // max retry attempts
    const retryDelay = 300; // milliseconds

    while (!pond && retries < maxRetries) {
      console.log('[APPLY JOB] Waiting for FilePond to initialize...');
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      pond = FilePond.find(document.querySelector('input[type="file"][name="fileToUpload"]'));
      retries++;
    }

    if (!pond) {
      console.warn('[APPLY JOB] FilePond instance not found after retrying.');
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

  // Set up the form submission
  const formElement = document.querySelector('#wf-form-Form-Apply-Job');
  if (formElement) {
    formElement.addEventListener('submit', handleFormSubmit);
  }
})();
