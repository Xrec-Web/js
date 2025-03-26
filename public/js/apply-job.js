/**
 * Loxo Job Application Integration Script for Webflow
 * This script creates a job application form and handles submissions.
 */

(function() {
  // Configuration
  // No longer need agency slug or bearer token in client-side code!
  
  // DOM element where the application form will be rendered
  const APPLICATION_FORM_CONTAINER_ID = 'job-application-form';
  
  // Optional configuration
  const RESUME_FILE_TYPES = 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const MAX_FILE_SIZE_MB = 5;
  
  // API endpoint (pointing to your Vercel proxy)
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  
  /**
   * Gets the job ID from the URL
   * @returns {string|null} Job ID or null if not found
   */
  function getJobIdFromUrl() {
    // Check for job ID in URL path
    const pathMatch = window.location.pathname.match(/\/apply(?:-job)?\/([^\/]+)/i);
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
   * Fetches job details from our proxy API
   * @param {string} jobId - The ID of the job to fetch
   * @returns {Promise<Object>} Job data
   */
  async function fetchJobDetail(jobId) {
    try {
      // No need for authorization headers - proxy handles that!
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
   * Submits the job application to our proxy API
   * @param {string} jobId - The ID of the job being applied to
   * @param {FormData} formData - Form data containing application details
   * @returns {Promise<Object>} Response data
   */
  async function submitApplication(jobId, formData) {
    try {
      // No need for authorization headers - proxy handles that!
      const response = await fetch(`${API_BASE_URL}/apply-job?id=${jobId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }
  
  // The rest of your existing code can stay the same...
  // This includes all your rendering functions like renderApplicationForm(), validateForm(), etc.
  
  /**
   * Initializes the job application page
   */
  async function initialize() {
    // Check if container exists
    const container = document.getElementById(APPLICATION_FORM_CONTAINER_ID);
    if (!container) {
      console.error(`Container with ID "${APPLICATION_FORM_CONTAINER_ID}" not found.`);
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
        <p>Loading application form...</p>
      </div>
    `;
    
    // Fetch job details and render application form
    const job = await fetchJobDetail(jobId);
    if (job) {
      renderApplicationForm(job);
    } else {
      renderError('Job not found. Please check the URL and try again.');
    }
  }
  
  // Run the script when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initialize);
})();
