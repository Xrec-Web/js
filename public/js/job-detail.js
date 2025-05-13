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
