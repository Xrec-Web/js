<!-- FilePond CSS + JS -->
<link href="https://unpkg.com/filepond/dist/filepond.min.css" rel="stylesheet" />
<script src="https://unpkg.com/filepond/dist/filepond.min.js"></script>

<script>
  let jobId = '';

  // On job button click, open modal and set jobId
  document.querySelectorAll('[apply-button]').forEach(button => {
    button.addEventListener('click', () => {
      jobId = button.getAttribute('apply-button');
      document.querySelector('#fs-modal-1-popup').classList.add('active');
    });
  });

  // Close modal
  document.querySelector('.fs_modal-1_close-3').addEventListener('click', () => {
    document.querySelector('#fs-modal-1-popup').classList.remove('active');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
    const pond = FilePond.create(inputElement, {
      name: 'resume',
      storeAsFile: true,
      credits: false,
    });

    Webflow.push(() => {
      $('#wf-form-Apply-Job-Form').submit(async function (e) {
        e.preventDefault();

        const file = pond.getFile();
        if (!file) {
          alert('Please upload a resume.');
          return;
        }

        const formData = new FormData();
        formData.append('name', $('#name-2').val());
        formData.append('email', $('#email-2').val());
        formData.append('phone', $('#phone-2').val());
        formData.append('linkedin', $('#linkedin-2').val());
        formData.append('resume', file.file, file.file.name);

        $('.submit-button-apply-job')
          .val('Submitting...')
          .css('cursor', 'not-allowed')
          .attr('disabled', true);

        try {
          const res = await fetch('/api/apply-job', {
            method: 'POST',
            headers: {
              JobId: jobId,
            },
            body: formData,
          });

          if (res.ok) {
            Toastify({
              text: 'Application submitted successfully!',
              duration: 3000,
              gravity: 'top',
              position: 'center',
              style: { background: '#527853', color: '#ffffff' },
            }).showToast();

            pond.removeFile();
            $('#wf-form-Apply-Job-Form').trigger('reset');
            document.querySelector('.fs_modal-1_close-2')?.click();
          } else {
            const errorData = await res.json();
            alert('Error: ' + (errorData?.error || 'Application failed.'));
          }
        } catch (err) {
          console.error(err);
          alert('Unexpected error submitting application.');
        } finally {
          $('.submit-button-apply-job')
            .val('Submit')
            .css('cursor', 'pointer')
            .attr('disabled', false);
        }
      });
    });
  });
</script>
