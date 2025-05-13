document.addEventListener('DOMContentLoaded', function () {
  const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
  const pond = FilePond.create(inputElement, {
    credits: false,
    name: 'fileToUpload',
    storeAsFile: true,
  });

  Webflow.push(function () {
    const applyButton = document.querySelector('#apply-button'); // The submit button

    // Check if apply button is found
    if (!applyButton) {
      console.error('[APPLY JOB] Apply button not found');
      return;
    }

    const jobId = applyButton.getAttribute('data-job-id'); // Get job ID from data attribute
    if (!jobId) {
      console.error('[APPLY JOB] Missing Job ID in apply button');
      return;
    }

    const form = document.querySelector('#wf-form-Apply-Job-Form'); // The job application form

    if (!form) {
      console.error('[APPLY JOB] Job application form not found');
      return;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault(); // Prevent default form submission

      const file = pond.getFile();
      if (!file) {
        alert('Please upload a resume.');
        return;
      }

      const formData = new FormData();
      formData.append('email', document.getElementById('email-2').value);
      formData.append('name', document.getElementById('name-2').value);
      formData.append('phone', document.getElementById('phone-2').value);
      formData.append('linkedin', document.getElementById('linkedin-2').value);
      formData.append('resume', file.file, file.file.name); // Ensure file is sent with name

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'JobId': jobId, // Send Job ID as a header
        },
        body: formData,
      };

      // Disable the apply button and show loading text
      applyButton.innerHTML = 'Please Wait...';
      applyButton.disabled = true;

      try {
        const response = await fetch('/api/apply-job', options);

        if (!response.ok) {
          throw new Error('Application failed');
        }

        const data = await response.json();
        console.log('[APPLY JOB] Application successful', data);

        Toastify({
          text: 'Your application was successfully sent!',
          duration: 2000,
          gravity: 'top',
          position: 'center',
          style: { background: '#527853', color: '#FFFFFF' },
        }).showToast();

        pond.removeFile();
        form.reset();
        applyButton.innerHTML = 'Submit';
        applyButton.disabled = false;
      } catch (error) {
        console.error('[APPLY JOB] Error during submission:', error);
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
