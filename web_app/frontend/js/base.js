function logout() {
  fetch("/api/auth/logout", {
    method: "POST",
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

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  // Combine both selectors
  document.querySelectorAll(".mobile-nav .bloc-icon[href], .nav-link[href]").forEach(link => {
    const href = link.getAttribute("href");
    if (href && (currentPath === href || currentPath.startsWith(href))) {
      link.classList.add("active-link");
    }
  });
});
