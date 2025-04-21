 

document.addEventListener("DOMContentLoaded", function () {
    const readMoreButtons = document.querySelectorAll('.read-more');

    readMoreButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const content = this.previousElementSibling;

        if (content.style.display === 'none' || !content.style.display) {
          content.style.display = 'block';
          this.textContent = 'Read Less';
        } else {
          content.style.display = 'none';
          this.textContent = 'Read More';
        }
      });
    });
  });

