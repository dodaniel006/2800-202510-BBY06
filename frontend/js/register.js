document.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.getElementById("register");
  const registerForm = document.getElementById("register-form");
  const errorMessageElement = document.getElementById("registerErrorMessage");

  function showRegistrationError(message) {
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
      errorMessageElement.classList.remove("d-none");
    } else {
      alert(message); // Fallback for browsers or if element is not found
    }
  }

  function hideRegistrationError() {
    if (errorMessageElement) {
      errorMessageElement.classList.add("d-none");
    }
  }

  if (registerButton && registerForm) {
    registerButton.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent default form submission
      hideRegistrationError();

      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.username || !data.fullName || !data.email || !data.password) {
        showRegistrationError("Please fill in all fields.");
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Handle successful registration
          window.location.href = "/home"; // Redirect to home or login page
        } else {
          // Handle errors
          const errorData = await response.json();
          showRegistrationError(errorData.message || "Registration failed. Please try again.");
          console.error("Registration failed:", errorData);
        }
      } catch (error) {
        console.error("Error during registration:", error);
        showRegistrationError("An unexpected error occurred. Please try again.");
      }
    });
  } else {
    console.error("Register button or form not found.");
  }
});