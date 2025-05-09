/**
 * Loxo Jobs Integration Script for Webflow
 * This script fetches job listings from the Loxo API and displays them on a Webflow page.
 */

(function() {
  // Configuration
  const JOBS_CONTAINER_ID = 'jobs-container';
  const JOBS_PER_PAGE = 10;
  const ENABLE_SEARCH = true;
  const ENABLE_FILTERING = true;
  const DEFAULT_SORT = 'date';
  const API_URL = 'https://js-flame-sigma.vercel.app/api/jobs'; // Your Vercel proxy API

  /**
   * Fetches jobs from our proxy API
   * @returns {Promise<Array>} Jobs data
   */
  async function fetchJobs() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      renderError('Unable to load job listings. Please try again later.');
      return [];
    }
  }

  /**
   * Renders jobs to the container
   * @param {Array} jobs - Array of job objects from Loxo API
   */
  function renderJobs(jobs) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    container.innerHTML = '';

    const jobsListContainer = document.createElement('div');
    jobsListContainer.className = 'jobs-list';

    jobs.forEach(job => {
      const jobElement = document.createElement('div');
      jobElement.className = 'job-item';

      const publishDate = new Date(job.published_at || job.created_at);
      const dateString = publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      jobElement.innerHTML = `
        <div class="job-title">
          <h3><a href="/job-detail?id=${job.id}">${job.title}</a></h3>
        </div>
        <div class="job-details">
          <div class="job-location">${job.macro_address || 'Location not specified'}</div>
          <div class="job-company">${job.company?.name || 'Company not specified'}</div>
          <div class="job-date">Posted: ${dateString}</div>
        </div>
        <div class="job-apply">
          <a href="/job-application?id=${job.id}" class="job-apply-button">Apply Now</a>
        </div>
      `;

      jobsListContainer.appendChild(jobElement);
    });

    container.appendChild(jobsListContainer);
  }

  /**
   * Renders an error message
   * @param {string} message - Error message to display
   */
  function renderError(message) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    container.innerHTML = `
      <div class="error-message" style="color: red; padding: 20px; text-align: center;">
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Initializes the jobs listing
   */
  async function initialize() {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    if (!container) {
      console.error(`Container with ID "${JOBS_CONTAINER_ID}" not found.`);
      return;
    }

    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p>Loading job listings...</p>
      </div>
    `;

    const jobs = await fetchJobs();
    if (jobs.length > 0) {
      renderJobs(jobs);
    }
  }

  // Run the script when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initialize);
})();
