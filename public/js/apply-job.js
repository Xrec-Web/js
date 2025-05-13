(function () {
  console.log('[APPLY JOB] DOM ready, starting script');

  const API_BASE_URL = 'https://sky-api.vercel.app/api';

  let filePondInitialized = false;

  function initializeFilePond() {
    if (typeof FilePond === 'undefined') {
      console.warn('[APPLY JOB] FilePond not yet loaded. Retrying...');
      setTimeout(initializeFilePond, 500);
      return;
    }

    const fileInput = document.querySelector('input[type="file"][name="fileToUpload"]');
    if (!fileInput) {
      console.warn('[APPLY JOB] File input not found. Waiting for it...');
      return;
    }

    const pond = FilePond.create(fileInput, {
      credits: false,
      storeAsFile: true
    });

    pond.on('ready', function () {
      console.log('[APPLY JOB] FilePond is ready.');

      const formElement = document.querySelector('#wf-form-Form-Apply-Job');
      if (formElement) {
        formElement.addEventListener('submit', handleFormSubmit);
        console.log('[APPLY JOB] Form submit listener bound.');
      }

      filePondInitialized = true;
    });
  }

  function handleFormSubmit(e) {
    // your existing handleFormSubmit code...
  }

  function observeFileInput() {
    const observer = new MutationObserver((mutationsList, observerInstance) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const fileInput = document.querySelector('input[type="file"][name="fileToUpload"]');
          if (fileInput) {
            console.log('[APPLY JOB] File input found via MutationObserver');
            observerInstance.disconnect();
            initializeFilePond();
            break;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    console.log('[APPLY JOB] DOM is fully loaded.');
    observeFileInput(); // Start observing for file input
  });
})();
