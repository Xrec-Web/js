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
    // Extract job ID from URL first
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');
    if (!jobId) {
      console.error('[APPLY JOB] No job ID found in URL');
      return;
    }
    console.log(`[APPLY JOB] Job ID from URL: ${jobId}`);

    // Wait for DOM elements to be fully present
    const form = document.querySelector('#wf-form-Apply-Job-Form');
    const applyButton = document.querySelector('.apply-button');

    if (!form) {
      console.error('[APPLY JOB] Job application form not found');
      return;
    }

    if (!applyButton) {
      console.error('[APPLY JOB] Apply button not found');
      return;
    }

    // ✅ Set job ID to button *before* using it
    applyButton.setAttribute('data-job-id', jobId);

    // ✅ Confirm it's applied
    const buttonJobId = applyButton.getAttribute('data-job-id');
    if (!buttonJobId) {
      console.error('[APPLY JOB] Failed to assign job ID to button');
      return;
    }

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
          console.error('[APPLY JOB] API error:', data);
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
  });
});
