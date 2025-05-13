(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const FORM_SELECTOR = '[data-element="apply-job-form"]';
  const FILE_INPUT_SELECTOR = 'input[name="resume"]';
  const FILEPOND_SELECTOR = '[data-element="filepond"]';

  console.log('[APPLY JOB] DOM ready, starting script');

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  function ensureFileInputExists() {
    const existingInput = document.querySelector(FILE_INPUT_SELECTOR);
    if (existingInput) return; // File input already exists, no need to create it again

    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'resume';
    input.accept = '.pdf,.doc,.docx';
    input.required = true;
    document.querySelector(FILEPOND_SELECTOR).appendChild(input);
    console.log('[APPLY JOB] File input created');
  }

  async function handleFormSubmission(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const jobId = getJobIdFromUrl();

    if (!jobId) {
      console.error('[ERROR] No job ID found');
      return;
    }

    // Add jobId to the form data before sending
    formData.append('jobid', jobId);

    try {
      const response = await fetch(`${API_BASE_URL}/apply-job`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[APPLY JOB ERROR]', errorData);
        alert('There was an issue with your application. Please try again.');
        return;
      }

      const result = await response.json();
      console.log('[APPLY JOB SUCCESS]', result);
      alert('Your application has been submitted successfully!');
    } catch (error) {
      console.error('[APPLY JOB ERROR]', error);
      alert('There was an issue with your application. Please try again later.');
    }
  }

  function initializeFilePond() {
    // Initialize FilePond for the file input element
    if (document.querySelector(FILE_INPUT_SELECTOR)) {
      const pond = FilePond.create(document.querySelector(FILE_INPUT_SELECTOR));
      pond.on('addfile', (error, file) => {
        if (error) {
          console.error('[ERROR] FilePond file add failed', error);
        } else {
          console.log('[INFO] File added: ', file.filename);
        }
      });
      console.log('[APPLY JOB] FilePond initialized');
    } else {
      console.error('[ERROR] File input not found for FilePond initialization');
    }
  }

  function initialize() {
    const jobId = getJobIdFromUrl();

    if (!jobId) {
      console.warn('[WARN] No job ID found in URL');
      return;
    }

    console.log('[INFO] Found job ID:', jobId);

    // Ensure the file input exists and is ready for FilePond
    ensureFileInputExists();

    // Initialize FilePond
    initializeFilePond();

    // Attach the form submit handler
    const form = document.querySelector(FORM_SELECTOR);
    if (form) {
      form.addEventListener('submit', handleFormSubmission);
      console.log('[APPLY JOB] Form initialized');
    } else {
      console.error('[ERROR] No form element found with selector:', FORM_SELECTOR);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
