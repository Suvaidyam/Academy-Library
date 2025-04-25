import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";


const get_all_events = async () => {
    let frappe_client = new FrappeApiClient();

    try {
        let response = await frappe_client.get('/get_events_list')
        // console.log("get_events_list is called", response);
        set_all_events(response)
        
    } catch (error) {

    }
}
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} <span>${year}</span>`;
  }
  

const set_all_events=(response)=>{
    if (response) {
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML=""

        
        response.message.forEach(item => {
            
            let event_date=formatDate(item.datetime)
            // console.log("formatDate(item.starts_on)",event_date);
            
            
      
        const card=` <div class="col-md-6  eventscard" data-aos="fade-up" data-aos-delay="100">
              <div class="service-item d-flex position-relative h-100">
                <div class="evDate">
                  <i class="bi bi-calendar2-check icon icons flex-shrink-0"></i>
                  <p class="date"> ${event_date}</p>
                </div>
                <div>
                  <h4 class="title"><a href="#" class="stretched-link">${item.title}</a></h4>
                  <p class="description">${item.description}</p>
                </div>
              </div>
            </div><!-- End Service Item -->`
            eventsContainer.insertAdjacentHTML("beforeend", card)

        });
        
    }

}





window.addEventListener("DOMContentLoaded", () => {
    get_all_events()
})