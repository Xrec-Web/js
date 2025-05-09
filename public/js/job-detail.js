(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const APPLY_ENDPOINT = `${API_BASE_URL}/apply-job`;

  // --- Utility: Get job ID from URL ---
  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch?.[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  // --- Utility: Fetch job details ---
  async function fetchJobDetail(jobId) {
    const url = `${API_BASE_URL}/job-detail?id=${jobId}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('[ERROR] Failed to fetch job:', err);
      return null;
    }
  }

  // --- Utility: Set DOM content safely ---
  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element: ${selector}`);
    el.textContent = value || '';
  }

  function setHTML(selector, html) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element: ${selector}`);
    el.innerHTML = html || '';
  }

  // --- Render job data into DOM ---
  function renderJobDetail(job) {
    console.log('[INFO] Rendering job:', job.title);
    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description provided.');

    const applyBtn = document.querySelector('[data-element="apply-link"]');
    if (applyBtn) applyBtn.setAttribute('href', `?id=${job.id}#apply`);

    const shareBtn = document.querySelector('[data-element="share-button"]');
    if (shareBtn) {
      if (navigator.share) {
        shareBtn.addEventListener('click', () => {
          navigator.share({
            title: job.title,
            text: `Check out this job: ${job.title}`,
            url: window.location.href,
          }).catch(console.error);
        });
      } else {
        shareBtn.style.display = 'none';
      }
    }

    document.title = `${job.title} – Job Details`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && job.description_text) {
      metaDesc.setAttribute('content', job.description_text.slice(0, 160));
    }
  }

  // --- Show fallback message ---
  function renderJobNotFound() {
    const container = document.querySelector('[data-element="job-detail-container"]');
    if (!container) return console.error('[ERROR] No container found to render fallback.');
    container.innerHTML = `
      <div style="text-align:center; padding:40px;">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <a href="/jobs" class="apply-button">View All Jobs</a>
      </div>
    `;
  }

  // --- FilePond and form setup ---
  function setupFileUploadAndForm(jobId) {
    const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
    const pond = FilePond.create(inputElement, {
      credits: false,
      name: 'fileToUpload',
      storeAsFile: true,
    });

    Webflow.push(function () {
      $('#wf-form-Form-Apply-Job').submit(async function (e) {
        e.preventDefault();
        e.stopPropagation();

        const file = pond.getFile();
        if (!file) return alert('Please upload a resume.');

        const form = new FormData();
        form.append('email', document.getElementById('Email').value);
        form.append('name', document.getElementById('Name').value);
        form.append('phone', document.getElementById('Phone').value);
        form.append('linkedin', document.getElementById('LinkedIn').value);
        form.append('resume', file.file, file.file.name);

        $('.submit-button-apply-job')
          .val('Please Wait...')
          .css('cursor', 'not-allowed')
          .attr('disabled', true);

        try {
          const response = await fetch(APPLY_ENDPOINT, {
            method: 'POST',
            headers: {
              accept: 'application/json',
              JobId: jobId,
            },
            body: form,
          });

          const result = await response.json();

          if (result.success === true) {
            $('.fs_modal-1_close-2').trigger('click');
            Toastify({
              text: 'Your application was successfully sent!',
              duration: 2000,
              gravity: 'top',
              position: 'center',
              style: { background: '#527853', color: '#FFFFFF' },
            }).showToast();
            pond.removeFile();
            $('#wf-form-Form-Apply-Job').trigger('reset');
          } else {
            console.error('[ERROR] API returned failure:', result);
            alert('Failed to submit the form. Please try again.');
          }
        } catch (err) {
          console.error('[ERROR] Form submission error:', err);
          alert('An error occurred. Please try again.');
        } finally {
          $('.submit-button-apply-job')
            .val('Submit')
            .css('cursor', 'pointer')
            .attr('disabled', false);
        }
      });
    });
  }

  // --- Patch for multi-form file upload compatibility ---
  function setupMultiFormUploadFallback() {
    document.querySelectorAll('form[ms-code-file-upload="form"]').forEach((form) => {
      form.setAttribute('enctype', 'multipart/form-data');
      form.querySelectorAll('[ms-code-file-upload-input]').forEach((uploadInput) => {
        const inputName = uploadInput.getAttribute('ms-code-file-upload-input');
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('name', inputName);
        fileInput.setAttribute('id', inputName);
        fileInput.required = true;
        uploadInput.appendChild(fileInput);
      });
    });
  }

  // --- Main Initialization ---
  async function initialize() {
    console.log('[LOXO JOB DETAIL] Initializing...');
    const jobId = getJobIdFromUrl();
    if (!jobId) return renderJobNotFound();

    const job = await fetchJobDetail(jobId);
    if (job?.title) {
      renderJobDetail(job);
      setupFileUploadAndForm(job.id);
    } else {
      renderJobNotFound();
    }
  }

  // --- Entry Point ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  setupMultiFormUploadFallback();
})();
