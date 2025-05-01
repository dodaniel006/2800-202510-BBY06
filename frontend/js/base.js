function logout() {
  window.location.href = "/"; // Redirect after successful logout
}

document.getElementById("logout")?.addEventListener("click", logout);

function goToDiary() {
  window.location.href = "/diary"; // Redirect to diary page
}

document.getElementById("diary")?.addEventListener("click", goToDiary);
