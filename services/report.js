import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

const frappe_client = new FrappeApiClient();
const baseURL = frappe_client.baseURL;

async function getReport() {
    try {
        const filter = { category: "Report" };
        const response = await frappe_client.get('/get_knowledge_artificates', filter);
        setReport(response);
    } catch (error) {
        console.error('Error fetching report list:', error);
    }
}

function setReport(response) {
    const reportContainer = document.getElementById('reports-list');

    if (!reportContainer) {
        console.error('Report container not found');
        return;
    }

    const reportData = response?.message?.data;

    if (reportData && reportData.length > 0) {
        reportContainer.innerHTML = ''; // Clear existing items

        reportData.forEach(item => {
            const card = `
                <div class="card p-0 m-0 my-2">
                    <a href="${baseURL}${item.attachment}" target="_blank" class="noanchor">
                        <div class="row no-gutters">
                            <div class="col-md-3 align-content-center">
                                <img src="${baseURL}${item.thumbnail_image}" height="120" alt="Image">
                            </div>
                            <div class="col-md-9">
                                <div class="card-body">
                                    <h5 class="card-title">${item.title || "Untitled Report"}</h5>
                                    <p class="card-text">${item.a_short_description_about_the_artifact || "No description available."}</p>
                                    <p class="card-text"><small class="text-body-secondary">Updated by ${item.author || "Unknown Author"}</small></p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>`;
            reportContainer.insertAdjacentHTML("beforeend", card);
        });
    } else {
        reportContainer.innerHTML = '<p>No reports available.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getReport();
});
