import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient()
import { setSessionList } from "./get_all_courses.js";

const handle_filetype_btn = () => {

    const allCheckbox = document.getElementById('allFilesCheck');
    const checkboxes = document.querySelectorAll('.form-check-input:not(#allFilesCheck)');

    // 1. When "All" is clicked, check/uncheck all others
    allCheckbox.addEventListener('click', function () {
        checkboxes.forEach(cb => {
            cb.checked = allCheckbox.checked;
        });
    });

    // 2. When any individual checkbox is clicked
    checkboxes.forEach(cb => {
        cb.addEventListener('click', async function () {
            const chapterSelect = document.getElementById('chapterSearch');
            const selectedValue = chapterSelect.value;
            console.log('Selected chapter:', selectedValue);
             try {
                let response = await frappe_client.get('/get_session_list', {
                    file_type: this.value,
                    selected_chapter:selectedValue
                })
                // let response = await frappe_client.get('/get_session_list')
                console.log('session list', response);
                console.log(this.value);
                setSessionList(response);
            } catch (err) {
                console.error('Error fetching session list:', err);
            }

            // If any individual checkbox is unchecked, uncheck "All"
            if (!this.checked) {
                allCheckbox.checked = false;
            } else {
                // If all individual checkboxes are checked, check "All"
                const allChecked = Array.from(checkboxes).every(input => input.checked);
                allCheckbox.checked = allChecked;
            }
        });
    });


}


document.addEventListener('DOMContentLoaded', () => {
    handle_filetype_btn();
});