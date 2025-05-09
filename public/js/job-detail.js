(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';

  console.log('[LOXO JOB DETAIL] DOM ready, starting script');

  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  async function fetchJobDetail(jobId) {
    const url = `${API_BASE_URL}/job-detail?id=${jobId}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('[ERROR] Could not fetch job:', err);
      return null;
    }
  }

  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element with data-element="${selector}"]`);
    if (value) el.innerText = value;
  }

  function setHTML(selector, html) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element with data-element="${selector}"]`);
    el.innerHTML = html;
  }

  function renderJobDetail(job) {
    console.log('[LOXO JOB DETAIL] Rendering job:', job.title);
    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description provided.');

    const applyBtn = document.querySelector('[data-element="apply-link"]');
    if (applyBtn) applyBtn.setAttribute('href', `?id=${job.id}#apply`);

    const shareBtn = document.querySelector('[data-element="share-button"]');
    if (shareBtn && navigator.share) {
      shareBtn.addEventListener('click', () => {
        navigator
          .share({ title: job.title, text: `Check out this job: ${job.title}`, url: window.location.href })
          .catch(console.error);
      });
    } else if (shareBtn) {
      shareBtn.style.display = 'none';
    }

    document.title = `${job.title} – Job Details`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && job.description_text) {
      metaDesc.setAttribute('content', job.description_text.slice(0, 160));
    }
  }

  function renderJobNotFound() {
    const container = document.querySelector('[data-element="job-detail-container"]');
    if (!container) return console.error('[ERROR] No container found to render fallback.');
    container.innerHTML = `
      <div style="text-align:center; padding:40px;">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <a href="/jobs" class="apply-button">View All Jobs</a>
      </div>
    `;
  }

  function setupFileUploadAndForm(jobId) {
    const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
    const pond = FilePond.create(inputElement, {
      credits: false,
      name: 'fileToUpload',
      storeAsFile: true,
    });

    Webflow.push(function () {
      $('#wf-form-Form-Apply-Job').submit(async function (e) {
        e.preventDefault();
        e.stopPropagation();

        const file = pond.getFile();
        if (!file) {
          alert('Please upload a resume.');
          return false;
        }

        const emailEl = document.getElementById('Email');
        const nameEl = document.getElementById('Name');
        const phoneEl = document.getElementById('Phone');
        const linkedinEl = document.getElementById('LinkedIn');

        if (!emailEl || !nameEl || !phoneEl || !linkedinEl) {
          alert('Form is misconfigured. Please contact the site administrator.');
          return false;
        }

        const form = new FormData();
        form.append('email', emailEl.value);
        form.append('name', nameEl.value);
        form.append('phone', phoneEl.value);
        form.append('linkedin', linkedinEl.value);
        form.append('resume', file.file, file.file.name);

        const options = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            JobId: jobId,
          },
          body: form,
        };

        $('.submit-button-apply-job')
          .val('Please Wait...')
          .css('cursor', 'not-allowed')
          .attr('disabled', true);

        try {
          const response = await fetch(`${API_BASE_URL}/apply-job`, options);
          const responseData = await response.json();

          if (responseData.success === true) {
            $('.fs_modal-1_close-2').trigger('click');
            Toastify({
              text: 'Your application was successfully sent!',
              duration: 2000,
              gravity: 'top',
              position: 'center',
              style: { background: '#527853', color: '#FFFFFF' },
            }).showToast();

            pond.removeFile();
            $('#wf-form-Form-Apply-Job').trigger('reset');
          } else {
            console.error('Failed to submit the form:', responseData);
            alert('Failed to submit the form. Please try again.');
          }
        } catch (err) {
          console.error('Error:', err);
          alert('An error occurred while submitting the form. Please try again.');
        } finally {
          $('.submit-button-apply-job')
            .val('Submit')
            .css('cursor', 'pointer')
            .attr('disabled', false);
        }

        return false;
      });
    });
  }

  function setupMultiFormUploadFallback() {
    document.querySelectorAll('form[ms-code-file-upload="form"]').forEach((form) => {
      form.setAttribute('enctype', 'multipart/form-data');
      form.querySelectorAll('[ms-code-file-upload-input]').forEach((uploadInput) => {
        const inputName = uploadInput.getAttribute('ms-code-file-upload-input');

        if (!uploadInput.querySelector(`input[name="${inputName}"]`)) {
          const fileInput = document.createElement('input');
          fileInput.setAttribute('type', 'file');
          fileInput.setAttribute('name', inputName);
          fileInput.setAttribute('id', inputName);
          fileInput.required = true;
          uploadInput.appendChild(fileInput);
        }
      });
    });
  }

  async function initialize() {
    console.log('[LOXO JOB DETAIL] Initializing...');
    const jobId = getJobIdFromUrl();
    if (!jobId) {
      console.warn('[WARN] No job ID found in URL');
      renderJobNotFound();
      return;
    }

    console.log('[INFO] Found job ID:', jobId);
    const job = await fetchJobDetail(jobId);

    if (job && job.title) {
      renderJobDetail(job);
      setupFileUploadAndForm(job.id);
    } else {
      console.warn('[WARN] No job found');
      renderJobNotFound();
    }

    setupMultiFormUploadFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
