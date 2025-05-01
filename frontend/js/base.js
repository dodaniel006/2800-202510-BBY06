function logout(){
  fetch("api/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}) // You can send additional data in the body if needed
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        // Redirect user to the home page or show a message
        window.location.href = "/";  // Redirect after successful logout
      } else {
        alert("Logout failed: " + data.message);
      }
    })
    .catch(error => {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out.");
    });
}

document.getElementById("logout")?.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.replace(/\/$/, "").toLowerCase(); // remove trailing slash

  const pageButtons = document.querySelectorAll(".pageButton");

  pageButtons.forEach(link => {
    const linkPath = link.getAttribute("href").replace(/\/$/, "").toLowerCase();

    if (
      linkPath === currentPath ||
      (linkPath === "/home" && (currentPath === "" || currentPath === "/"))
    ) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
});


async function populateUserInfo() {
  try {
    // Check if there are any elements with the class 'profileImage'
    const profileImages = document.getElementsByClassName("profileImage");
    if (profileImages.length === 0) {
      return;  // No need to fetch user data if profile images aren't present
    }

    // Proceed with fetching user data since profile images exist
    const res = await fetch("/api/user/");
    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }

    const { user } = await res.json();

    // Fetch image existence for the profile picture
    const imageRes = await fetch(`/api/files/image-exists?image=${encodeURIComponent(user.profileImage)}`);
    const data = await imageRes.json();
    // If there are profile images on the page, update their source
    Array.from(profileImages).forEach(el => {
      if (data.exists) {
        el.src = user.profileImage;
      } else {
        el.src = "/images/user.png";
      }
    });

  } catch (error) {
    console.error("Error loading user info:", error);
  }
}

populateUserInfo();

