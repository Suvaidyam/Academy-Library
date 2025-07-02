(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    function loadComponent(file, elementId) {
      let el = document.getElementById(elementId);
      if (!el) {
        console.error(`Element '${elementId}' not found!`);
        return;
      }

      fetch(file)
        .then((response) => response.text())
        .then((data) => (el.innerHTML = data))
        .catch((error) => console.error(`Error loading ${file}:`, error));
    }

    loadComponent("components/header.html", "header"); // Load Header
    loadComponent("components/footer.html", "footer"); // Load Footer

    setTimeout(function () {
      const signinBtn = document.getElementById("signin");
      const userData = sessionStorage.getItem("user_info");
      const loggedinUser = document.getElementById("loggedinUser");

      if (userData && signinBtn && loggedinUser) {
        const user = JSON.parse(userData);
        const firstLetter = user.full_name?.charAt(0).toUpperCase() || "U";

        signinBtn.style.display = "none";

        loggedinUser.innerHTML = `
          <div class="dropdown">
            <button class="btn btn-success btn-sm dropdown-toggle mt-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              ${firstLetter}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item disabled" href="#">${user.full_name}</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
            </ul>
          </div>
        `;
      }
    }, 500);
  });

  // ✅ Define logout globally so it's accessible from inline onclick
  window.logout = function () {
    sessionStorage.clear();
    window.location.href = "/index.html";
  };
})();
