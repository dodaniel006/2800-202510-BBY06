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

const logoutButtons = document.getElementsByClassName("logout");

for (const btn of logoutButtons) {
  btn.addEventListener("click", logout);
}

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
