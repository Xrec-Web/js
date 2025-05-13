(function () {
  console.log('[APPLY JOB] DOM ready, starting script');

  const API_URL = 'https://js-flame-sigma.vercel.app/api/apply-job';
  let jobId = null;

  // 🔍 Get job ID from URL query string
  function getJobIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  // 🧪 Utility: inject file input if not already present
  function ensureFileInputExists() {
    if (!document.querySelector('input[name="resume"]')) {
      const input = document.createElement('input');
      input.type = 'file';
      input.name = 'resume';
      input.accept = '.pdf,.doc,.docx';
      input.required = true;
      input.classList.add('hidden');
      document.body.appendChild(input);
      console.log('[APPLY JOB] File input created');
    }
  }

  // 📤 Init FilePond
  function initializeFilePond() {
    const input = document.querySelector('input[name="resume"]');
    if (!input) return console.error('[APPLY JOB] No resume input found for FilePond');

    FilePond.registerPlugin(FilePondPluginFileValidateType);
    FilePond.create(input, {
      acceptedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      labelIdle: 'Drag & drop your resume or <span class="filepond--label-action">browse</span>',
    });

    console.log('[APPLY JOB] FilePond initialized');
  }

  // 🚀 Form submission handler
  function setupFormHandler() {
    const form = document.querySelector('[data-element="job-apply-form"]');
    if (!form) return console.warn('[APPLY JOB] No form found to initialize');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';

      const formData = new FormData(form);
      const file = formData.get('resume');

      if (!file || !(file instanceof File)) {
        alert('Please upload a valid resume file.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Apply Now';
        return;
      }

      try {
        const response = await fetch(`${API_URL}?id=${jobId}`, {
          method: 'POST',
          headers: {
            'jobid': jobId,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('[APPLY JOB ERROR]', data);
          alert(data.error || 'Application failed. Please try again.');
        } else {
          alert('Application submitted successfully!');
          form.reset();
          FilePond.find(document.querySelector('input[name="resume"]'))?.removeFiles();
        }
      } catch (err) {
        console.error('[APPLY JOB ERROR]', err);
        alert('Something went wrong while submitting your application.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Apply Now';
      }
    });
  }

  // 🎬 Entry point
  function init() {
    jobId = getJobIdFromUrl();
    if (!jobId) {
      console.warn('[APPLY JOB] No job ID found in URL');
      return;
    }

    console.log('[APPLY JOB] DOM is fully loaded.');
    ensureFileInputExists();
    initializeFilePond();
    setupFormHandler();
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
