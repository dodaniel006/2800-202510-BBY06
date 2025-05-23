document.addEventListener('DOMContentLoaded', () => {
  const resetPasswordForm = document.getElementById('reset-password-form');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const resetPasswordMessageDiv = document.getElementById('resetPasswordMessage');
  const updatePasswordButton = document.getElementById('updatePasswordButton');
  const tokenIdInput = document.getElementById('tokenId');
  const tokenInput = document.getElementById('token');

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const tokenId = tokenIdInput.value;
      const token = tokenInput.value;

      resetPasswordMessageDiv.classList.add('d-none');
      resetPasswordMessageDiv.classList.remove('alert-success', 'alert-danger', 'alert-warning');
      updatePasswordButton.disabled = true;
      updatePasswordButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';

      if (newPassword !== confirmPassword) {
        resetPasswordMessageDiv.textContent = 'Passwords do not match.';
        resetPasswordMessageDiv.classList.remove('d-none');
        resetPasswordMessageDiv.classList.add('alert-danger');
        updatePasswordButton.disabled = false;
        updatePasswordButton.innerHTML = 'Update Password';
        return;
      }

      if (newPassword.length < 8) { // Example: Basic password length validation
        resetPasswordMessageDiv.textContent = 'Password must be at least 8 characters long.';
        resetPasswordMessageDiv.classList.remove('d-none');
        resetPasswordMessageDiv.classList.add('alert-warning');
        updatePasswordButton.disabled = false;
        updatePasswordButton.innerHTML = 'Update Password';
        return;
      }

      try {
        const response = await fetch('/api/auth/reset-password', { // Updated endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            tokenId, 
            token, 
            newPassword 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          resetPasswordMessageDiv.textContent = data.message + " Redirecting to login...";
          resetPasswordMessageDiv.classList.remove('d-none', 'alert-danger', 'alert-warning');
          resetPasswordMessageDiv.classList.add('alert-success');
          resetPasswordForm.reset();
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000); // Redirect after 3 seconds
        } else {
          resetPasswordMessageDiv.textContent = data.message || 'An unexpected error occurred.';
          resetPasswordMessageDiv.classList.remove('d-none', 'alert-success', 'alert-warning');
          resetPasswordMessageDiv.classList.add('alert-danger');
          updatePasswordButton.disabled = false;
          updatePasswordButton.innerHTML = 'Update Password';
        }
      } catch (error) {
        console.error('Password reset request failed:', error);
        resetPasswordMessageDiv.textContent = 'Failed to send request. Please check your connection and try again.';
        resetPasswordMessageDiv.classList.remove('d-none', 'alert-success', 'alert-warning');
        resetPasswordMessageDiv.classList.add('alert-danger');
        updatePasswordButton.disabled = false;
        updatePasswordButton.innerHTML = 'Update Password';
      }
    });
  }
});
