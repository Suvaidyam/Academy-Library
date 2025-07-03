// (function () {
//     "use strict";

//     document.addEventListener("DOMContentLoaded", () => {

//         function loadComponent(file, elementId) {
//             let el = document.getElementById(elementId);
//             if (!el) {
//                 console.error(`Element '${elementId}' not found!`);
//                 return;
//             }

//             fetch(file)
//                 .then(response => response.text())
//                 .then(data => el.innerHTML = data)
//                 .catch(error => console.error(`Error loading ${file}:`, error));
//         }
//         loadComponent("../components/header.html", "header");  // Load Header
//         loadComponent("../components/footer.html", "footer");  // Load Footer

//         a()

//     });

// })();

// const a = () => {
//     console.log("header")
//     let homebtn = document.getElementById("home")
//     console.log("home btn is clicked", homebtn);

// }

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    function loadComponent(file, elementId, callback) {
      let el = document.getElementById(elementId);
      if (!el) {
        console.error(`Element '${elementId}' not found!`);
        return;
      }

      fetch(file)
        .then((response) => response.text())
        .then((data) => {
          el.innerHTML = data;
          // Execute callback after component is loaded
          if (callback) callback();
        })
        .catch((error) => console.error(`Error loading ${file}:`, error));
    }

    // Load header and then execute code that needs header elements
    loadComponent("../components/header.html", "header", () => {
      get_header_elements();
      get_home_element();
    });

    loadComponent("../components/footer.html", "footer");
  });
})();

const get_header_elements = () => {
  let headers = document.querySelectorAll("#navmenu ul li");

  headers.forEach((header) => {
    header.addEventListener("click", (e) => {
      e.preventDefault();
      // Remove 'active' from all nav links
      headers.forEach((item) => {
        let nav = item.querySelector("a");
        if (nav) {
          nav.classList.remove("active");
        }
      });

      // Add 'active' to the clicked nav link

      const clickedNav = header.querySelector("a");

      let href = clickedNav.getAttribute("href");
      console.log("Clicked head:", clickedNav, href);
      // localStorage.setItem("activeNav",href)

      // window.location.href(localStorage.getItem("activeNav"))

      if (href) {
        window.location.href = href;
      }
      if (clickedNav) {
        clickedNav.classList.add("active");
      }
    });
  });
};

const get_home_element = () => {
  let hometab = document.querySelectorAll("#hometab li");
  const homebtn = document.getElementById("homebtn");

  hometab.forEach((header) => {
    header.addEventListener("click", (e) => {
      e.preventDefault();
      // Remove 'active' from all nav links
      hometab.forEach((item) => {
        let nav = item.querySelector("a");
        if (homebtn) {
          homebtn.classList.remove("active");
        }
      });

      // Add 'active' to the clicked nav link

      const clickedNav = header.querySelector("a");

      let href = clickedNav.getAttribute("href");
      console.log("Clicked head:", clickedNav, href);
      // localStorage.setItem("activeNav",href)

      // window.location.href(localStorage.getItem("activeNav"))

      if (href) {
        window.location.href = href;
      }
      if (homebtn) {
        homebtn.classList.add("active");
      }
    });
  });
};

(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
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
