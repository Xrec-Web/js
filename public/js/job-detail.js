/**
 * Loxo Job Detail Integration Script for Webflow
 * Hosted version with DOM readiness + data-element support
 */
(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}';

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId');
  }

  async function fetchJobDetail(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/job-detail?id=${jobId}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      return data.job || null;
    } catch (error) {
      console.error('[ERROR] Fetching job failed:', error);
      return null;
    }
  }

  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) {
      console.warn(`[WARN] Element not found: data-element="${selector}"`);
      return;
    }
    el.innerText = value || '';
  }

  function setHTML(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) {
      console.warn(`[WARN] Element not found: data-element="${selector}"`);
      return;
    }
    el.innerHTML = value || '';
  }

  function renderJobDetail(job) {
    console.log('[INFO] Rendering job detail');

    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description available.');

    const applyLink = document.querySelector('[data-element="apply-link"]');
    if (applyLink) {
      applyLink.setAttribute('href', APPLY_URL_PATTERN.replace('{{jobId}}', job.id));
    } else {
      console.warn('[WARN] Element not found: data-element="apply-link"');
    }

    const shareBtn = document.querySelector('[data-element="share-button"]');
    if (shareBtn && navigator.share) {
      shareBtn.addEventListener('click', () => {
        navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title}`,
          url: window.location.href,
        }).catch(err => console.error('[ERROR] Share failed:', err));
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
    if (!container) {
      console.error('[ERROR] Missing container: data-element="job-detail-container"');
      return;
    }
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
      console.error('[ERROR] No job ID found in URL');
      return renderJobNotFound();
    }

    console.log('[INFO] Found job ID:', jobId);
    const job = await fetchJobDetail(jobId);

    if (job) {
      console.log('[INFO] Job data received:', job);
      renderJobDetail(job);
    } else {
      console.warn('[WARN] No job found');
      renderJobNotFound();
    }
  }

  function waitForWebflowAndInitialize() {
    const maxWaitTime = 5000;
    const intervalTime = 100;
    let waited = 0;

    const interval = setInterval(() => {
      const bodyReady = document.querySelector('body[data-wf-page]');
      if (bodyReady || waited >= maxWaitTime) {
        clearInterval(interval);
        console.log('[LOXO JOB DETAIL] DOM ready, starting script');
        initialize();
      }
      waited += intervalTime;
    }, intervalTime);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForWebflowAndInitialize);
  } else {
    waitForWebflowAndInitialize();
  }
})();
