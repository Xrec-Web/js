(function () {
  // Configuration
  const JOBS_CONTAINER_ID = 'jobs-container'; // Optional, can be used to show loading/errors
  const API_URL = 'https://js-flame-sigma.vercel.app/api/jobs';

  /**
   * Fetches jobs from the API
   * @returns {Promise<Array>} Jobs array
   */
  async function fetchJobs() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      renderError('Unable to load job listings. Please try again later.');
      return [];
    }
  }

  /**
   * Renders jobs into DOM elements with matching data-element attributes
   * @param {Array} jobs
   */
  function renderJobs(jobs) {
    // Select all grouped elements for each job (e.g., data-index="0", "1", etc.)
    jobs.forEach((job, index) => {
      // Select elements by data-index for scoped replacement
      const titleEl = document.querySelector(`[data-index="${index}"] [data-element="ur-link"]`);
      const locationEl = document.querySelector(`[data-index="${index}"] [data-element="ur-location"]`);
      const companyEl = document.querySelector(`[data-index="${index}"] [data-element="ur-company"]`);
      const dateEl = document.querySelector(`[data-index="${index}"] [data-element="ur-date"]`);

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

    // Hide extra elements (if any exist beyond the number of jobs)
    const allGroups = document.querySelectorAll('[data-index]');
    for (let i = jobs.length; i < allGroups.length; i++) {
      allGroups[i].style.display = 'none';
    }
  }

  /**
   * Renders an error message
   * @param {string} message
   */
  function renderError(message) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    if (container) {
      container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">${message}</div>`;
    }
  }

  /**
   * Initializes the script
   */
  async function initialize() {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    if (container) {
      container.innerHTML = `<p style="text-align:center;">Loading job listings...</p>`;
    }

    const jobs = await fetchJobs();
    if (jobs.length > 0) {
      renderJobs(jobs);
    }
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
