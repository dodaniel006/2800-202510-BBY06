// async function login() {
//   window.location.href = "/home"; 
// }

// document.getElementById("login")?.addEventListener("click", login);

document.addEventListener("DOMContentLoaded", () => {
  const LoginButton = document.getElementById("login");
  const emailInput = document.getElementById("LoginEmail");
  const passwordInput = document.getElementById("LoginPassword");
  const errorMessageElement = document.getElementById("loginErrorMessage")
});

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

if (loginButton && emailInput && passwordInput) {
  loginButton.addEventListener("click", async () => {
    hideLoginError();

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      showLoginError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("/api/auth/Login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        // yippee login good
        window.location.href = '/home';

      } else {
        showLoginError(result.message || 'Login failed. Check credentials.')

      }

    } catch (error) {
      console.error('Login request error:', error);
      showLoginError('An error occurred. Please try again Later.');
    }
  });
} else {
  console.error("Login button or input fields not found.");
}
