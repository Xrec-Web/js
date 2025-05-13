document.addEventListener('DOMContentLoaded', function () {
  console.log('[APPLY JOB] DOM ready');

  const fileInput = document.querySelector('input[type="file"][name="fileToUpload"]');

  if (!fileInput) {
    console.error('[APPLY JOB] File input not found. Ensure the file input is present in the form.');
    return;
  }

  console.log('[APPLY JOB] File input found:', fileInput);

  const pond = FilePond.create(fileInput, {
    credits: false,
    name: 'fileToUpload',
    storeAsFile: true,
    onaddfile: (err, fileItem) => {
      if (err) {
        console.error('[APPLY JOB] Error adding file:', err);
      } else {
        console.log('[APPLY JOB] File added to pond:', fileItem.file.name);
      }
    },
    onremovefile: () => {
      console.log('[APPLY JOB] File removed from pond');
    },
  });

  Webflow.push(function () {
    const applyButton = document.querySelector('#apply-button');
    const form = document.querySelector('#wf-form-Apply-Job-Form');

    if (!form) {
      console.error('[APPLY JOB] Application form not found. Ensure the form has ID "wf-form-Apply-Job-Form".');
      return;
    }

    if (!applyButton) {
      console.error('[APPLY JOB] Apply button not found. Ensure it has ID "apply-button".');
      return;
    }

    // Extract job ID from URL like job-detail.js
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
      console.error('[APPLY JOB] Missing Job ID from URL');
      return;
    }

    // Optionally inject job ID into button for reference
    applyButton.setAttribute('data-job-id', jobId);
    console.log('[APPLY JOB] Job ID found in URL:', jobId);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const pondFiles = pond.getFiles();
      console.log('[APPLY JOB] Files in FilePond:', pondFiles);

      if (pondFiles.length === 0 || !pondFiles[0].file) {
        alert('Please upload a resume.');
        return;
      }

      const resumeFile = pondFiles[0].file;

      const email = document.getElementById('email-2')?.value || '';
      const name = document.getElementById('name-2')?.value || '';
      const phone = document.getElementById('phone-2')?.value || '';
      const linkedin = document.getElementById('linkedin-2')?.value || '';

      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('linkedin', linkedin);
      formData.append('resume', resumeFile, resumeFile.name);

      console.log('[APPLY JOB] Submitting form with data:', {
        email,
        name,
        phone,
        linkedin,
        resumeName: resumeFile.name,
        jobId,
      });

      applyButton.innerHTML = 'Please Wait...';
      applyButton.disabled = true;

      try {
        const response = await fetch('/api/apply-job', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            JobId: jobId,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('[APPLY JOB] Application failed:', result);
          throw new Error(result?.error || 'Unknown error');
        }

        console.log('[APPLY JOB] Application successful:', result);

        Toastify({
          text: 'Your application was successfully sent!',
          duration: 2000,
          gravity: 'top',
          position: 'center',
          style: { background: '#527853', color: '#FFFFFF' },
        }).showToast();

        pond.removeFile();
        form.reset();
      } catch (error) {
        console.error('[APPLY JOB] Submission error:', error.message);

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
