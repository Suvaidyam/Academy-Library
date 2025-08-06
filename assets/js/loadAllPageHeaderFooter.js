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

  // DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("../components/header.html", "header", () => {
      updateUserInterface();
      getHeaderElements();
      getHomeElements();
      setAnnouncementslist();
      set_calender_badge()
    });

    loadComponent("../components/footer.html", "footer");
  });

  // Load external HTML component
  function loadComponent(file, elementId, callback) {
    const el = document.getElementById(elementId);
    if (!el) {
      console.error(`Element '${elementId}' not found!`);
      return;
    }

    fetch(file)
      .then((response) => response.text())
      .then((data) => {
        el.innerHTML = data;
        if (typeof callback === "function") callback(); // run callback after HTML is inserted
      })
      .catch((error) => console.error(`Error loading ${file}:`, error));
  }

  // Update user UI after login
  function updateUserInterface() {
    const userData = sessionStorage.getItem("user_info");
    const signinBtn = document.getElementById("signin");
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
  }

  // Logout user
  window.logout = function () {
    sessionStorage.clear();
    window.location.href = "/index.html";
  };

  // Handle header nav clicks
  function getHeaderElements() {
    const headers = document.querySelectorAll("#navmenu ul li");

    headers.forEach((header) => {
      header.addEventListener("click", (e) => {
        // Don't prevent default for dropdown items or anchor links
        const clickedNav = header.querySelector("a");
        if (clickedNav && clickedNav.classList.contains("dropdown-toggle")) {
          return; // Let dropdown toggle work normally
        }

        // For anchor links, let them work naturally
        if (clickedNav && clickedNav.getAttribute("href") && clickedNav.getAttribute("href").includes("#")) {
          return; // Let anchor links work normally
        }

        e.preventDefault();

        // Remove active class from all
        headers.forEach((item) => {
          const nav = item.querySelector("a");
          if (nav) nav.classList.remove("active");
        });

        if (clickedNav) {
          clickedNav.classList.add("active");
          const href = clickedNav.getAttribute("href");
          if (href) window.location.href = href;
        }
      });
    });
  }

  // Handle home tab clicks
  function getHomeElements() {
    const hometab = document.querySelectorAll("#hometab li");
    const homebtn = document.getElementById("homebtn");

    hometab.forEach((header) => {
      header.addEventListener("click", (e) => {
        e.preventDefault();

        hometab.forEach(() => {
          if (homebtn) homebtn.classList.remove("active");
        });

        const clickedNav = header.querySelector("a");
        if (clickedNav) {
          const href = clickedNav.getAttribute("href");
          if (href) window.location.href = href;
        }

        if (homebtn) homebtn.classList.add("active");
      });
    });
  }
  // const frappe_client = new FrappeApiClient();
  async function setAnnouncementslist() {
    const announcementList = document.getElementById("announcementList");
    const response = await fetch(`https://erp-ryss.ap.gov.in/api/method/get_announcement_list`);
    const announcements = await response.json();
    if (announcements.message.length > 0) {
      let Announcement_icon = document.getElementById("Announcement_icon")
      console.log(Announcement_icon);

      const badge = `<span id="calendar-badge"
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      ${announcements.message.length}
                    </span>`;
      Announcement_icon.insertAdjacentHTML('beforeend', badge);
    }
    // console.log("Announcements:", announcements.message);
    announcementList.innerHTML = ""; // Clear existing items
    announcements.message.length > 0 ?
      announcements.message.forEach(announcement => {
        const li = document.createElement("li");
        li.className = "border-bottom mx-2";
        li.innerHTML = `<button class="dropdown-item">${announcement.title}</button>`;
        announcementList.appendChild(li);
      })
      : announcementList.innerHTML = `<li class="border-bottom mx-2"><button class="dropdown-item" href="#">No Announcements</button></li>`;

  }
  async function set_calender_badge(params) {
    try {
      const response = await fetch("https://erp-ryss.ap.gov.in/api/method/get_calendar_events");
      const data = await response.json();
      if (data.message.future_event_count > 0) {
        let calendar_icon = document.querySelector(".calendar_icon");
        console.log(calendar_icon);


      const badge = `<span id="calendar-badge"
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      ${data.message.future_event_count}
                    </span>`;
      calendar_icon.insertAdjacentHTML('beforeend', badge);
    }
     
    } catch (error) {
      console.error("Login error:", error);
    }
  }
})();




