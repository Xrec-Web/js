(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}';

  // Define expected elements, marking required vs optional
  const EXPECTED_ELEMENTS = {
    'job-title': true,
    'job-location': false,
    'job-category': false,
    'job-type': false,
    'job-salary': false,
    'job-description': false,
    'apply-link': false,
    'share-button': false,
    'job-detail-container': false,
  };

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId');
  }

  async function fetchJobDetail(jobId) {
    try {
      console.debug('[DEBUG] Fetching job from:', `${API_BASE_URL}/job-detail?id=${jobId}`);
      const response = await fetch(`${API_BASE_URL}/job-detail?id=${jobId}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      console.debug('[DEBUG] Job data:', data.job);
      return data.job || null;
    } catch (err) {
      console.error('Error fetching job:', err);
      renderError('Unable to load job details.');
      return null;
    }
  }

  function validateExpectedElements() {
    Object.entries(EXPECTED_ELEMENTS).forEach(([attr, isRequired]) => {
      const el = document.querySelector(`[data-element="${attr}"]`);
      if (!el) {
        const level = isRequired ? 'error' : 'warn';
        console[level === 'error' ? 'error' : 'warn'](
          `[${level.toUpperCase()}] Missing ${isRequired ? 'required' : 'optional'} element: data-element="${attr}"`
        );
      } else {
        console.debug(`[DEBUG] Found element: data-element="${attr}"`);
      }
    });
  }

  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (el && value != null) {
      el.innerText = value;
      console.debug(`[DEBUG] Set text for [${selector}]: ${value}`);
    }
  }

  function setHTML(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (el && value != null) {
      el.innerHTML = value;
      console.debug(`[DEBUG] Set HTML for [${selector}]`);
    }
  }

  function renderJobDetail(job) {
    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description available.');

    const applyLink = document.querySelector('[data-element="apply-link"]');
    if (applyLink) {
      applyLink.setAttribute('href', APPLY_URL_PATTERN.replace('{{jobId}}', job.id));
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
    const el = document.querySelector('[data-element="job-detail-container"]');
    if (el) {
      el.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <h2>Job Not Found</h2>
          <p>The job you're looking for doesn't exist or has been removed.</p>
          <a href="/jobs" class="apply-button">View All Jobs</a>
        </div>
      `;
    } else {
      console.warn('[WARNING] Could not show job-not-found message. Container missing (data-element="job-detail-container")');
    }
  }

  function renderError(msg) {
    const el = document.querySelector('[data-element="job-detail-container"]');
    if (el) {
      el.innerHTML = `<div style="text-align:center; padding:40px;"><p>${msg}</p></div>`;
    } else {
      console.warn('[WARNING] Could not show error message. Container missing (data-element="job-detail-container")');
    }
  }

  async function initialize() {
    validateExpectedElements();

    const jobId = getJobIdFromUrl();
    console.debug('[DEBUG] Job ID from URL:', jobId);
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
