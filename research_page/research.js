import ENV from "../config/config.js";
import { FrappeApiClient } from "../services/FrappeApiClient.js";

let frappe_client = new FrappeApiClient();
const journals_tab = document.getElementById('journals-tab');
const articles_tab = document.getElementById('articles-tab');
const publications_tab = document.getElementById('publications-tab');




const get_tab_details = async (tab_type) => {
    let response = await frappe_client.get('/get_articles_list', {
            tab: tab_type 
    });
    console.log("get_tab_details", tab_type,response);
    if (tab_type == 'Articles') {
        set_all_articles(response);
    }
    if (tab_type == 'Journals') {
        set_all_journals(response);
    }
    if (tab_type == 'Publications') {
        set_all_publications(response);
    }
    

    
    
}
journals_tab.addEventListener('click', () => {
    get_tab_details('Journals')
    
});
articles_tab.addEventListener('click', () => {
    get_tab_details('Articles')

});
publications_tab.addEventListener('click', () => {
    get_tab_details('Publications')
    
});



const get_all_articles = async () => {
    
    
    try {
        let response = await frappe_client.get('/get_articles_list',
            {tab: 'Articles'}
        );
        console.log("get_articles_list", response);
        
        set_all_articles(response);
        // set_all_journals(response);
        // set_all_publications(response);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
};


const set_all_articles = (response) => {
    if (response) {
        const articles_card = document.getElementById('articles-container');
        articles_card.innerHTML = ""

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
            articles_card.insertAdjacentHTML("beforeend", cards);
        });
    }
};
const set_all_journals = (response) => {
    if (response) {
        const journals_card = document.getElementById('Journals-container');
        journals_card.innerHTML = ""
        console.log(journals_card,'======journals_card');
        

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
            journals_card.insertAdjacentHTML("beforeend", cards);
        });
    }
};
const set_all_publications = (response) => {
    if (response) {
        const publications_card = document.getElementById('Publications-container');
        publications_card.innerHTML = ""

        response.message.forEach(item => {
            // let article_date = formatDate(item.datetime);

            let cards = ` 
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="">
                                <img src="${ENV.API_BASE_URL + item?.pdf}" class="img-fluid " alt="...">
                            </div>
                            <h5 class="card-title text-primary">${item.title}</h5>
                            <h4 class="card-publisher mb-2 ">By ${item.publisher} </h4>
                            <h6 class="card-time mb-2"> ${item.publication_date} </h6>
                        </div>
                    </div>
                </div>`
            publications_card.insertAdjacentHTML("beforeend", cards);
        });
    }
};

window.addEventListener("DOMContentLoaded", () => {
    get_all_articles();
    // get_tab_details('Articles');
})




