import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient()

const get_assingment_module_list = async () => {
    let response = await frappe_client.get('/get_module_dependent_options')
    // console.log("response",response);
    set_module_option(response)

}

const set_module_option = (response) => {
    const select = document.getElementById('moduleDropdown');

    while (select.options.length > 1) {
        select.remove(1);
    }
    select.selectedIndex = 0;

    // Append dynamic options
    response.message.forEach(course => {
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name.charAt(0).toUpperCase() + course.name.slice(1);
        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        set_topic_option(this.value)
    });
}


const set_topic_option = async (module) => {
    let response;

    try {
        response = await frappe_client.get('/get_module_dependent_options', {
            selected_module: module
        });
        console.log("rmodule00000", response);
    } catch (error) {
        console.error('Error fetching topic options:', error);
        return; // Stop execution if request fails
    }

    const select = document.getElementById('topicDropdown');

    // Clear previous options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    select.selectedIndex = 0;

    // Append new options if available
    if (response && response.message && Array.isArray(response.message)) {
        response.message.forEach(course => {
            const option = document.createElement('option');
            option.value = course.name;
            option.textContent = course.name.charAt(0).toUpperCase() + course.name.slice(1);
            select.appendChild(option);
        });
    } else {
        console.warn('No course data found in response.');
    }

    select.addEventListener('change', function () {
        set_chapter_option(this.value)
        console.log(this.value);
        
    });
};

// const set_chapter_option = async (topic) => {
//     let response;

//     try {
//         response = await frappe_client.get('/get_module_dependent_options', {
//             selected_topic: topic
//         });
//         console.log("rmodule00000", response);
//     } catch (error) {
//         console.error('Error fetching topic options:', error);
//         return; // Stop execution if request fails
//     }

//     const select = document.getElementById('topicDropdown');

//     // Clear previous options except the first one
//     while (select.options.length > 1) {
//         select.remove(1);
//     }
//     select.selectedIndex = 0;

//     // Append new options if available
//     if (response && response.message && Array.isArray(response.message)) {
//         response.message.forEach(course => {
//             const option = document.createElement('option');
//             option.value = course.name;
//             option.textContent = course.name.charAt(0).toUpperCase() + course.name.slice(1);
//             select.appendChild(option);
//         });
//     } else {
//         console.warn('No course data found in response.');
//     }

//     select.addEventListener('change', function () {
//         set_chapter_option(this.value)
//         console.log(this.value);
        
//     });
// };


document.addEventListener('DOMContentLoaded', () => {
    get_assingment_module_list()

})



