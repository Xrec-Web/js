/**
 * Loxo Jobs Integration Script for Webflow
 * This script fetches job listings from the Loxo API and displays them on a Webflow page.
 */

(function() {
  // Configuration
  // No longer need agency slug or bearer token in client-side code!
  
  // DOM element where jobs will be rendered
  const JOBS_CONTAINER_ID = 'jobs-container';
  
  // Optional configuration - Customize as needed
  const JOBS_PER_PAGE = 10;
  const ENABLE_SEARCH = true;
  const ENABLE_FILTERING = true;
  const DEFAULT_SORT = 'date';
  
  // API endpoint (this is the key change - pointing to your Vercel proxy)
  const API_URL = 'https://js-flame-sigma.vercel.app/api';
  
  /**
   * Fetches jobs from our proxy API
   * @returns {Promise<Array>} Jobs data
   */
  async function fetchJobs() {
    try {
      // No need for authorization headers - proxy handles that!
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      renderError('Unable to load job listings. Please try again later.');
      return [];
    }
  }
  
  // The rest of your existing code can stay the same...
  // This includes all your rendering functions like renderJobs(), renderJobsList(), etc.
  
  /**
   * Initializes the jobs listing
   */
  async function initialize() {
    // Check if container exists
    const container = document.getElementById(JOBS_CONTAINER_ID);
    if (!container) {
      console.error(`Container with ID "${JOBS_CONTAINER_ID}" not found.`);
      return;
    }
    
    // Show loading indicator
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p>Loading job listings...</p>
      </div>
    `;
    
    // Fetch and render jobs
    const jobs = await fetchJobs();
    if (jobs.length > 0) {
      renderJobs(jobs);
    }
  }
  
  // Run the script when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initialize);
})();
