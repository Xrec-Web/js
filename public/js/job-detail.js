/**
 * Loxo Job Detail Integration Script for Webflow
 * This script fetches and displays detailed information about a specific job from the Loxo API.
 * 
 * How to use:
 * 1. Host this script on Vercel
 * 2. Add a <script> tag to your Webflow job detail page's custom code section pointing to this script
 * 3. Add a <div id="job-detail-container"></div> to your Webflow page where job details will be displayed
 */
(function() {
// Configuration
// We'll use the Vercel proxy API instead of direct Loxo API access
const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';

  // DOM element where job details will be rendered
  const JOB_DETAIL_CONTAINER_ID = 'job-detail-container';
  
  // Optional configuration
  const SHOW_APPLY_BUTTON = true; // Whether to show the apply button
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}'; // URL pattern for the apply page
  
  /**
   * Gets the job ID from the URL
   * @returns {string|null} Job ID or null if not found
   */
  function getJobIdFromUrl() {
    // Check for job ID in URL path
    // Assuming URL format: /jobs/123 or /job/123
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    // Check for job ID in query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id') || urlParams.get('jobId');
    if (idParam) {
      return idParam;
    }
    
    return null;
  }
  
  /**
  Replaced the fetchJobDetail function with the below
   */
  async function fetchJobDetail(jobId) {
  try {
    // Use the new proxy API with the job ID as a query parameter
    const response = await fetch(`${API_BASE_URL}/job-detail?id=${jobId}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.job || null;
  } catch (error) {
    console.error('Error fetching job details:', error);
    renderError('Unable to load job details. Please try again later.');
    return null;
  }
}
  
  /**
   * Renders job details to the container
   * @param {Object} job - Job data object
   */
  function renderJobDetail(job) {
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${JOB_DETAIL_CONTAINER_ID}" not found.`);
      return;
    }
    
    // Build job detail HTML
    const html = `
      <div class="job-detail">
        <h1 class="job-title">${job.title}</h1>
        
        <div class="job-meta">
          ${job.location ? `<div class="job-location"><strong>Location:</strong> ${job.location}</div>` : ''}
          ${job.department ? `<div class="job-department"><strong>Department:</strong> ${job.department}</div>` : ''}
          ${job.employment_type ? `<div class="job-type"><strong>Job Type:</strong> ${job.employment_type}</div>` : ''}
          ${job.salary ? `<div class="job-salary"><strong>Salary:</strong> ${job.salary}</div>` : ''}
        </div>
        
        ${SHOW_APPLY_BUTTON ? `
          <div class="job-actions">
            <a href="${APPLY_URL_PATTERN.replace('{{jobId}}', job.id)}" class="apply-button">Apply Now</a>
            <button class="share-button" id="share-job-button">Share Job</button>
          </div>
        ` : ''}
        
        <div class="job-description">
          ${job.description || 'No description available.'}
        </div>
        
        ${job.requirements ? `
          <div class="job-requirements">
            <h2>Requirements</h2>
            ${job.requirements}
          </div>
        ` : ''}
        
        ${job.benefits ? `
          <div class="job-benefits">
            <h2>Benefits</h2>
            ${job.benefits}
          </div>
        ` : ''}
        
        ${SHOW_APPLY_BUTTON ? `
          <div class="job-apply-footer">
            <a href="${APPLY_URL_PATTERN.replace('{{jobId}}', job.id)}" class="apply-button">Apply for this position</a>
          </div>
        ` : ''}
      </div>
    `;
    
    container.innerHTML = html;
    
    // Add share functionality if the Share API is supported
    if (SHOW_APPLY_BUTTON && navigator.share) {
      document.getElementById('share-job-button').addEventListener('click', () => {
        navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title}`,
          url: window.location.href
        }).catch(err => {
          console.error('Error sharing:', err);
        });
      });
    } else if (SHOW_APPLY_BUTTON) {
      // Hide share button if Share API is not supported
      const shareButton = document.getElementById('share-job-button');
      if (shareButton) {
        shareButton.style.display = 'none';
      }
    }
  }
  
  /**
   * Renders an error message
   * @param {string} message - Error message to display
   */
  function renderError(message) {
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${JOB_DETAIL_CONTAINER_ID}" not found.`);
      return;
    }
    
    container.innerHTML = `
      <div class="job-error">
        <p>${message}</p>
        <button id="retry-button">Try Again</button>
      </div>
    `;
    
    document.getElementById('retry-button').addEventListener('click', initialize);
  }
  
  /**
   * Renders a "Job not found" message
   */
  function renderJobNotFound() {
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${JOB_DETAIL_CONTAINER_ID}" not found.`);
      return;
    }
    
    container.innerHTML = `
      <div class="job-not-found">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <a href="/jobs" class="back-to-jobs">View All Jobs</a>
      </div>
    `;
  }
  
  /**
   * Initializes the job detail page
   */
  async function initialize() {
    // Inject CSS styles
    const styles = document.createElement('style');
    styles.textContent = `
      #${JOB_DETAIL_CONTAINER_ID} {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      .job-detail {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .job-title {
        font-size: 28px;
        margin-bottom: 15px;
      }
      
      .job-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .job-meta > div {
        font-size: 14px;
        color: #555;
      }
      
      .job-actions {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
      }
      
      .apply-button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #0066cc;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        font-size: 16px;
        transition: background-color 0.2s ease;
        border: none;
        cursor: pointer;
      }
      
      .apply-button:hover {
        background-color: #0052a3;
      }
      
      .share-button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #f5f5f5;
        color: #333;
        text-decoration: none;
        border-radius: 4px;
        font-size: 16px;
        border: 1px solid #ddd;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .share-button:hover {
        background-color: #e5e5e5;
      }
      
      .job-description {
        margin-bottom: 30px;
        line-height: 1.6;
      }
      
      .job-requirements, .job-benefits {
        margin-bottom: 30px;
      }
      
      .job-requirements h2, .job-benefits h2 {
        font-size: 22px;
        margin-bottom: 15px;
      }
      
      .job-apply-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        text-align: center;
      }
      
      .job-error, .job-not-found {
        text-align: center;
        padding: 60px 20px;
      }
      
      .job-error button, .back-to-jobs {
        display: inline-block;
        margin-top: 15px;
        padding: 8px 16px;
        background-color: #0066cc;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        border: none;
        cursor: pointer;
      }
    `;
    
    document.head.appendChild(styles);
    
    // Check if container exists
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    if (!container) {
      console.error(`Container with ID "${JOB_DETAIL_CONTAINER_ID}" not found.`);
      return;
    }
    
    // Get job ID from URL
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      renderError('No job ID provided in the URL.');
      return;
    }
    
    // Show loading indicator
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p>Loading job details...</p>
      </div>
    `;
    
    // Fetch and render job details
    const job = await fetchJobDetail(jobId);
    if (job) {
      renderJobDetail(job);
      
      // Update page title with job title
      document.title = `${job.title} - Job Details`;
      
      // Update meta description with job summary if available
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && job.summary) {
        metaDescription.setAttribute('content', job.summary);
      }
    } else {
      renderJobNotFound();
    }
  }
  
  // Run the script when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
