document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('wf-form-Form-Apply-Job');
  if (!form) {
    console.error('[apply-job.js] Form with ID #wf-form-Form-Apply-Job not found.');
    return;
  }

  const jobId = new URLSearchParams(window.location.search).get('jobId');
  if (!jobId) {
    console.error('[apply-job.js] No jobId found in URL.');
    return;
  }

  const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = form.querySelector('#Name')?.value?.trim();
    const email = form.querySelector('#Email')?.value?.trim();
    const phone = form.querySelector('#Phone')?.value?.trim();
    const linkedin = form.querySelector('#LinkedIn')?.value?.trim();

    if (!name || !email || !phone || !linkedin) {
      alert('Please fill in all fields.');
      return;
    }

    // Get resume file from FilePond instance
    const pondEl = form.querySelector('input[type="file"][name="fileToUpload"]');
    const pondInstance = pondEl && FilePond.find(pondEl);

    if (!pondInstance || pondInstance.getFiles().length === 0) {
      alert('Please upload a resume.');
      return;
    }

    const file = pondInstance.getFile().file;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('linkedin', linkedin);
    formData.append('resume', file, file.name);

    if (submitBtn) {
      submitBtn.value = 'Submitting...';
      submitBtn.disabled = true;
      submitBtn.style.cursor = 'not-allowed';
    }

    try {
      const res = await fetch(`https://js-flame-sigma.vercel.app/api/apply-job?id=${jobId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success === true) {
        Toastify({
          text: 'Your application was successfully sent!',
          duration: 2000,
          gravity: 'top',
          position: 'center',
          style: { background: '#527853', color: '#FFFFFF' },
        }).showToast();

        form.reset();
        pondInstance.removeFile();
      } else {
        console.error('[apply-job.js] API returned error:', data);
        alert('Failed to submit your application. Please try again.');
      }
    } catch (err) {
      console.error('[apply-job.js] Submission error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      if (submitBtn) {
        submitBtn.value = 'Submit';
        submitBtn.disabled = false;
        submitBtn.style.cursor = 'pointer';
      }
    }
  });
});
