document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login");
  const loginForm = document.getElementById("login-form"); // Get form by ID
  const errorMessageElement = document.getElementById("loginErrorMessage");

  function showLoginError(message) {
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
      errorMessageElement.classList.remove("d-none");
    } else {
      alert(message); // fallback
    }
  }

  function hideLoginError() {
    if (errorMessageElement) {
      errorMessageElement.classList.add("d-none");
    }
  }

  if (loginButton && loginForm) { // Check for loginForm instead of input fields
    loginButton.addEventListener("click", async (event) => { // Listen for click on button
      event.preventDefault(); // Prevent default form submission
      hideLoginError();

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.email || !data.password) {
        showLoginError("Please fill in all fields.");
        return;
      }

      try {
        const response = await fetch("/api/auth/login", { // Ensure URL matches backend route
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data) // Send form data
        });

        const result = await response.json();

        if (response.ok) {
          // yippee login good
          window.location.href = '/home';
        } else {
          showLoginError(result.message || 'Login failed. Check credentials.');
        }

      } catch (error) {
        console.error('Login request error:', error);
        showLoginError('An error occurred. Please try again Later.');
      }
    });
  } else {
    console.error("Login button or form not found."); // Updated error message
  }
});
