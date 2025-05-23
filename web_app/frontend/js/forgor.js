document.addEventListener('DOMContentLoaded', () => {
  const forgorForm = document.getElementById('forgor-form');
  const forgorEmailInput = document.getElementById('forgorEmail');
  const forgorErrorMessageDiv = document.getElementById('forgorErrorMessage');
  const sendResetLinkButton = document.getElementById('sendResetLink');
 
  if (forgorForm) {
    forgorForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const email = forgorEmailInput.value;
      forgorErrorMessageDiv.classList.add('d-none'); // Hide previous messages
      forgorErrorMessageDiv.classList.remove('alert-success', 'alert-danger');
      sendResetLinkButton.disabled = true; // Disable button during submission
      sendResetLinkButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';


      try {
        const response = await fetch('/api/forgor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          // Handle success (even if it's a generic message for security)
          forgorErrorMessageDiv.textContent = data.message;
          forgorErrorMessageDiv.classList.remove('d-none', 'alert-danger');
          forgorErrorMessageDiv.classList.add('alert-success');
          forgorForm.reset(); // Optionally reset the form
        } else {
          // Handle errors (e.g., validation error from server, or server error)
          forgorErrorMessageDiv.textContent = data.message || 'An unexpected error occurred.';
          forgorErrorMessageDiv.classList.remove('d-none', 'alert-success');
          forgorErrorMessageDiv.classList.add('alert-danger');
        }
      } catch (error) {
        // Handle network errors or other issues with the fetch request
        console.error('Forgot password request failed:', error);
        forgorErrorMessageDiv.textContent = 'Failed to send request. Please check your connection and try again.';
        forgorErrorMessageDiv.classList.remove('d-none', 'alert-success');
        forgorErrorMessageDiv.classList.add('alert-danger');
      } finally {
        sendResetLinkButton.disabled = false; // Re-enable button
        sendResetLinkButton.innerHTML = 'Send Reset Link';
      }
    });
  }
});