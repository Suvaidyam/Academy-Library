import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

const set_academic_register = async (formdata=None) => {
    formdata = JSON.stringify(formdata)
    let args=formdata
    try {
       let response= await frappe_client.get('/course_registration',{"args":args})
        
    } catch (error) {
        // Error handling
        console.error('Error in set_academic_register:', error);
        throw error;
    }
}

document.getElementById("registrationForm").addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            formData ? set_academic_register(formObject) : ''
            console.log("Form Data Submitted:", formObject);
            // alert("Form submitted! Check console for data.");
        });
