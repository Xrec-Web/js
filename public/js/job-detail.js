(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}';

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) {
      console.log('[DEBUG] Job ID from path:', pathMatch[1]);
      return pathMatch[1];
    }
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || urlParams.get('jobId');
    console.log('[DEBUG] Job ID from query param:', id);
    return id;
  }

  async function fetchJobDetail(jobId) {
    const url = `${API_BASE_URL}/job-detail?id=${jobId}`;
    console.log('[DEBUG] Fetching job from:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      console.log('[DEBUG] Job data:', data);
      return data.job || null;
    } catch (err) {
      console.error('[ERROR] Failed to fetch job:', err);
      renderError('Unable to load job details.');
      return null;
    }
  }

  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) {
      console.warn(`[WARN] Element not found: [data-element="${selector}"]`);
      return;
    }
    if (!value) {
      console.warn(`[WARN] No value provided for ${selector}`);
      return;
    }
    console.log(`[DEBUG] Setting text [${selector}]:`, value);
    el.innerText = value;
  }

  function setHTML(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) {
      console.warn(`[WARN] Element not found: [data-element="${selector}"]`);
      return;
    }
    if (!value) {
      console.warn(`[WARN] No value provided for ${selector}`);
      return;
    }
    console.log(`[DEBUG] Setting HTML [${selector}]:`, value.slice(0, 60) + '...');
    el.innerHTML = value;
  }

  function renderJobDetail(job) {
    console.log('[DEBUG] Rendering job details...');
    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description available.');

    const applyLink = document.querySelector('[data-element="apply-link"]');
    if (applyLink) {
      applyLink.setAttribute('href', APPLY_URL_PATTERN.replace('{{jobId}}', job.id));
      console.log('[DEBUG] Apply link set:', applyLink.getAttribute('href'));
    } else {
      console.warn('[WARN] Apply link not found');
    }

    const shareBtn = document.querySelector('[data-element="share-button"]');
    if (shareBtn && navigator.share) {
      shareBtn.addEventListener('click', () => {
        navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title}`,
          url: window.location.href,
        }).catch(console.error);
      });
      console.log('[DEBUG] Share button initialized');
    } else if (shareBtn) {
      shareBtn.style.display = 'none';
      console.log('[DEBUG] Share button hidden (no navigator.share)');
    }

    document.title = `${job.title} – Job Details`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && job.description_text) {
      metaDesc.setAttribute('content', job.description_text.slice(0, 160));
      console.log('[DEBUG] Meta description set');
    }
  }

  function renderJobNotFound() {
    const el = document.querySelector('[data-element="job-detail-container"]');
    if (el) {
      el.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <h2>Job Not Found</h2>
          <p>The job you're looking for doesn't exist or has been removed.</p>
          <a href="/jobs" class="apply-button">View All Jobs</a>
        </div>
      `;
      console.log('[DEBUG] Rendered "Job Not Found" message');
    }
  }

  function renderError(msg) {
    const el = document.querySelector('[data-element="job-detail-container"]');
    if (el) {
      el.innerHTML = `<div style="text-align:center; padding:40px;"><p>${msg}</p></div>`;
      console.error('[ERROR] Rendered error:', msg);
    }
  }

  async function initialize() {
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      renderError('No job ID found in URL.');
      return;
    }

    const job = await fetchJobDetail(jobId);
    if (job) {
      renderJobDetail(job);
    } else {
      renderJobNotFound();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
