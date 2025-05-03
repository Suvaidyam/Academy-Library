import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient()
import { setSessionList } from "./get_all_courses.js";

const allCheckbox = document.getElementById('allFilesCheck');
const checkboxes = document.querySelectorAll('.form-check-input:not(#allFilesCheck)');

const handle_filetype_btn = () => {




    // 1. When "All" is clicked, check/uncheck all others
    allCheckbox.addEventListener('click', function () {
        checkboxes.forEach(cb => {
            cb.checked = allCheckbox.checked;
            // get_seesion_list()
            // get_seesion_list(checkboxes)

        });


    });

    // 2. When any individual checkbox is clicked
    checkboxes.forEach(cb => {
        cb.addEventListener('click', async function () {

            get_seesion_list(checkboxes)

            allCheckbox.checked = allChecked;
            console.log("all=====================", allChecked);


            // Log which checkboxes are currently checked

        });
    });



}
const get_seesion_list = async () => {
    // const allCheckbox = document.getElementById('allFilesCheck');

    const chapterSelect = document.getElementById('chapterSearch');
    const selectedValue = chapterSelect.value;
    console.log('Selected chapter:', selectedValue);
    const checkedValues = Array.from(checkboxes)
        .filter(input => input.checked)
        .map(input => input.value);
    if (checkedValues.length == 4) {
        allCheckbox.checked = true;
    } else {
        allCheckbox.checked = false;
    }

    try {
        let response = await frappe_client.get('/get_session_list', {
            file_type: checkedValues,
            selected_chapter: selectedValue
        });
        console.log('session list:', response);
        // console.log('Clicked checkbox value:', this.value);
        setSessionList(response);
    } catch (err) {
        console.error('Error fetching session list:', err);
    }
}





document.addEventListener('DOMContentLoaded', () => {
    handle_filetype_btn();
});

// handle Book sorting 


document.addEventListener('DOMContentLoaded', function () {
    const sortOptions = document.getElementById('sortOptions');
    const radioButtons = sortOptions.querySelectorAll('input[type="radio"]');
    const clearButton = document.getElementById('clearSelection');
  
    // Handle selection change
    radioButtons.forEach(radio => {
      radio.addEventListener('change', function () {
        if (this.checked) {
          console.log('Selected sort option:', this.value);
          // Implement your sorting logic here based on this.value
        }
      });
    });
  
    // Clear selection
    clearButton.addEventListener('click', function () {
      radioButtons.forEach(radio => {
        radio.checked = false;
      });
      console.log('Selection cleared');
      // Implement additional logic here if needed when selection is cleared
    });
  });
  