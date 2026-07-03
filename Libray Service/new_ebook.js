import { FrappeApiClient } from "../services/FrappeApiClient.js";

const frappe_client = new FrappeApiClient();
let ebookList = [];
const baseURL = frappe_client.baseURL;
const DEFAULT_THUMBNAIL = "/assets/img/new_ebook_thumnail_img.jpeg";

const titleInput = document.getElementById("ebook-title");
const subtitleInput = document.getElementById("ebook-subtitle");
const typeInput = document.getElementById("ebook-type");
const themeInput = document.getElementById("ebook-theme");
const categoryDropdown = document.getElementById("ebook-category-dropdown");
const subcategoryDropdown = document.getElementById("ebook-subcategory-dropdown");
const authorInput = document.getElementById("ebook-author");
const publisherInput = document.getElementById("ebook-publisher");
const isbnInput = document.getElementById("ebook-isbn");
const keywordsInput = document.getElementById("ebook-keywords");
const clearBtn = document.getElementById("ebook-clearbtn");

const prevBtn = document.getElementById("ebook-prev-btn");
const nextBtn = document.getElementById("ebook-next-btn");
const pageInfo = document.getElementById("ebook-page-info");
const ebookBody = document.getElementById("ebook-body");

const rowPerPage = 4;
let currentPage = 1;
let totalPages = 1;

// Note: the /get_ebooks_lists API currently only accepts
// book_title, sub_title, theme, book_category, book_subcategory, author, isbn, publisher.
// "type" and "book_keywords" have no matching field on the backend yet, so they're sent
// but have no effect until those fields are added to the backend's `fields` list.
let activeFilters = {
  book_title: "",
  sub_title: "",
  type: "",
  theme: "",
  book_category: "",
  book_subcategory: "",
  author: "",
  publisher: "",
  isbn: "",
  book_keywords: "",
};

const isValidHttpUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const debounce = (fn, delay = 350) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const updatePaginationButtons = () => {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
};

const buildParams = (page) => {
  const params = { page, rowPerPage };
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  return params;
};

const renderEbooks = (rows) => {
  ebookBody.innerHTML = "";

  if (!rows.length) {
    ebookBody.innerHTML = `
      <div class="col-12">
        <div class="ebook-empty-state text-center">
          <i class="bi bi-journal-x"></i>
          <h5>No E-Books Found</h5>
          <p>We couldn't find any e-books matching your filters.<br>Try adjusting or clearing them.</p>
          <button type="button" id="ebook-empty-clear-btn" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-x-circle"></i> Clear Filters
          </button>
        </div>
      </div>`;
    document.getElementById("ebook-empty-clear-btn")?.addEventListener("click", () => clearBtn?.click());
    return;
  }

  rows.forEach((book) => {
    const badges = [book.theme, book.book_category, book.book_subcategory]
      .filter(Boolean)
      .map((value) => `<span>${value}</span>`)
      .join("");

    const thumbnail = book.book_thumbnail_image ? `${baseURL}${book.book_thumbnail_image}` : DEFAULT_THUMBNAIL;
    const hasValidLink = isValidHttpUrl(book.resource_link);
    const resourceLink = hasValidLink ? book.resource_link : "#";
    const linkTarget = hasValidLink ? `target="_blank" rel="noopener noreferrer"` : "";

    const card = `
      <div class="col-md-6">
        <div class="ebook-card">
          <a href="${resourceLink}" ${linkTarget}>
            <img src="${thumbnail}" alt="${book.book_title || "E-Book"}" class="ebook-thumbnail"
                 onerror="this.onerror=null;this.src='${DEFAULT_THUMBNAIL}'">
          </a>
          <h5 title="${book.book_title || "Untitled"}">${book.book_title || "Untitled"}</h5>
          ${book.sub_title ? `<div class="ebook-subtitle">${book.sub_title}</div>` : ""}
          ${badges ? `<div class="ebook-badges">${badges}</div>` : ""}
          <div class="ebook-meta">
            ${book.author ? `<div class="ebook-author" title="${book.author}"><i class="bi bi-person-fill"></i> ${book.author}</div>` : ""}
            ${book.publisher ? `<div class="ebook-publisher" title="${book.publisher}"><i class="bi bi-building"></i> ${book.publisher}</div>` : ""}
            ${book.isbn ? `<div class="ebook-isbn" title="${book.isbn}"><i class="bi bi-upc-scan"></i> ISBN: ${book.isbn}</div>` : ""}
          </div>
        </div>
      </div>`;
    ebookBody.insertAdjacentHTML("beforeend", card);
  });
};

const getEbookList = async (page = 1) => {
  try {
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const response = await frappe_client.get("/get_ebooks_lists", buildParams(page));
    const message = response?.message || {};
    const rows = message.data || [];

    renderEbooks(rows);

    currentPage = message.page || page;
    totalPages = Math.max(1, Math.ceil((message.totalRow || 0) / (message.rowPerPage || rowPerPage)));
  } catch (error) {
    console.error("Error fetching e-book list:", error);
  } finally {
    updatePaginationButtons();
  }
};

const populateSelect = async (selectEl, field) => {
  if (!selectEl) return;

  try {
    const response = await frappe_client.get("/get_doctype_list", {
      doctype: "Knowledge Artifact",
      fields: [field],
      or_filters: JSON.stringify([{ category: "E-Book" }]),
    });

    const values = [...new Set((response.message || []).map((item) => item[field]).filter(Boolean))].sort();
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectEl.appendChild(option);
    });
  } catch (error) {
    console.error(`Error loading ${field} options:`, error);
  }
};

const bindTextFilter = (field, inputEl) => {
  inputEl?.addEventListener(
    "input",
    debounce(() => {
      activeFilters[field] = inputEl.value.trim();
      getEbookList(1);
    })
  );
};

bindTextFilter("book_title", titleInput);
bindTextFilter("sub_title", subtitleInput);
bindTextFilter("type", typeInput);
bindTextFilter("theme", themeInput);
bindTextFilter("author", authorInput);
bindTextFilter("publisher", publisherInput);
bindTextFilter("isbn", isbnInput);
bindTextFilter("book_keywords", keywordsInput);

categoryDropdown?.addEventListener("change", () => {
  activeFilters.book_category = categoryDropdown.value;
  getEbookList(1);
});

subcategoryDropdown?.addEventListener("change", () => {
  activeFilters.book_subcategory = subcategoryDropdown.value;
  getEbookList(1);
});

prevBtn?.addEventListener("click", () => {
  if (currentPage > 1) getEbookList(currentPage - 1);
});

nextBtn?.addEventListener("click", () => {
  if (currentPage < totalPages) getEbookList(currentPage + 1);
});

clearBtn?.addEventListener("click", () => {
  activeFilters = {
    book_title: "",
    sub_title: "",
    type: "",
    theme: "",
    book_category: "",
    book_subcategory: "",
    author: "",
    publisher: "",
    isbn: "",
    book_keywords: "",
  };

  if (titleInput) titleInput.value = "";
  if (subtitleInput) subtitleInput.value = "";
  if (typeInput) typeInput.value = "";
  if (themeInput) themeInput.value = "";
  if (categoryDropdown) categoryDropdown.selectedIndex = 0;
  if (subcategoryDropdown) subcategoryDropdown.selectedIndex = 0;
  if (authorInput) authorInput.value = "";
  if (publisherInput) publisherInput.value = "";
  if (isbnInput) isbnInput.value = "";
  if (keywordsInput) keywordsInput.value = "";

  getEbookList(1);
});

document.addEventListener("DOMContentLoaded", () => {
  getEbookList(1);
  populateSelect(categoryDropdown, "book_category");
  populateSelect(subcategoryDropdown, "book_subcategory");
});
