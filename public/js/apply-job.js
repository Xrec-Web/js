/**
 * Loxo Job Application Integration Script for Webflow
 * This script creates a job application form and handles submissions to the Loxo API.
 * 
 * How to use:
 * 1. Host this script on Vercel
 * 2. Add a <script> tag to your Webflow job application page's custom code section pointing to this script
 * 3. Add a <div id="job-application-form"></div> to your Webflow page where the form will be displayed
 */

(function() {
  // Configuration
// We'll use the Vercel proxy API instead of direct Loxo API access
const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  
  // DOM element where the application form will be rendered
  const APPLICATION_FORM_CONTAINER_ID = 'job-application-form';
  
  // Optional configuration
  const RESUME_FILE_TYPES = 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const MAX_FILE_SIZE_MB = 5; // Maximum file size in MB
  
  /**
   * Gets the job ID from the URL
   * @returns {string|null} Job ID or null if not found
   */
  function getJobIdFromUrl() {
    // Check for job ID in URL path
    // Assuming URL format: /apply-job/123 or /apply/123
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
   * Fetches job details from the Loxo API
   * @param {string} jobId - The ID of the job to fetch
   * @returns {Promise<Object>} Job data
   */
  async function fetchJobDetail(jobId) {
  try {
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
   * Submits the job application to the Loxo API
   * @param {string} jobId - The ID of the job being applied to
   * @param {FormData} formData - Form data containing application details
   * @returns {Promise<Object>} Response data
   */
  async function submitApplication(jobId, formData) {
  try {
    // Use the new proxy API
    const response = await fetch(`${API_BASE_URL}/apply-job?id=${jobId}`, {
      method: 'POST',
      // No need for Authorization header anymore - the proxy handles that
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
  
  /**
   * Renders the job application form
   * @param {Object} job - Job data object
   */
  function renderApplicationForm(job) {
    const container = document.getElementById(APPLICATION_FORM_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${APPLICATION_FORM_CONTAINER_ID}" not found.`);
      return;
    }
    
    // Build application form HTML
    const html = `
      <div class="job-application">
        <h1 class="application-title">Apply for: ${job.title}</h1>
        
        <div class="job-summary">
          ${job.location ? `<div class="job-location"><strong>Location:</strong> ${job.location}</div>` : ''}
          ${job.department ? `<div class="job-department"><strong>Department:</strong> ${job.department}</div>` : ''}
        </div>
        
        <form id="application-form" class="application-form">
          <div class="form-section">
            <h2>Personal Information</h2>
            
            <div class="form-row">
              <div class="form-group">
                <label for="first_name">First Name *</label>
                <input type="text" id="first_name" name="first_name" required>
              </div>
              
              <div class="form-group">
                <label for="last_name">Last Name *</label>
                <input type="text" id="last_name" name="last_name" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address *</label>
              <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <input type="tel" id="phone" name="phone" required>
            </div>
            
            <div class="form-group">
              <label for="location">Location</label>
              <input type="text" id="location" name="location">
              <small>City, State/Province, Country</small>
            </div>
          </div>
          
          <div class="form-section">
            <h2>Resume/CV</h2>
            
            <div class="form-group">
              <label for="resume">Resume/CV (PDF, DOC, DOCX) *</label>
              <input type="file" id="resume" name="resume" accept="${RESUME_FILE_TYPES}" required>
              <small>Maximum file size: ${MAX_FILE_SIZE_MB}MB</small>
            </div>
            
            <div class="form-group">
              <label for="cover_letter">Cover Letter</label>
              <textarea id="cover_letter" name="cover_letter" rows="5" placeholder="Why are you interested in this position?"></textarea>
            </div>
          </div>
          
          <div class="form-section">
            <h2>Additional Information</h2>
            
            <div class="form-group">
              <label for="linkedin_url">LinkedIn Profile URL</label>
              <input type="url" id="linkedin_url" name="linkedin_url" placeholder="https://www.linkedin.com/in/your-profile">
            </div>
            
            <div class="form-group">
              <label for="website">Personal Website or Portfolio</label>
              <input type="url" id="website" name="website" placeholder="https://your-website.com">
            </div>
            
            <div class="form-group">
              <label for="how_heard">How did you hear about this job?</label>
              <select id="how_heard" name="how_heard">
                <option value="">Please select</option>
                <option value="company_website">Company Website</option>
                <option value="job_board">Job Board</option>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Employee Referral</option>
                <option value="social_media">Social Media</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div class="form-section">
            <div class="form-group checkbox-group">
              <input type="checkbox" id="privacy_consent" name="privacy_consent" required>
              <label for="privacy_consent">I consent to having my personal data processed for the purpose of my job application. *</label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="submit-application" class="submit-button">Submit Application</button>
          </div>
          
          <div id="submission-status" class="submission-status"></div>
        </form>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Add form submission handler
    const form = document.getElementById('application-form');
    
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Validate form
        if (!validateForm()) {
          return;
        }
        
        // Show loading state
        const submitButton = document.getElementById('submit-application');
        const statusDiv = document.getElementById('submission-status');
        
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        statusDiv.innerHTML = '<div class="status-loading">Submitting your application...</div>';
        
        // Prepare form data
        const formData = new FormData(form);
        formData.append('job_id', job.id);
        
        try {
          // Submit application
          const result = await submitApplication(job.id, formData);
          
          // Show success message
          statusDiv.innerHTML = `
            <div class="status-success">
              <h3>Application Submitted Successfully!</h3>
              <p>Thank you for applying to ${job.title}. We will review your application and contact you soon.</p>
              <p>Reference ID: ${result.application_id || 'N/A'}</p>
            </div>
          `;
          
          // Hide form
          form.querySelector('.form-section').style.display = 'none';
          form.querySelector('.form-actions').style.display = 'none';
          
          // Scroll to success message
          statusDiv.scrollIntoView({ behavior: 'smooth' });
          
        } catch (error) {
          // Show error message
          statusDiv.innerHTML = `
            <div class="status-error">
              <h3>Error Submitting Application</h3>
              <p>${error.message || 'An unknown error occurred. Please try again later.'}</p>
              <button id="retry-submission" class="retry-button">Try Again</button>
            </div>
          `;
          
          // Re-enable submit button
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Application';
          
          // Add retry handler
          document.getElementById('retry-submission').addEventListener('click', () => {
            statusDiv.innerHTML = '';
          });
        }
      });
      
      // Add file size validation
      const resumeInput = document.getElementById('resume');
      if (resumeInput) {
        resumeInput.addEventListener('change', () => {
          const file = resumeInput.files[0];
          if (file) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
              alert(`File size exceeds the maximum allowed (${MAX_FILE_SIZE_MB}MB). Please select a smaller file.`);
              resumeInput.value = ''; // Clear the input
            }
          }
        });
      }
    }
  }
  
  /**
   * Validates the form fields
   * @returns {boolean} Whether the form is valid
   */
  function validateForm() {
    const form = document.getElementById('application-form');
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('invalid');
        isValid = false;
        
        // Add error message if it doesn't exist
        const errorId = `${field.id}-error`;
        if (!document.getElementById(errorId)) {
          const errorDiv = document.createElement('div');
          errorDiv.id = errorId;
          errorDiv.className = 'field-error';
          errorDiv.textContent = 'This field is required';
          field.parentNode.appendChild(errorDiv);
        }
      } else {
        field.classList.remove('invalid');
        
        // Remove error message if it exists
        const errorDiv = document.getElementById(`${field.id}-error`);
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField && emailField.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailField.value)) {
        emailField.classList.add('invalid');
        
        // Add error message if it doesn't exist
        const errorId = 'email-format-error';
        if (!document.getElementById(errorId)) {
          const errorDiv = document.createElement('div');
          errorDiv.id = errorId;
          errorDiv.className = 'field-error';
          errorDiv.textContent = 'Please enter a valid email address';
          emailField.parentNode.appendChild(errorDiv);
        }
        
        isValid = false;
      } else {
        // Remove error message if it exists
        const errorDiv = document.getElementById('email-format-error');
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    }
    
    return isValid;
  }
  
  /**
   * Renders an error message
   * @param {string} message - Error message to display
   */
  function renderError(message) {
    const container = document.getElementById(APPLICATION_FORM_CONTAINER_ID);
    
    if (!container) {
      console.error(`Container with ID "${APPLICATION_FORM_CONTAINER_ID}" not found.`);
      return;
    }
    
    container.innerHTML = `
      <div class="application-error">
        <h2>Error</h2>
        <p>${message}</p>
        <button id="retry-button" class="retry-button">Try Again</button>
        <a href="/jobs" class="back-to-jobs">View All Jobs</a>
      </div>
    `;
    
    document.getElementById('retry-button').addEventListener('click', initialize);
  }
  
  /**
   * Initializes the job application page
   */
  async function initialize() {
    // Inject CSS styles
    const styles = document.createElement('style');
    styles.textContent = `
      #${APPLICATION_FORM_CONTAINER_ID} {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      .job-application {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .application-title {
        font-size: 28px;
        margin-bottom: 15px;
      }
      
      .job-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 25px;
      }
      
      .job-summary > div {
        font-size: 14px;
        color: #555;
      }
      
      .application-form {
        margin-top: 30px;
      }
      
      .form-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .form-section h2 {
        font-size: 20px;
        margin-bottom: 20px;
      }
      
      .form-row {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
      }
      
      @media (max-width: 600px) {
        .form-row {
          flex-direction: column;
        }
      }
      
      .form-group {
        flex: 1;
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
      
      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .form-group input.invalid,
      .form-group select.invalid,
      .form-group textarea.invalid {
        border-color: #e74c3c;
      }
      
      .form-group small {
        display: block;
        margin-top: 5px;
        font-size: 12px;
        color: #777;
      }
      
      .field-error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
      }
      
      .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      
      .checkbox-group input {
        width: auto;
        margin-top: 3px;
      }
      
      .checkbox-group label {
        font-weight: normal;
      }
      
      .form-actions {
        margin-top: 30px;
      }
      
      .submit-button {
        padding: 12px 24px;
        background-color: #0066cc;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .submit-button:hover {
        background-color: #0052a3;
      }
      
      .submit-button:disabled {
        background-color: #999;
        cursor: not-allowed;
      }
      
      .submission-status {
        margin-top: 20px;
      }
      
      .status-loading {
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 4px;
        text-align: center;
      }
      
      .status-success {
        padding: 20px;
        background-color: #ebf7ed;
        border: 1px solid #d4e9d7;
        border-radius: 4px;
      }
      
      .status-success h3 {
        color: #2ecc71;
        margin-top: 0;
      }
      
      .status-error {
        padding: 20px;
        background-color: #fdedeb;
        border: 1px solid #f8d7da;
        border-radius: 4px;
      }
      
      .status-error h3 {
        color: #e74c3c;
        margin-top: 0;
      }
      
      .retry-button {
        display: inline-block;
        margin-top: 10px;
        padding: 8px 16px;
        background-color: #0066cc;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }
      
      .application-error {
        text-align: center;
        padding: 60px 20px;
      }
      
      .back-to-jobs {
        display: inline-block;
        margin-left: 10px;
        color: #0066cc;
        text-decoration: none;
      }
    `;
    
    document.head.appendChild(styles);
    
    // Check if container exists
    const container = document.getElementById(APPLICATION_FORM_CONTAINER_ID);
    if (!container) {
      console.error(`Container with ID "${APPLICATION_FORM_CONTAINER_ID}" not found.`);
      return;
    }
    
    // Get job ID from URL
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      renderError('No job ID provided in the URL. Please select a job to apply for.');
      return;
    }
    
    // Show loading indicator
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p>Loading application form...</p>
      </div>
    `;
    
    // Fetch job details to show job info in the application form
    const job = await fetchJobDetail(jobId);
    if (job) {
      renderApplicationForm(job);
      
      // Update page title
      document.title = `Apply for: ${job.title}`;
    } else {
      renderError('Could not load job details. The job may no longer be available.');
    }
  }
  
  // Run the script when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
