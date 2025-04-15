(function() {
    "use strict";
    document.addEventListener("DOMContentLoaded", () => {
        function loadComponent(file, elementId) {
            let el = document.getElementById(elementId);
            if (!el) {
                console.error(`Element '${elementId}' not found!`);
                return;
            }
  
            fetch(file)
                .then(response => response.text())
                .then(data => el.innerHTML = data)
                .catch(error => console.error(`Error loading ${file}:`, error));
        }
        loadComponent("components/header.html", "header");  // Load Header
        loadComponent("components/footer.html", "footer");  // Load Footer

        setTimeout(function() {
            const signinBtn = document.getElementById("signin");
            const loggedinUser = document.getElementById("loggedinUser");
            const userLoginStatus = JSON.parse(sessionStorage.getItem("user_info"));
            if (userLoginStatus.message == "Logged In") {
                signinBtn.style.display = "none";
                // loggedinUser.value = userLoginStatus.full_name;
            } else {
                signinBtn.style.display = "block";
            }
        }, 500);        
    });

})();