const newsContainer = document.querySelector("#news-container .row");
const eventsContainer = document.querySelector("#events-container .row");

const newsAPI = "https://erp-ryss.ap.gov.in/api/resource/News?fields=[\"name\",\"title\",\"image\",\"description\",\"datetime\"]";
const eventsAPI = "https://erp-ryss.ap.gov.in/api/resource/Events?fields=[\"name\",\"title\",\"description\",\"datetime\"]";


// Utility function to create News Card
function createNewsCard(item, index) {
  const date = new Date(item.datetime);
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // return `
  //           <div class="card  col-md-5" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
  //             <a href="news-details.html?title=${encodeURIComponent(item.name)}">
  //               <div class="row newsCard">
  //                   <div class="col-md-4">
  //               <img src="${item.image && item.image.trim() !== '' ? item.image : '../assets/img/events-item-1.jpg'}" class="img-fluid" alt="news image"onerror="this.onerror=null;this.src='../assets/img/events-item-1.jpg';">                    </div>
  //                 <div class="col-md-8">
  //                   <div class="card-body">
  //                     <h5 class="mb-2">${item.title}</h5>
  //                     <p class="card-text">${item.description || ''}</p>
  //                     <div class="post-meta">
  //                       <p class="post-date">
  //                        <p>${day} ${month} <span>${year}</span></p>
  //                       </p>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </a>
  //           </div>
  //         `;
}



// Utility function to create Event Card
function createEventCard(item, index) {
  const date = new Date(item.datetime);
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // return `
  //           <div class="col-md-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
  //             <div class="service-item d-flex position-relative h-100">
  //               <div class="evDate col-md-2">
  //                 <i class="bi bi-calendar2-check icon flex-shrink-0"></i>
  //                 <p>${day} ${month} <span>${year}</span></p>
  //               </div>
  //               <div class="col-md-10">
  //                 <h4 class="title"><a href="#" class="stretched-link">${item.title}</a></h4>
  //                 <p class="description">${item.description || ''}</p>
  //               </div>
  //             </div>
  //           </div>
  //         `;
}

const fallbackNewsData = [
  {
    "name": "News-2025-04-16 10:30:19",
    "owner": "Administrator",
    "creation": "2025-04-16 10:31:18.731275",
    "modified": "2025-04-16 10:31:18.731275",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "Total system failure pushes Telangana farmers into despair",
    "image": "/files/Paddy-Grains-2-1-1-456x267-1_V_jpg--816x480-4g.webp",
    "description": "Hyderabad: Season after season, misery after misery is plaguing the farmers of Telangana.\n\nFrom inordinate delays in the",
    "datetime": "2025-04-16 10:52:48"
  },
  {
    "name": "News-2025-04-16 10:52:48",
    "owner": "Administrator",
    "creation": "2025-04-16 10:58:15.388731",
    "modified": "2025-04-16 10:58:15.388731",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "Dhoni effect on show as CSK find a way",
    "image": "/files/dhoni.webp",
    "description": "By the time Shivam Dube got Chennai Super Kings (CSK) over the line at the Ekana Stadium in Lucknow on Monday, it was hard to tell which the home side was. Flags - because of the sticks - had not been allowed in, but the stands still glowed with the yellow of the CSK jerseys, celebrating despite the un-CSK-ness of the win.\n\nIt began with a bold call to bench two veterans.",
    "datetime": "2025-04-16 10:52:48"
  },
  {
    "name": "News-2025-04-23 21:06:33",
    "owner": "Administrator",
    "creation": "2025-04-13 21:08:29.579030",
    "modified": "2025-04-13 21:08:29.579030",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "The Congress govt has decided to pay 10,000",
    "image": "/files/Telangana-govt-to-provide-Rs-10k-per-acre-as-aid-for-crop-damage.webp",
    "description": "Hyderabad: The Congress govt has decided to pay 10,000 per a ..\n\nRead more at:\nhttp://timesofindia.indiatimes.com/articleshow/120238025.cms?utm_source=contentofinterest&utm_medium=text&utm_campaign=cppst",
    "datetime": "2025-04-23 21:06:33"
  },
  {
    "name": "News-2025-04-15 10:52:48",
    "owner": "Administrator",
    "creation": "2025-04-16 18:02:09.689910",
    "modified": "2025-04-16 18:02:09.689910",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": " China now faces 245% tariffs on US imports",
    "image": "/files/dhoni.webp",
    "description": "The Donald Trump administration has announced that China now faces 245 per cent tariffs on all United States imports after Beijing retaliated in the ongoing trade war that has bruised global markets and investor sentiments. In a fact sheet released late Tuesday evening, the White House said it has decided to impose 245 per cent tariffs on China, heightening the tensions between the two countries.\n\nThe White House statement said that on Liberation Day, US President Donald Trump imposed 10 per cent tariffs on all countries that impose a high tax on the United States. The tariffs were then paused as over 75 countries reached out to the US to negotiate new trade deals.",
    "datetime": "2025-04-15 10:52:48"
  },
]

const fallbackeventsdata = [
  {
    "name": "Event-2025-04-16 21:05:24",
    "owner": "Administrator",
    "creation": "2025-04-13 21:06:27.664294",
    "modified": "2025-04-13 21:06:27.664294",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "Event 22",
    "description": "Lorem ipsum is a dummy text that serves as a placeholder for actual content. It's used to visualize the layout and design elements of a document or website without having to rely on real text. ",
    "datetime": "2025-04-16 21:05:24"
  },
  {
    "name": "Event-2025-04-18 10:36:05",
    "owner": "Administrator",
    "creation": "2025-04-18 10:38:13.654197",
    "modified": "2025-04-18 10:38:13.654197",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "Dance ",
    "description": "This is important for both boys and girls as it  is ",
    "datetime": "2025-04-18 10:36:05"
  },
  {
    "name": "Event-2025-04-18 21:05:24",
    "owner": "Administrator",
    "creation": "2025-04-18 10:33:10.359923",
    "modified": "2025-04-18 10:33:10.359923",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "sports event",
    "description": "This is for the development of sports and fitness of the students.Everybody should take part in this event as iyt is very important for personal fitnes",
    "datetime": "2025-04-18 21:05:24"
  },
  {
    "name": "Event-2025-04-24 21:05:24",
    "owner": "Administrator",
    "creation": "2025-04-18 10:55:33.155811",
    "modified": "2025-04-18 10:55:33.155811",
    "modified_by": "Administrator",
    "docstatus": 0,
    "idx": 0,
    "title": "demo",
    "description": "Every body should take care of himself and at the same time enjoy every moment of his life.",
    "datetime": "2025-04-24 21:05:24"
  }
]

// Fetch and display news
fetch(newsAPI)
  .then(response => response.json())
  .then(data => {
    newsContainer.innerHTML = "";
    const newsItems = data.data || [];
    if (newsItems.length === 0) {
      newsContainer.innerHTML = `<p>No news found.</p>`;
    } else {
      newsItems.forEach(item => {
        newsContainer.insertAdjacentHTML("beforeend", createNewsCard(item));
      });
    }
  })
  .catch(error => {
    console.error("Failed to fetch news, using fallback:", error);

    // Use fallback static data
    newsContainer.innerHTML = "";
    fallbackNewsData.forEach(item => {
      newsContainer.insertAdjacentHTML("beforeend", createNewsCard(item));
    });
  });

// Fetch and display events
fetch(eventsAPI)
  .then(response => response.json())
  .then(data => {
    eventsContainer.innerHTML = "";
    const events = data.data || [];
    if (events.length === 0) {
      eventsContainer.innerHTML = `<p>No events found.</p>`;
    } else {
      events.forEach((item, index) => {
        eventsContainer.insertAdjacentHTML("beforeend", createEventCard(item, index));
      });
    }
  })
  .catch(error => {
    console.error("Failed to fetch events:", error);
    eventsContainer.innerHTML = "";
    fallbackeventsdata.forEach(item => {
      eventsContainer.insertAdjacentHTML("beforeend", createEventCard(item));
    });
  });



// }