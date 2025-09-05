import { FrappeApiClient } from "../services/FrappeApiClient.js";

let frappe_client = new FrappeApiClient();
let baseURL = frappe_client.baseURL;

let currentView = "card"; // Default

const listBtn = document.getElementById("listViewBtn");
const cardBtn = document.getElementById("cardViewBtn");

let page = 1;
const pageSize = 6;
let totalPages = 1;
let currentFilters = {}; // Store current filters for pagination

// ------------------------- VIEW TOGGLE ---------------------------- //
function updateButtonStyles() {
  if (currentView === "card") {
    cardBtn.classList.remove("btn-outline-primary");
    cardBtn.classList.add("btn-primary");

    listBtn.classList.remove("btn-primary");
    listBtn.classList.add("btn-outline-secondary");
  } else {
    listBtn.classList.remove("btn-outline-secondary");
    listBtn.classList.add("btn-primary");

    cardBtn.classList.remove("btn-primary");
    cardBtn.classList.add("btn-outline-primary");
  }
}

listBtn.addEventListener("click", function () {
  listBtn.disabled = true;
  cardBtn.disabled = false;

  let mainDivs = Array.from(document.getElementsByClassName("main1"));
  let portfolioDivs = Array.from(
    document.getElementsByClassName("portfolio-content")
  );

  portfolioDivs.forEach((div) => {
    let children = div.getElementsByClassName("portfolio-info");
    Array.from(children).forEach((child) => {
      child.classList.add("w-100", "px-3");
    });

    div.classList.remove("h-100");
    div.classList.add(
      "d-flex",
      "align-items-center",
      "justify-content-between",
      "pe-5",
      "border",
      "rounded",
      "p-3"
    );
  });

  mainDivs.forEach((div) => {
    div.classList.remove("col-lg-4", "col-md-6");
    div.classList.add("col-12", "col-md-12");
  });

  Array.from(document.getElementsByClassName("img-fluid")).forEach((img) => {
    img.classList.add("col-3");
    img.classList.remove("col-6");
  });

  currentView = "list";
  updateButtonStyles();
});

cardBtn.addEventListener("click", function () {
  cardBtn.disabled = true;
  listBtn.disabled = false;

  let mainDivs = Array.from(document.getElementsByClassName("main1"));
  let portfolioDivs = Array.from(
    document.getElementsByClassName("portfolio-content")
  );

  portfolioDivs.forEach((div) => {
    div.classList.add("h-100");

    Array.from(div.getElementsByClassName("portfolio-info")).forEach(
      (child) => {
        child.classList.remove("w-100", "px-3");
      }
    );

    div.classList.remove(
      "d-flex",
      "align-items-center",
      "justify-content-between",
      "pe-5",
      "border",
      "rounded",
      "p-3"
    );
  });

  Array.from(document.getElementsByClassName("img-fluid")).forEach((img) => {
    img.classList.remove("col-3");
    img.classList.add("col-6");
  });

  mainDivs.forEach((div) => {
    div.classList.add("col-lg-4", "col-md-6");
    div.classList.remove("col-12", "col-md-12");
  });

  currentView = "card";
  updateButtonStyles();
});

// ------------------------- DROPDOWNS ---------------------------- //
const get_dependent_dropdown_lists = async (
  type = null,
  selected_course = null,
  selected_semester = null,
  selected_module = null,
  selected_topic = null,
  selected_chapter = null
) => {
  let args = {
    type,
    selected_course,
    selected_semester,
    selected_module,
    selected_topic,
    selected_chapter,
  };

  try {
    let response = await frappe_client.get("/get_dependent_list", args);
    if (type === "course") set_course_option(response);
    if (type === "semester") set_semester_option(response);
    if (type === "module") set_module_option(response);
    if (type === "topic") set_topic_option(response);
    if (type === "chapter") set_chapter_option(response);
  } catch (error) {
    console.error("Error fetching dependent list:", error);
    showErrorMessage("Failed to load dropdown options. Please try again.");
  }
};

const set_course_option = (response) => {
  const select = document.getElementById("courseSearch");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);
  select.selectedIndex = 0;

  if (response.message) {
    response.message.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.name;
      option.textContent =
        course.name.charAt(0).toUpperCase() + course.name.slice(1);
      select.appendChild(option);
    });
  }

  select.onchange = async function () {
    let course = this.value;
    currentFilters = { course }; // Reset filters
    page = 1; // Reset page
    get_session_list("course", this.value);
    resetDropdown("semesterSearch");
    resetDropdown("moduleSearch");
    resetDropdown("topicSearch");
    resetDropdown("chapterSearch");

    await get_dependent_dropdown_lists("semester", course);
  };
};

const set_semester_option = (response) => {
  const select = document.getElementById("semesterSearch");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);
  select.selectedIndex = 0;

  if (response.message) {
    response.message.forEach((sem) => {
      const option = document.createElement("option");
      option.value = sem.name;
      option.textContent = sem.name.charAt(0).toUpperCase() + sem.name.slice(1);
      select.appendChild(option);
    });
  }

  select.onchange = async function () {
    let semester = this.value;
    let course = document.getElementById("courseSearch").value;

    currentFilters = { course, semester }; // Update filters
    page = 1; // Reset page

    resetDropdown("moduleSearch");
    resetDropdown("topicSearch");
    resetDropdown("chapterSearch");

    get_session_list("semester", this.value);
    await get_dependent_dropdown_lists("module", course, semester);
  };
};

const set_module_option = (response) => {
  const select = document.getElementById("moduleSearch");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);
  select.selectedIndex = 0;

  if (response.message) {
    response.message.forEach((module) => {
      const option = document.createElement("option");
      option.value = module.name;
      option.textContent =
        module.name.charAt(0).toUpperCase() + module.name.slice(1);
      select.appendChild(option);
    });
  }

  select.onchange = async function () {
    let module = this.value;
    let course = document.getElementById("courseSearch").value;
    let semester = document.getElementById("semesterSearch").value;

    currentFilters = { course, semester, module }; // Update filters
    page = 1; // Reset page

    get_session_list("module", this.value);

    resetDropdown("topicSearch");
    resetDropdown("chapterSearch");

    await get_dependent_dropdown_lists("topic", course, semester, module);
  };
};

const set_topic_option = (response) => {
  const select = document.getElementById("topicSearch");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);
  select.selectedIndex = 0;

  if (response.message) {
    response.message.forEach((topic) => {
      const option = document.createElement("option");
      option.value = topic.name;
      option.textContent =
        topic.name.charAt(0).toUpperCase() + topic.name.slice(1);
      select.appendChild(option);
    });
  }

  select.onchange = async function () {
    let topic = this.value;
    let course = document.getElementById("courseSearch").value;
    let semester = document.getElementById("semesterSearch").value;
    let module = document.getElementById("moduleSearch").value;

    currentFilters = { course, semester, module, topic }; // Update filters
    page = 1; // Reset page

    get_session_list("topic", this.value);
    resetDropdown("chapterSearch");

    await get_dependent_dropdown_lists(
      "chapter",
      course,
      semester,
      module,
      topic
    );
  };
};

const set_chapter_option = (response) => {
  const select = document.getElementById("chapterSearch");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);
  select.selectedIndex = 0;

  if (response.message) {
    response.message.forEach((chapter) => {
      const option = document.createElement("option");
      option.value = chapter.name;
      option.textContent =
        chapter.name.charAt(0).toUpperCase() + chapter.name.slice(1);
      select.appendChild(option);
    });
  }

  select.onchange = async function () {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    let course = document.getElementById("courseSearch").value;
    let semester = document.getElementById("semesterSearch").value;
    let module = document.getElementById("moduleSearch").value;
    let topic = document.getElementById("topicSearch").value;

    currentFilters = { course, semester, module, topic, chapter: this.value };
    page = 1; // Reset page

    get_session_list("chapter", this.value);
  };
};

// helper to reset child dropdowns
function resetDropdown(id) {
  const select = document.getElementById(id);
  if (!select) return;

  while (select.options.length > 1) select.remove(1);
  select.selectedIndex = 0;
}

// Helper function to show error messages
function showErrorMessage(message) {
  const SessionList = document.querySelector("#searchResults");
  if (SessionList) {
    SessionList.innerHTML = `
      <div class="alert alert-danger text-center mb-2" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${message}
      </div>`;
  }
}

// ------------------------- SESSION LIST ---------------------------- //
const get_session_list = async (type = null, value = null) => {
  try {
    let args = { page: page, pageSize };

    // If we have current filters and no specific type/value, use the filters
    if (!type && !value && Object.keys(currentFilters).length > 0) {
      args = { ...args, ...currentFilters };
    } else if (type && value) {
      args[type] = value;
    }
    console.log("Fetching sessions with args:", args, currentFilters);
    

    let response = await frappe_client.get("/get_newsession_list", args);

    if (response && response.message) {
      totalPages = Math.ceil(response.message.total_pages) || 1;
      setSessionList(response);
    } else {
      showErrorMessage("No data received from server.");
    }
  } catch (error) {
    console.error("Error fetching session list:", error);
    showErrorMessage("Failed to load sessions. Please try again.");
  }
};

const pagination = `
  <div id="pagination" class="d-flex justify-content-between align-items-center mt-3">
    <button id="prev-btn" class="btn border-0 bg-transparent">
      <i class="bi bi-arrow-left-circle fs-1"></i>
    </button>
    <span id="page-info" class="fw-bold">Page ${page} of ${totalPages}</span>
    <button id="next-btn" class="btn border-0 bg-transparent">
      <i class="bi bi-arrow-right-circle fs-1"></i>
    </button>
  </div>`;

export function setSessionList(response) {
  let SessionList = document.querySelector("#searchResults");
  if (!SessionList) return;

  SessionList.innerHTML = "";

  if (
    !response.message ||
    !response.message.data ||
    response.message.data.length === 0
  ) {
    SessionList.innerHTML = `
      <div class="alert alert-warning text-center mb-2" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i>
        No Sessions are available at the moment. Please check back later!
      </div>`;

    const prevSibling = SessionList.previousElementSibling;
    if (prevSibling) {
      prevSibling.style.display = "none";
    }
    return;
  }

  const docTemplates = {
    PDF: "../assets/img/portfolio/Pdf_img.png",
    Docs: "../assets/img/portfolio/docs_img.png",
    Video: "../assets/img/portfolio/Video_img.png",
    Image: "../assets/img/portfolio/img.jpg",
    PPT: "../assets/img/portfolio/PPT_img.png",
  };

  const default_img =
    "https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg?semt=ais_hybrid&w=740&q=80";

  const filterMap = {
    PDF: "filter-app",
    Docs: "filter-product",
    Video: "filter-branding",
    Image: "filter-books",
    PPT: "filter-books",
  };

  response.message.data.forEach((element) => {
    const imgSrc = docTemplates[element.doc_type] || default_img;
    const filterClass = filterMap[element.doc_type] || "";
    const description = element.description || `${element?.doc_type} File` || "b";
    const title = element.title || element.name || "Untitled";
    const docUrl = `${baseURL}${element.session_doc}`;
    
    let a;
    if(element.content){
      let rawContent = element?.content;
      let row = JSON.parse(rawContent);
      console.log(row.blocks);
      row.blocks.forEach((block) => {
        console.log(block);
        if (block.type === "upload") {
          a = block.data.file_url;
        }
      });
    }
    let b = `${baseURL}${encodeURI(a)}`;
    let b1 = a
      ? ` <div style="cursor: pointer;" onclick=" window.open('${b}')" title="${b}" class="glightbox preview-link">
                <i class="bi bi-eye"></i>
              </div>`
      : ` <div  onclick="window.open('${b}')" title="Not Available" class="glightbox preview-link">
                  <i class="bi bi-slash-circle"></i>
              </div>`;
    

    console.log(b, "url");
    
    const result_card = `
      <div  class="main1 col-lg-4 col-md-6 portfolio-item isotope-item ${filterClass}" >
        <div class="portfolio-content h-100">
          <img src="${imgSrc}" class="img-fluid col-6" alt="${title}" onerror="this.src='${default_img}'">
          <div class="portfolio-info">
            <h6>${title}</h6>
            <div class="d-flex justify-content-between pe-3">
              <p>${description}</p>
              ${b1}
            </div>
          </div>
        </div>
      </div>`;

    const list_card = `
      <div onclick="window.open('${b}')" class="main1 col-12 portfolio-item isotope-item ${filterClass}" style="cursor: pointer;">
        <div class="portfolio-content d-flex align-items-center justify-content-between pe-5 border rounded p-3">
          <img src="${imgSrc}" class="img-fluid col-3" alt="${title}" onerror="this.src='${default_img}'">
          <div class="portfolio-info w-100 px-3">
            <h4>${title}</h4>
            <div class="d-flex justify-content-between pe-3">
              <p>${description}</p>
              ${b1}
            </div>
          </div>
        </div>
      </div>`;

    SessionList.insertAdjacentHTML(
      "beforeend",
      currentView === "list" ? list_card : result_card
    );
  });

  // Add pagination with current page info
  const paginationHtml = `
    <div id="pagination" class="d-flex justify-content-between align-items-center mt-3">
      <button id="prev-btn" class="btn border-0 bg-transparent">
        <i class="bi bi-arrow-left-circle fs-1"></i>
      </button>
      <span id="page-info" class="fw-bold">Page ${page} of ${totalPages}</span>
      <button id="next-btn" class="btn border-0 bg-transparent">
        <i class="bi bi-arrow-right-circle fs-1"></i>
      </button>
    </div>`;

  SessionList.innerHTML += paginationHtml;

  // Remove any existing event listeners to prevent duplicates
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");

  if (nextBtn) {
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    document.getElementById("next-btn").addEventListener("click", () => {
      if (page < totalPages) {
        page += 1;
        console.log("Next clicked, page =", page);
        get_session_list();
      }
    });
  }

  if (prevBtn) {
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    document.getElementById("prev-btn").addEventListener("click", () => {
      if (page > 1) {
        page -= 1;
        console.log("Prev clicked, page =", page);
        get_session_list();
      }
    });
  }

  updateButtonStyles();
  updatePaginationButtons();
}

// ------------------------- TAB CLICK ---------------------------- //
const coursebtn = document.getElementById("course-content-tab");

if (coursebtn) {
  coursebtn.addEventListener("shown.bs.tab", async () => {
    coursebtn.disabled = true;
    try {
      await get_dependent_dropdown_lists("course");
      await get_session_list();
    } catch (error) {
      console.error("Error initializing course tab:", error);
    }
  });

  coursebtn.addEventListener("hidden.bs.tab", () => {
    coursebtn.disabled = false;
  });
}

function updatePaginationButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (!prevBtn || !nextBtn) return; // guard clause

  console.log("Updating pagination buttons", { page, totalPages });

  // Update button states
  if (page <= 1) {
    prevBtn.disabled = true;
    prevBtn.style.opacity = "0.5";
  } else {
    prevBtn.disabled = false;
    prevBtn.style.opacity = "1";
  }

  if (page >= totalPages) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = "0.5";
  } else {
    nextBtn.disabled = false;
    nextBtn.style.opacity = "1";
  }
}

// ------------------------- SEARCH ---------------------------- //
const form = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  let searchTimeout;

  searchInput.addEventListener("input", async function (e) {
    // Clear previous timeout
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      try {
        page = 1; // Reset page for new search
        currentFilters = {}; // Clear filters for global search

        const response = await frappe_client.get("/get_newsession_list", {
          global_search_val: searchInput.value,
          page: page,
          pageSize: pageSize,
        });

        if (response) {
          totalPages = Math.ceil(response.message?.total_pages) || 1;
          setSessionList(response);
        }
      } catch (error) {
        console.error("Search error:", error);
        showErrorMessage("Search failed. Please try again.");
      }
    }, 300);
  });
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  updateButtonStyles();
});
