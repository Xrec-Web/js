(function () {
  const API_BASE_URL = 'https://js-flame-sigma.vercel.app/api';
  const APPLY_ENDPOINT = `${API_BASE_URL}/apply-job`;

  console.log('[LOXO JOB DETAIL] DOM ready, starting script');

  // --- Get job ID from URL ---
  function getJobIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) return pathMatch[1];

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('jobId') || null;
  }

  // --- Fetch job from API ---
  async function fetchJobDetail(jobId) {
    const url = `${API_BASE_URL}/job-detail?id=${jobId}`;
    console.log('[LOXO JOB DETAIL] Fetching job from:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      return data || null;
    } catch (err) {
      console.error('[ERROR] Could not fetch job:', err);
      return null;
    }
  }

  // --- Safely set text content ---
  function setText(selector, value) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element with data-element="${selector}"]`);
    if (value) el.innerText = value;
  }

  // --- Safely set HTML content ---
  function setHTML(selector, html) {
    const el = document.querySelector(`[data-element="${selector}"]`);
    if (!el) return console.warn(`[WARN] Missing element with data-element="${selector}"]`);
    el.innerHTML = html;
  }

  // --- Render job info into the page ---
  function renderJobDetail(job) {
    console.log('[LOXO JOB DETAIL] Rendering job:', job.title);
    setText('job-title', job.title);
    setText('job-location', job.city ? `${job.city}, ${job.state_code || ''}` : '');
    setText('job-category', job.category?.name);
    setText('job-type', job.job_type?.name);
    setText('job-salary', job.salary);
    setHTML('job-description', job.description || 'No description provided.');

    const applyBtn = document.querySelector('[data-element="apply-link"]');
    if (applyBtn) {
      applyBtn.setAttribute('href', `?id=${job.id}#apply`);
    }

    const shareBtn = document.querySelector('[data-element="share-button"]');
    if (shareBtn && navigator.share) {
      shareBtn.addEventListener('click', () => {
        navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title}`,
          url: window.location.href,
        }).catch(console.error);
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

  // --- Show fallback if job not found ---
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

  // --- Apply form handling ---
  function setupApplyForm(jobId) {
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

        const form = new FormData();
        form.append('email', document.getElementById('Email').value);
        form.append('name', document.getElementById('Name').value);
        form.append('phone', document.getElementById('Phone').value);
        form.append('linkedin', document.getElementById('LinkedIn').value);
        form.append('resume', file.file, file.file.name);

        $('.submit-button-apply-job')
          .val('Please Wait...')
          .css('cursor', 'not-allowed')
          .attr('disabled', true);

        try {
          const response = await fetch(`${APPLY_ENDPOINT}?id=${jobId}`, {
            method: 'POST',
            body: form,
          });

          const responseData = await response.json();

          if (response.ok && responseData.success !== false) {
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

  // --- Main ---
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
      setupApplyForm(job.id);
    } else {
      console.warn('[WARN] No job found');
      renderJobNotFound();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
