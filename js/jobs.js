/**
 * Loxo Jobs Integration Script for Webflow
 * This script fetches job listings from the Loxo API and displays them on a Webflow page.
 * 
 * How to use:
 * 1. Host this script on Vercel
 * 2. Add a <script> tag to your Webflow page's custom code section pointing to this script
 * 3. Add a <div id="jobs-container"></div> to your Webflow page where jobs will be displayed
 */

(function() {
  // Configuration
  // We'll use the Vercel proxy API instead of direct Loxo API access
  const API_URL = 'https://js-flame-sigma.vercel.app/api/jobs';
  
  // DOM element where jobs will be rendered
  const JOBS_CONTAINER_ID = 'jobs-container';
  
  // Optional configuration - Customize as needed
  const JOBS_PER_PAGE = 10; // Number of jobs to display per page
  const ENABLE_SEARCH = true; // Whether to show search functionality
  const ENABLE_FILTERING = true; // Whether to show filtering options
  const DEFAULT_SORT = 'date'; // Default sort method ('date', 'title', etc.)
  
  // API endpoints
  // const API_URL = `https://app.loxo.co/api/${AGENCY_SLUG}/jobs`;
  
  /**
   * Fetches jobs from the Loxo API
   * @returns {Promise<Array>} Jobs data
   */
  async function fetchJobs() {
  try {
    // No need for Authorization header anymore - the proxy handles that
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
  
  /**
   * Renders jobs to the specified container
   * @param {Array} jobs - Array of job objects
   */
  function renderJobs(jobs) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${JOBS_CONTAINER_ID}" not found.`);
      return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create search and filter components if enabled
    if (ENABLE_SEARCH || ENABLE_FILTERING) {
      const filterBar = document.createElement('div');
      filterBar.className = 'jobs-filter-bar';
      
      if (ENABLE_SEARCH) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search jobs...';
        searchInput.className = 'jobs-search-input';
        searchInput.addEventListener('input', (e) => {
          const searchTerm = e.target.value.toLowerCase();
          const filteredJobs = jobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) || 
            (job.description && job.description.toLowerCase().includes(searchTerm))
          );
          renderJobsList(filteredJobs);
        });
        
        filterBar.appendChild(searchInput);
      }
      
      if (ENABLE_FILTERING) {
        // Get unique departments/categories
        const categories = [...new Set(jobs.map(job => job.department || 'Uncategorized'))];
        
        const filterSelect = document.createElement('select');
        filterSelect.className = 'jobs-filter-select';
        
        // Add default "All" option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Departments';
        filterSelect.appendChild(defaultOption);
        
        // Add options for each category
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          filterSelect.appendChild(option);
        });
        
        filterSelect.addEventListener('change', (e) => {
          const selectedCategory = e.target.value;
          const filteredJobs = selectedCategory 
            ? jobs.filter(job => job.department === selectedCategory)
            : jobs;
          renderJobsList(filteredJobs);
        });
        
        filterBar.appendChild(filterSelect);
      }
      
      container.appendChild(filterBar);
    }
    
    // Create jobs list container
    const jobsList = document.createElement('div');
    jobsList.className = 'jobs-list';
    jobsList.id = 'jobs-list';
    container.appendChild(jobsList);
    
    // Render initial jobs list
    renderJobsList(jobs);
    
    // Add pagination if needed
    if (jobs.length > JOBS_PER_PAGE) {
      renderPagination(jobs);
    }
  }
  
  /**
   * Renders the jobs list
   * @param {Array} jobs - Array of job objects
   * @param {Number} page - Current page number (1-based)
   */
  function renderJobsList(jobs, page = 1) {
    const jobsList = document.getElementById('jobs-list');
    jobsList.innerHTML = '';
    
    if (jobs.length === 0) {
      const noJobs = document.createElement('div');
      noJobs.className = 'no-jobs-message';
      noJobs.textContent = 'No jobs found matching your criteria.';
      jobsList.appendChild(noJobs);
      return;
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    const jobsToShow = jobs.slice(startIndex, endIndex);
    
    // Render each job
    jobsToShow.forEach(job => {
      const jobCard = document.createElement('div');
      jobCard.className = 'job-card';
      
      const jobTitle = document.createElement('h3');
      jobTitle.className = 'job-title';
      
      const jobLink = document.createElement('a');
      jobLink.href = `/jobs/${job.id}`; // Adjust URL pattern based on your Webflow setup
      jobLink.textContent = job.title;
      
      jobTitle.appendChild(jobLink);
      jobCard.appendChild(jobTitle);
      
      // Job location
      if (job.location) {
        const jobLocation = document.createElement('div');
        jobLocation.className = 'job-location';
        jobLocation.textContent = job.location;
        jobCard.appendChild(jobLocation);
      }
      
      // Job department/category
      if (job.department) {
        const jobDepartment = document.createElement('div');
        jobDepartment.className = 'job-department';
        jobDepartment.textContent = job.department;
        jobCard.appendChild(jobDepartment);
      }
      
      // Job summary/snippet
      if (job.summary) {
        const jobSummary = document.createElement('div');
        jobSummary.className = 'job-summary';
        jobSummary.textContent = job.summary.length > 150 
          ? job.summary.substring(0, 150) + '...' 
          : job.summary;
        jobCard.appendChild(jobSummary);
      }
      
      // Apply button
      const applyButton = document.createElement('a');
      applyButton.className = 'job-apply-button';
      applyButton.href = `/jobs/${job.id}#apply`; // Adjust URL pattern based on your Webflow setup
      applyButton.textContent = 'View Job & Apply';
      jobCard.appendChild(applyButton);
      
      jobsList.appendChild(jobCard);
    });
  }
  
  /**
   * Renders pagination controls
   * @param {Array} jobs - All jobs (for calculating total pages)
   */
  function renderPagination(jobs) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
    
    // Remove existing pagination if any
    const existingPagination = container.querySelector('.jobs-pagination');
    if (existingPagination) {
      existingPagination.remove();
    }
    
    if (totalPages <= 1) return;
    
    const pagination = document.createElement('div');
    pagination.className = 'jobs-pagination';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-prev';
    prevButton.textContent = '← Previous';
    prevButton.disabled = true; // Disabled on first page
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-next';
    nextButton.textContent = 'Next →';
    
    // Page indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'pagination-indicator';
    pageIndicator.textContent = `Page 1 of ${totalPages}`;
    
    // Add event listeners for pagination
    let currentPage = 1;
    
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderJobsList(jobs, currentPage);
        updatePaginationState();
      }
    });
    
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderJobsList(jobs, currentPage);
        updatePaginationState();
      }
    });
    
    function updatePaginationState() {
      prevButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage === totalPages;
      pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    pagination.appendChild(prevButton);
    pagination.appendChild(pageIndicator);
    pagination.appendChild(nextButton);
    container.appendChild(pagination);
  }
  
  /**
   * Renders an error message
   * @param {string} message - Error message to display
   */
  function renderError(message) {
    const container = document.getElementById(JOBS_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${JOBS_CONTAINER_ID}" not found.`);
      return;
    }
    
    container.innerHTML = `
      <div class="jobs-error">
        <p>${message}</p>
        <button id="retry-button">Try Again</button>
      </div>
    `;
    
    document.getElementById('retry-button').addEventListener('click', initialize);
  }
  
  /**
   * Initializes the jobs listing
   */
  async function initialize() {
    // Inject CSS styles
    const styles = document.createElement('style');
    styles.textContent = `
      #${JOBS_CONTAINER_ID} {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      .jobs-filter-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .jobs-search-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .jobs-filter-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .jobs-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .job-card {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #fff;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .job-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .job-title {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 18px;
      }
      
      .job-title a {
        color: #333;
        text-decoration: none;
      }
      
      .job-title a:hover {
        color: #0066cc;
      }
      
      .job-location, .job-department {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
      
      .job-department {
        display: inline-block;
        background-color: #f0f0f0;
        padding: 3px 8px;
        border-radius: 20px;
        font-size: 12px;
      }
      
      .job-summary {
        margin: 12px 0;
        font-size: 14px;
        line-height: 1.5;
        color: #444;
      }
      
      .job-apply-button {
        display: inline-block;
        padding: 8px 16px;
        background-color: #0066cc;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        transition: background-color 0.2s ease;
      }
      
      .job-apply-button:hover {
        background-color: #0052a3;
      }
      
      .jobs-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 30px;
        gap: 15px;
      }
      
      .pagination-prev, .pagination-next {
        padding: 8px 16px;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .pagination-prev:disabled, .pagination-next:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .jobs-error {
        text-align: center;
        padding: 40px 20px;
      }
      
      .no-jobs-message {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
    `;
    
    document.head.appendChild(styles);
    
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
