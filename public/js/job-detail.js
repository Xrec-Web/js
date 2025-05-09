/**
 * Loxo Job Detail Integration Script for Webflow
 * This script fetches and displays detailed information about a specific job from the Loxo API.
 */
(function () {
  // Configuration
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const JOB_DETAIL_CONTAINER_ID = 'job-detail-container';
  const SHOW_APPLY_BUTTON = true;
  const APPLY_URL_PATTERN = '/apply-job?id={{jobId}}';

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id') || urlParams.get('jobId');
    return idParam || null;
  }

  async function fetchJobDetail(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/job-detail?id=${jobId}`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data || null; // Corrected to match actual API structure
    } catch (error) {
      console.error('Error fetching job details:', error);
      renderError('Unable to load job details. Please try again later.');
      return null;
    }
  }

  function renderJobDetail(job) {
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    if (!container) return;

    const html = `
      <div class="job-detail">
        <h1 class="job-title">${job.title}</h1>
        <div class="job-meta">
          ${job.city ? `<div><strong>Location:</strong> ${job.city}, ${job.state_code || ''}</div>` : ''}
          ${job.category?.name ? `<div><strong>Category:</strong> ${job.category.name}</div>` : ''}
          ${job.job_type?.name ? `<div><strong>Type:</strong> ${job.job_type.name}</div>` : ''}
          ${job.salary ? `<div><strong>Salary:</strong> ${job.salary}</div>` : ''}
        </div>
        ${SHOW_APPLY_BUTTON ? `
          <div class="job-actions">
            <a href="${APPLY_URL_PATTERN.replace('{{jobId}}', job.id)}" class="apply-button">Apply Now</a>
            <button class="share-button" id="share-job-button">Share Job</button>
          </div>
        ` : ''}
        <div class="job-description">${job.description || 'No description available.'}</div>
        ${SHOW_APPLY_BUTTON ? `
          <div class="job-apply-footer">
            <a href="${APPLY_URL_PATTERN.replace('{{jobId}}', job.id)}" class="apply-button">Apply for this position</a>
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = html;

    // Share button logic
    if (SHOW_APPLY_BUTTON && navigator.share) {
      document.getElementById('share-job-button').addEventListener('click', () => {
        navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title}`,
          url: window.location.href,
        }).catch(err => console.error('Error sharing:', err));
      });
    } else {
      const shareButton = document.getElementById('share-job-button');
      if (shareButton) shareButton.style.display = 'none';
    }
  }

  function renderError(message) {
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    if (!container) return;
    container.innerHTML = `
      <div class="job-error">
        <p>${message}</p>
        <button id="retry-button">Try Again</button>
      </div>
    `;
    document.getElementById('retry-button').addEventListener('click', initialize);
  }

  function renderJobNotFound() {
    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    if (!container) return;
    container.innerHTML = `
      <div class="job-not-found">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <a href="/jobs" class="back-to-jobs">View All Jobs</a>
      </div>
    `;
  }

  async function initialize() {
    const styles = document.createElement('style');
    styles.textContent = `
      #${JOB_DETAIL_CONTAINER_ID} {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .job-detail { max-width: 800px; margin: 0 auto; padding: 20px; }
      .job-title { font-size: 28px; margin-bottom: 15px; }
      .job-meta { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #eee; font-size: 14px; color: #555; }
      .job-actions { display: flex; gap: 15px; margin-bottom: 30px; }
      .apply-button, .back-to-jobs, .job-error button {
        display: inline-block; padding: 10px 20px; background-color: #0066cc; color: #fff;
        text-decoration: none; border-radius: 4px; font-size: 16px; border: none; cursor: pointer;
      }
      .apply-button:hover, .job-error button:hover, .back-to-jobs:hover { background-color: #0052a3; }
      .share-button {
        padding: 10px 20px; background-color: #f5f5f5; color: #333; border: 1px solid #ddd;
        border-radius: 4px; font-size: 16px; cursor: pointer;
      }
      .share-button:hover { background-color: #e5e5e5; }
      .job-description { margin-bottom: 30px; line-height: 1.6; }
      .job-apply-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
      .job-error, .job-not-found { text-align: center; padding: 60px 20px; }
    `;
    document.head.appendChild(styles);

    const container = document.getElementById(JOB_DETAIL_CONTAINER_ID);
    if (!container) return;

    const jobId = getJobIdFromUrl();
    if (!jobId) {
      renderError('No job ID provided in the URL.');
      return;
    }

    container.innerHTML = `<div style="text-align: center; padding: 40px 20px;"><p>Loading job details...</p></div>`;

    const job = await fetchJobDetail(jobId);
    if (job) {
      renderJobDetail(job);
      document.title = `${job.title} - Job Details`;
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
