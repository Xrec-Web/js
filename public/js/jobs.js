(function () {
  const JOBS_CONTAINER_ID = 'jobs-container';
  const API_URL = 'https://js-flame-sigma.vercel.app/api/jobs';

  async function fetchJobs() {
    console.log('[Jobs Script] Fetching jobs from:', API_URL);

    try {
      const response = await fetch(API_URL);
      console.log('[Jobs Script] API response status:', response.status);

      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      
      const data = await response.json();
      console.log('[Jobs Script] Jobs fetched:', data.results?.length || 0);
      
      return data.results || [];
    } catch (error) {
      console.error('[Jobs Script] Error fetching jobs:', error);
      renderError('Unable to load job listings. Please try again later.');
      return [];
    }
  }

  function renderJobs(jobs) {
    console.log('[Jobs Script] Rendering jobs...');

    jobs.forEach((job, index) => {
      const titleEl = document.querySelector(`[data-index="${index}"] [data-element="ur-link"]`);
      const locationEl = document.querySelector(`[data-index="${index}"] [data-element="ur-location"]`);
      const companyEl = document.querySelector(`[data-index="${index}"] [data-element="ur-company"]`);
      const dateEl = document.querySelector(`[data-index="${index}"] [data-element="ur-date"]`);

      if (!titleEl) {
        console.warn(`[Jobs Script] No title element found for index ${index}`);
      }

      if (titleEl) {
        titleEl.textContent = job.title || 'Untitled Job';
        titleEl.setAttribute('href', `/job-detail?id=${job.id}`);
        titleEl.setAttribute('data-job-id', job.id);
      }

      if (locationEl) {
        locationEl.textContent = job.macro_address || 'Location not specified';
      }

      if (companyEl) {
        companyEl.textContent = job.company?.name || 'Company not specified';
      }

      if (dateEl) {
        const publishDate = new Date(job.published_at || job.created_at);
        dateEl.textContent = publishDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    });

    const allGroups = document.querySelectorAll('[data-index]');
    for (let i = jobs.length; i < allGroups.length; i++) {
      console.log(`[Jobs Script] Hiding extra job element at index ${i}`);
      allGroups[i].style.display = 'none';
    }

    console.log('[Jobs Script] Job rendering complete.');
  }

  function renderError(message) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    if (container) {
      container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">${message}</div>`;
    }
  }

  async function initialize() {
    console.log('[Jobs Script] Initializing...');
    const container = document.getElementById(JOBS_CONTAINER_ID);

    if (container) {
      container.innerHTML = `<p style="text-align:center;">Loading job listings...</p>`;
    } else {
      console.warn(`[Jobs Script] Container with ID "${JOBS_CONTAINER_ID}" not found`);
    }

    const jobs = await fetchJobs();
    if (jobs.length > 0) {
      renderJobs(jobs);
    } else {
      console.warn('[Jobs Script] No jobs to display.');
    }
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
