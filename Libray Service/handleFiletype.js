import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient();
import { setSessionList } from "./get_all_courses.js";

const allCheckbox = document.getElementById("allFilesCheck");
// const checkboxes = document.querySelectorAll('.form-check-input:not(#allFilesCheck)');
const checkboxes = document.querySelectorAll(
  'input.form-check-input[type="checkbox"]:not(#allFilesCheck)',
);

// allCheckbox.addEventListener('click',()=>{
//     get_seesion_list(checkboxes)
// })

const handle_filetype_btn = () => {
  // 1. When "All" is clicked, check/uncheck all others
  allCheckbox.addEventListener("click", function () {
    checkboxes.forEach((cb) => {
      cb.checked = allCheckbox.checked;
    });

    get_seesion_list();
  });

  // 2. When any individual checkbox is clicked
  checkboxes.forEach((cb) => {
    cb.addEventListener("click", async function () {
      get_seesion_list();

      // allCheckbox.checked = allChecked;

      // Log which checkboxes are currently checked
    });
  });
};
const get_seesion_list = async () => {
  // const allCheckbox = document.getElementById('allFilesCheck');

  const chapterSelect = document.getElementById("chapterSearch").value;
  const topicSelect = document.getElementById("topicSearch").value;
  const courseSelect = document.getElementById("courseSearch").value;

  const selectedValue = chapterSelect.value;
  const checkedValues = Array.from(checkboxes)
    .filter((input) => input.checked)
    .map((input) => input.value);

  if (checkedValues.length >= 5) {
    allCheckbox.checked = true;
  } else {
    allCheckbox.checked = false;
  }

  //
  let payload = {
    file_type: JSON.stringify(checkedValues),
  };

  if (chapterSelect && chapterSelect !== "Select a Chapter") {
    payload.selected_chapter = chapterSelect;
  } else if (topicSelect && topicSelect !== "Select a Topic") {
    payload.selected_topic = topicSelect;
  } else if (courseSelect && courseSelect !== "Select a Module") {
    payload.selected_course = courseSelect;
  }

  try {
    const response = await frappe_client.get("/get_newsession_list", payload);
    setSessionList(response);
  } catch (err) {
    console.error("Error fetching session list:", err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  handle_filetype_btn();
});

// handle Book sorting

import set_book_list from "./get_book_list.js";

document.addEventListener("DOMContentLoaded", function () {
  const sortOptions = document.getElementById("sortOptions");
  // const radioButtons = sortOptions.querySelectorAll('input[type="radio"]');
  const radioButtons = [];
  // const clearButton = document.getElementById('clearSelection');
  const searchInput = document.getElementById("bookSearchInput");
  // Handle selection change
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", async function () {
      if (this.checked) {
        if (searchInput.value) {
          try {
            const response = await frappe_client.get("/filter_global_book", {
              sort_type: this.value,
              global_val: searchInput.value,
            });
            set_book_list(response);
          } catch (error) {
            console.error("Error fetching book list:", error);
          }
        } else {
          try {
            const response = await frappe_client.get("/get_book_list", {
              sort_type: this.value,
            });
            set_book_list(response);
          } catch (error) {
            console.error("Error fetching book list:", error);
          }
        }

        // Implement your sorting logic here based on this.value
      }
    });
  });

  // Clear selection
  // clearButton.addEventListener('click', function () {
  //     const searchInput = document.getElementById('bookSearchInput');
  //     searchInput.value = ''
  //     radioButtons.forEach(radio => {
  //         radio.checked = false;
  //     });
  // });
});
