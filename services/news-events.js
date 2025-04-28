// Select containers
const newsContainer = document.getElementById('news-container');

// Get the template card
const templateCard = newsContainer.querySelector('.newsCard');

// Clear the container (but keep the row structure)
newsContainer.querySelector('.row').innerHTML = '';

const fallbackNews = [
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

async function fetchNews() {
  try {
    const response = await fetch("https://erp-ryss.ap.gov.in/api/resource/News?fields=[\"name\",\"title\",\"image\",\"description\",\"datetime\"]");
    if (!response.ok) throw new Error('API fetch failed');
    const json = await response.json();
    const newsData = json.data || [];
    loadNews(newsData);
  } catch (error) {
    console.warn('Using fallback news data due to error:', error);
    loadNews(fallbackNews);
  }
}

function loadNews(newsItems) {
  newsItems.forEach(item => {
    const clone = templateCard.cloneNode(true);
    clone.classList.remove('d-none');

    // Assuming 'item' is the current news object
    const titleLink = clone.querySelector('.news-click'); // This should target the anchor inside the news card


    if (titleLink && item.name) {
      titleLink.addEventListener("click",()=>{
        window.location.href = `news-details?name=${encodeURIComponent(item.name)}`;
        

        console.log(item.name,"#####################################################################################")
      })
    }





    const img = clone.querySelector('.image-card');
    img.src = item.image;
    img.alt = item.title;

    const title = clone.querySelector('.description');
    title.textContent = item.title;

    const text = clone.querySelector('.card-text');
    text.textContent = item.description;

    const time = clone.querySelector('.post-date');
    time.setAttribute('datetime', item.datetime);
    const dateObj = new Date(item.datetime);
    time.textContent = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    newsContainer.appendChild(clone);
  });
}

fetchNews();


const eventsContainer = document.getElementById('events-container');
const eventsCard = eventsContainer.querySelector('.eventscard');

eventsContainer.querySelector('.row').innerHTML = '';

const fallbackEvents = [
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
    "description": "This is important for both boys and girls as it  is very important for fitness and all the things",
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


function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} <span>${year}</span>`;
}

function loadEvents(eventsItems) {
  const row = eventsContainer.querySelector('.row');

  eventsItems.forEach((item, index) => {
    const clone = eventsCard.cloneNode(true);
    clone.classList.remove('d-none');

    clone.setAttribute('data-aos-delay', `${100 + index * 100}`);

    const dateElement = clone.querySelector('.date');
    dateElement.innerHTML = formatDate(item.datetime);

    const titleLink = clone.querySelector('.title a');
    titleLink.textContent = item.title;

    const desc = clone.querySelector('.description');
    desc.textContent = item.description;

    row.appendChild(clone);
  });
}

async function fetchEvents() {
  try {
    const response = await fetch("https://erp-ryss.ap.gov.in/api/resource/Events?fields=[\"name\",\"title\",\"description\",\"datetime\"]");
    if (!response.ok) throw new Error('API fetch failed');
    const json = await response.json();
    const eventsData = json.data || [];
    loadEvents(eventsData);
  } catch (error) {
    console.warn('Using fallback events data due to error:', error);
    loadEvents(fallbackEvents);
  }
}

fetchEvents();






