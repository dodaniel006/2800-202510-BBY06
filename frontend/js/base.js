function logout(){
  window.location.href = "/";  // Redirect after successful logout
}

document.getElementById("logout")?.addEventListener("click", logout);
