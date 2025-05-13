// apply-job.js

let jobId = '';
let pond;

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[APPLY JOB] DOM ready');

  // Check if modal elements exist
  const modalWrapper = document.querySelector('#fs-modal-1-popup');
  const modalCloseIcon = document.querySelector('.fs_modal-1_close-3');

  if (!modalWrapper || !modalCloseIcon) {
    console.warn('[APPLY JOB] Modal elements not found. Ensure modal is in the DOM.');
  } else {
    console.log('[APPLY JOB] Modal elements found.');
    modalCloseIcon.addEventListener('click', () => {
      modalWrapper.classList.remove('active');
      console.log('[APPLY JOB] Modal closed.');
    });
  }

  // Initialize FilePond for file uploads
  const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
  if (!inputElement) {
    console.warn('[APPLY JOB] File input not found. Ensure the file input is present in the form.');
  } else {
    console.log('[APPLY JOB] File input found.');
    pond = FilePond.create(inputElement, {
      credits: false,
      name: 'resume',
      storeAsFile: true,
    });
  }

  // Check if apply buttons are present
  const applyButtons = document.querySelectorAll('[apply-button]');
  if (applyButtons.length === 0) {
    console.warn('[APPLY JOB] No apply buttons found. Ensure they have the apply-button attribute.');
  } else {
    console.log('[APPLY JOB] Apply buttons found:', applyButtons.length);
    applyButtons.forEach((button) => {
      button.addEventListener('click', () => {
        jobId = button.getAttribute('apply-button');
        console.log('[APPLY JOB] Job ID set:', jobId);
        if (modalWrapper) modalWrapper.classList.add('active');
      });
    });
  }

  // Form submission handler
  const form = document.querySelector('#wf-form-Apply-Job-Form');
  if (!form) {
    console.warn('[APPLY JOB] Job application form not found. Ensure the form has the correct ID.');
  } else {
    console.log('[APPLY JOB] Form found:', form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check if FilePond has a file selected
      const file = pond?.getFile();
      if (!file) {
        console.warn('[APPLY JOB] No resume file selected.');
        alert('Please upload a resume before submitting.');
        return;
      }
      console.log('[APPLY JOB] Resume file selected:', file.file.name);

      // Prepare form data
      const formData = new FormData();
      formData.append('name', document.getElementById('name-2')?.value || '');
      formData.append('email', document.getElementById('email-2')?.value || '');
      formData.append('phone', document.getElementById('phone-2')?.value || '');
      formData.append('linkedin', document.getElementById('linkedin-2')?.value || '');
      formData.append('resume', file.file, file.file.name);

      // UI updates
      const submitButton = document.querySelector('.submit-button-apply-job');
      if (!submitButton) {
        console.warn('[APPLY JOB] Submit button not found.');
      } else {
        submitButton.value = 'Please Wait...';
        submitButton.disabled = true;
        submitButton.style.cursor = 'not-allowed';
      }

      try {
        console.log('[APPLY JOB] Sending application...');
        const response = await fetch('/api/apply-job', {
          method: 'POST',
          headers: {
            JobId: jobId,
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          console.log('[APPLY JOB] Application submitted successfully:', result);
          Toastify({
            text: 'Your application was successfully sent!',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: { background: '#527853', color: '#fff' },
          }).showToast();

          // Reset UI and form
          form.reset();
          pond.removeFile();
          if (modalWrapper) modalWrapper.classList.remove('active');
        } else {
          console.error('[APPLY JOB] Submission failed', result);
          alert('Application failed: ' + (result?.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('[APPLY JOB] Error submitting form', err);
        alert('Something went wrong. Please try again later.');
      } finally {
        // Reset submit button state
        if (submitButton) {
          submitButton.value = 'Submit';
          submitButton.disabled = false;
          submitButton.style.cursor = 'pointer';
        }
      }
    });
  }
});
