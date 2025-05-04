import ENV from "../config/config.js";
import { FrappeApiClient } from "../services/FrappeApiClient.js";

let frappe_client = new FrappeApiClient();
const assignment_tab = document.getElementById('assignment-tab');
const question_tab = document.getElementById('question-tab');




const get_tab_details = async () => {
    let response = await frappe_client.get('/get_assessment_list', {
        doctype: "Assignment",
    });
    console.log("get_tab_details", response);
      
    
    console.log("get_tab_details", tab_type, response);
    if (tab_type == 'Assignment') {
        set_all_assignment(response);
    }
    if (tab_type == 'LMS Question') {
        set_all_questions(response);
    }
}
assignment_tab.addEventListener('click', () => {
    get_tab_details('Assignment')

});
question_tab.addEventListener('click', () => {
    get_tab_details('LMS Question')

});


const get_all_assignments = async () => {
    try {
        let response = await frappe_client.get('/get_articles_list',
            { tab: 'Assignment' }
        );
        console.log("get_articles_list", response);

        set_all_assignment(response);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
};


const set_all_assignment = (response) => {
    if (response) {
        const assignment_card = document.getElementById('assignment-container');
        assignment_card.innerHTML = ""

        response.message.forEach(item => {
            // let article_date = formatDate(item.datetime);

            let cards = ` 
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="">
                                <img src="${ENV.API_BASE_URL + item?.image}" class="img-fluid " alt="...">
                            </div>
                            <h5 class="card-title text-primary">${item.title}</h5>
                            <h4 class="card-subtitle mb-2 ">By ${item.author} </h4>
                            <h6 class="card-time mb-2"> ${item.publication_date} </h6>
                            <p class="card-text flex-grow-1">${item.description}</p>
                        </div>
                    </div>
                </div>`
            assignment_card.insertAdjacentHTML("beforeend", cards);
        });
    }
};
const set_all_questions = (response) => {
    if (response) {
        const question_card = document.getElementById('questions-container');
        question_card.innerHTML = ""
        console.log(question_card, '======journals_card');


        response.message.forEach(item => {
            // let article_date = formatDate(item.datetime);

            let cards = ` 
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-journal_name text-primary">${item.journal_name}</h5>
                            <h4 class="card-department mb-2 ">By ${item.department} </h4>
                            <h6 class="card-time mb-2"> ${item.first_published_date} </h6>
                            <h6 class="card-text flex-grow-1">${item.frequency}</h6>
                        </div>
                    </div>
                </div>`
            question_card.insertAdjacentHTML("beforeend", cards);
        });
    }
};

window.addEventListener("DOMContentLoaded", () => {
    get_all_assignments();
    get_tab_details();
    // get_tab_details('Articles');
})




