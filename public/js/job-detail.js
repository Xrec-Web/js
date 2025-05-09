<script>
(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const SHOW_APPLY_BUTTON = true;
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}';

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  async function fetchJobDetail(jobId) {
    try {
      const res = await fetch(`${API_BASE_URL}/job-detail?id=${jobId}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      return data || null;
    } catch (err) {
      console.error('[LOXO JOB DETAIL] Fetch error:', err);
      return null;
    }
  }

  function renderJobDetail(job) {
    const elements = {
      'job-title': job.title,
      'job-location': job.city ? `${job.city}, ${job.state_code || ''}` : '',
      'job-category': job.category?.name,
      'job-type': job.job_type?.name,
      'job-salary': job.salary,
      'job-description': job.description || 'No description available.',
    };

    for (const [attr, value] of Object.entries(elements)) {
      const el = document.querySelector(`[data-element="${attr}"]`);
      if (!el) {
        console.warn(`[LOXO JOB DETAIL] Missing element: data-element="${attr}"`);
        continue;
      }
      if (attr === 'job-description') {
        el.innerHTML = value; // HTML content
      } else {
        el.innerText = value;
      }
    }

    const applyLink = document.querySelector('[data-element="apply-link"]');
    if (applyLink) {
      applyLink.href = APPLY_URL_PATTERN.replace('{{jobId}}', job.id);
    } else {
      console.warn('[LOXO JOB DETAIL] Missing apply link element');
    }

    const shareButton = document.querySelector('[data-element="share-button"]');
    if (shareButton && navigator.share) {
      shareButton.addEventListener('click', () => {
        navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title}`,
          url: window.location.href,
        }).catch(err => console.error('[LOXO JOB DETAIL] Share failed:', err));
      });
    } else if (shareButton) {
      shareButton.style.display = 'none';
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
      console.error('[LOXO JOB DETAIL] Missing job detail container');
      return;
    }

    container.innerHTML = `
      <div class="job-not-found" style="text-align: center; padding: 40px 20px;">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or is no longer active.</p>
        <a href="/jobs" class="back-to-jobs" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #0066cc; color: white; border-radius: 4px; text-decoration: none;">Back to Jobs</a>
      </div>
    `;
  }

  async function initialize() {
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      console.warn('[LOXO JOB DETAIL] No job ID in URL');
      renderJobNotFound();
      return;
    }

    const loadingContainer = document.querySelector('[data-element="job-detail-container"]');
    if (loadingContainer) {
      loadingContainer.innerHTML = `<p style="text-align:center; padding:40px;">Loading job details...</p>`;
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
</script>
