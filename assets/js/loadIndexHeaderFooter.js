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
    });

})();