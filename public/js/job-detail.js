(function() {
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

  function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function check() {
        const el = document.querySelector(`[data-element="${selector}"]`);
        if (el) {
          resolve(el);
        } else if (Date.now() - start > timeout) {
          console.warn(`[DEBUG] Timeout waiting for [data-element="${selector}"]`);
          resolve(null);
        } else {
          requestAnimationFrame(check);
        }
      })();
    });
  }

  async function setText(selector, value) {
    const el = await waitForElement(selector);
    if (el && value) {
      el.innerText = value;
      console.debug(`[DEBUG] Set text for [${selector}]: ${value}`);
    }
  }

  async function setHTML(selector, value) {
    const el = await waitForElement(selector);
    if (el && value) {
      el.innerHTML = value;
      console.debug(`[DEBUG] Set HTML for [${selector}]`);
    }
  }

  async function renderJobDetail(job) {
    await Promise.all([
      setText('job-title', job.title),
      setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : ''),
      setText('job-category', job.category?.name),
      setText('job-type', job.job_type?.name),
      setText('job-salary', job.salary),
      setHTML('job-description', job.description || 'No description available.')
    ]);

    const applyLink = await waitForElement('apply-link');
    if (applyLink) {
      applyLink.setAttribute('href', APPLY_URL_PATTERN.replace('{{jobId}}', job.id));
    }

    const shareBtn = await waitForElement('share-button');
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
    }
  }

  function renderError(msg) {
    const el = document.querySelector('[data-element="job-detail-container"]');
    if (el) {
      el.innerHTML = `<div style="text-align:center; padding:40px;"><p>${msg}</p></div>`;
    }
  }

  async function initialize() {
    const jobId = getJobIdFromUrl();
    console.debug('[DEBUG] Job ID from URL:', jobId);
    if (!jobId) {
      renderError('No job ID found in URL.');
      return;
    }

    const job = await fetchJobDetail(jobId);
    if (job) {
      await renderJobDetail(job);
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
