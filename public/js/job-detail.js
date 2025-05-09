(function() {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}';

  // Gets job ID from the URL (supports /jobs/:id or ?id=:id)
  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId');
  }

  // Fetch job detail from proxy API
  async function fetchJobDetail(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/job-detail?id=${jobId}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      return data.job || null;
    } catch (err) {
      console.error('Error fetching job:', err);
      renderError('Unable to load job details.');
      return null;
    }
  }

  // Utility: Set text content
  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (el && value) el.innerText = value;
  }

  // Utility: Set HTML content
  function setHTML(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (el && value) el.innerHTML = value;
  }

  // Render job into existing elements
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

    // Optionally set meta tags
    document.title = `${job.title} – Job Details`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && job.description_text) {
      metaDesc.setAttribute('content', job.description_text.slice(0, 160));
    }
  }

  // Fallback message if job not found
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

  // Error fallback
  function renderError(msg) {
    const el = document.querySelector('[data-element="job-detail-container"]');
    if (el) {
      el.innerHTML = `<div style="text-align:center; padding:40px;"><p>${msg}</p></div>`;
    }
  }

  // Initialize on page load
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

  // Run once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
