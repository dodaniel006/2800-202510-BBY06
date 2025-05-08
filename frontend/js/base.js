function logout() {
  fetch("/api/auth/logout", {
    method: "GET",
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      console.log(data.message);
      window.location.href = "/login";
    });
    
  // window.location.href = "/"; // Redirect after successful logout
}

document.getElementById("logout")?.addEventListener("click", logout);

function goToDiary() {
  window.location.href = "/diary"; // Redirect to diary page
}

document.getElementById("diary")?.addEventListener("click", goToDiary);
