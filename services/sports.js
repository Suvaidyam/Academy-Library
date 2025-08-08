import { FrappeApiClient } from './FrappeApiClient.js'
const frappeClient = new FrappeApiClient()

const prevBtn = document.getElementById("news-prev-btn")
const nextBtn = document.getElementById("news-next-btn")
let page = 1
let data = []

const fetchURL = async (page) => {
  const url = `https://newsapi.org/v2/everything?q=sport&sortBy=publishedAt&pageSize=2&page=${page}&apiKey=8bf6dadf32f14b818d34c2f1c1d9d1d5`
  try {
    const fetchData = await fetch(url)
    const response = await fetchData.json()
    data = response.articles
  } catch (err) {
    console.log(err)
  }
}

nextBtn.addEventListener("click", async () => {
  page++;
  await renderData(page);
  prevBtn.disabled = false;
  if (!data.length) {
    nextBtn.disabled = true;
    page--;
  }
});

prevBtn.addEventListener("click", async () => {
  if (page > 1) {
    page--;
    await renderData(page);
    prevBtn.disabled = page === 1;
    nextBtn.disabled = false;
  }
});


const showDummyCards = (count = 3) => {
  const container = document.getElementById("container");
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    container.insertAdjacentHTML("beforeend", `
      <div class="card mb-4 shadow-sm border-0 placeholder-glow">
        <div class="row g-0">
          <div class="col-md-4 bg-secondary placeholder" style="height: 200px;"></div>
          <div class="col-md-8">
            <div class="card-body d-flex flex-column justify-content-between h-100">
              <div>
                <h5 class="card-title placeholder col-8"></h5>
                <p class="card-text small placeholder col-10"></p>
              </div>
              <div>
                <p class="card-text">
                  <small class="placeholder col-6"></small>
                </p>
                <div class="pt-4 placeholder col-5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  }
};

const renderData = async (page = 1) => {
  const container = document.getElementById("container");

  showDummyCards(2);
  await fetchURL(page);
  container.innerHTML = '';

  data.forEach(obj => {
    let card = `
      <div class="card mb-4 shadow-sm border-0">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${obj.urlToImage}" class="img-fluid h-100 w-100 object-fit-cover" alt="Image">
          </div>
          <div class="col-md-8">
            <div class="card-body d-flex flex-column justify-content-between h-100">
              <div>
                <h5 class="card-title">${obj.title}</h5>
                <p class="card-text small text-muted">${obj.description || ''}</p>
              </div>
              <div>
                <p class="card-text">
                  <small class="text-muted">
                    Source: ${obj.source.name || 'Unknown'} | Published: ${new Date(obj.publishedAt).toLocaleDateString()}
                  </small>
                </p>
                <a href="${obj.url}" target="_blank" class="btn btn-sm btn-primary">Read Full Article →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", card);
  });
}

document.addEventListener("DOMContentLoaded", renderData)
