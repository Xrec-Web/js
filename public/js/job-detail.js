(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';

  console.log('[LOXO JOB DETAIL] DOM ready, starting script');

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  async function fetchJobDetail(jobId) {
    const url = `${API_BASE_URL}/job-detail?id=${jobId}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('[ERROR] Could not fetch job:', err);
      return null;
    }
  }

  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element with data-element="${selector}"]`);
    if (value) el.innerText = value;
  }

  function setHTML(selector, html) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element with data-element="${selector}"]`);
    el.innerHTML = html;
  }

  function renderJobDetail(job) {
    console.log('[LOXO JOB DETAIL] Rendering job:', job.title);
    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description provided.');

    const applyBtn = document.querySelector('[data-element="apply-link"]');
    if (applyBtn) applyBtn.setAttribute('href', `?id=${job.id}#apply`);

    const shareBtn = document.querySelector('[data-element="share-button"]');
    if (shareBtn && navigator.share) {
      shareBtn.addEventListener('click', () => {
        navigator
          .share({ title: job.title, text: `Check out this job: ${job.title}`, url: window.location.href })
          .catch(console.error);
      });
    } else if (shareBtn) {
      shareBtn.style.display = 'none';
    }

    document.title = `${job.title} – Job Details`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && job.description_text) {
      metaDesc.setAttribute('content', job.description_text.slice(0, 160));
    }

    // ✅ File input creation
    const fileInputSelector = 'input[type="file"][name="fileToUpload"]';
    let fileInput = document.querySelector(fileInputSelector);
    if (!fileInput) {
      console.log('[WEBFLOW PAGE] Creating file input element');
      const form = document.querySelector('#wf-form-Form-Apply-Job');
      if (form) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'fileToUpload';
        fileInput.accept = '.pdf,.doc,.docx';
        form.appendChild(fileInput);
      }
    }

    // ✅ Initialize FilePond
    if (fileInput && window.FilePond) {
      console.log('[WEBFLOW PAGE] Initializing FilePond...');
      FilePond.create(fileInput, {
        labelIdle: 'Drag & Drop your resume or <span class="filepond--label-action">Browse</span>',
        allowMultiple: false,
        required: true,
      });
    } else {
      console.warn('[WEBFLOW PAGE] FilePond not available or file input missing.');
    }

    // ✅ Hook up form submission
    const form = document.querySelector('#wf-form-Form-Apply-Job');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const successEl = document.querySelector('[data-element="apply-success"]');
        const errorEl = document.querySelector('[data-element="apply-error"]');

        if (submitBtn) submitBtn.disabled = true;
        if (successEl) successEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';

        const formData = new FormData(form);
        formData.append('jobId', job.id);

        const fileInput = form.querySelector('input[type="file"][name="fileToUpload"]');
        if (!fileInput || !fileInput.files.length) {
          alert('Please upload a resume.');
          if (submitBtn) submitBtn.disabled = false;
          return;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/apply-job?id=${job.id}`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error(`Status ${res.status}`);
          const result = await res.json();

          if (result.status === 'success') {
            if (successEl) successEl.style.display = 'block';
            form.reset();
            FilePond.find(fileInput)?.removeFiles();
          } else {
            throw new Error(result.message || 'Unexpected error');
          }
        } catch (err) {
          console.error('[APPLY JOB ERROR]', err);
          if (errorEl) {
            errorEl.textContent = 'Something went wrong. Please try again.';
            errorEl.style.display = 'block';
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  }

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

  async function initialize() {
    console.log('[LOXO JOB DETAIL] Initializing...');
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      console.warn('[WARN] No job ID found in URL');
      renderJobNotFound();
      return;
    }

    console.log('[INFO] Found job ID:', jobId);
    const job = await fetchJobDetail(jobId);

    if (job && job.title) {
      renderJobDetail(job);
    } else {
      console.warn('[WARN] No job found');
      renderJobNotFound();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
