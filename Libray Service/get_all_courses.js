import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient()

const get_all_courses = async () => {
    try {
        let response = await frappe_client.get('/get_all_course_list', {
            doctype: 'LMS Course'
        })
        console.log("response00000", response);
        set_course_option(response)

    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
}

const set_course_option = (response) => {
    const select = document.getElementById('courseSearch');

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

const set_topic_option = async (course) => {
    let response = await frappe_client.get('/get_all_course_list', {
        doctype: 'Topic',
        selected_course: course
    })

    const select = document.getElementById('topicSearch');

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
        set_chapter_option(this.value)
    });
}

const set_chapter_option = async (topic) => {
    let response = await frappe_client.get('/get_all_course_list', {
        doctype: 'Chapter',
        selected_topic: topic
    })

    console.log("=====topic===", topic, response);


    const select = document.getElementById('chapterSearch');

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

    // select.addEventListener('change', function async() {
    //     console.log(this.value);
    //     let response = await frappe_client.get('/get_session_list')
        
    //     // set_chapter_option(this.value)
    // });
    select.addEventListener('change',async function () {
        console.log(this.value);
        let response = await frappe_client.get('/get_session_list',{
            selected_chapter:this.value
        })
        setSessionList(response)
    });


}


const get_session_list = async () => {
    let response = await frappe_client.get('/get_session_list')
    console.log('session list', response);
    setSessionList(response)


    

}

export function setSessionList(response) {
    let SessionList = document.querySelector('#searchResults')
    console.log(response);
    SessionList.innerHTML = ""
    // console.log(SessionList, 'emptyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');

    response.message.forEach(element => {


        let result_card = ` 
                      <li class="result-item" data-type="pdf">${element.name} (${element.doc_type})</li>
                    `


        SessionList.insertAdjacentHTML("beforeend", result_card);

    });




}








document.addEventListener('DOMContentLoaded', () => {
    get_all_courses()
    get_session_list()

})


// console.log("get_coursess",FrappeApiClient);
