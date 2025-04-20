// File: assets/js/news-details.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsName = urlParams.get('name'); // Use 'name' as it’s Frappe's unique key

console.log(newsName)

    if (!newsName) {
        alert("No news item selected.");
        return;
    }

    try {
        //   const res = await fetch(`/api/resource/News/${newsName}`);
        //   if (!res.ok) throw new Error("News not found");

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
                // "image": "/files/Paddy-Grains-2-1-1-456x267-1_V_jpg--816x480-4g.webp",
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
                // "image": "/files/dhoni.webp",
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
                // "image": "/files/Telangana-govt-to-provide-Rs-10k-per-acre-as-aid-for-crop-damage.webp",
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
                // "image": "/files/dhoni.webp",
                "description": "The Donald Trump administration has announced that China now faces 245 per cent tariffs on all United States imports after Beijing retaliated in the ongoing trade war that has bruised global markets and investor sentiments. In a fact sheet released late Tuesday evening, the White House said it has decided to impose 245 per cent tariffs on China, heightening the tensions between the two countries.\n\nThe White House statement said that on Liberation Day, US President Donald Trump imposed 10 per cent tariffs on all countries that impose a high tax on the United States. The tariffs were then paused as over 75 countries reached out to the US to negotiate new trade deals.",
                "datetime": "2025-04-15 10:52:48"
            },
        ]
        let news = fallbackNews.find((item) => item.name == newsName)




        // Replace page content with fetched data
        document.querySelector('.page-title h1').textContent = news.title || "News Details";
        document.querySelector('.page-title p').textContent = news.short_description || "";

        document.querySelector('.title').textContent = news.title;
        document.querySelector('.meta-top time').textContent = new Date(news.date).toDateString();
        document.querySelector('.post-img img').src = news.image ;
        document.querySelector('.content').innerHTML = news.description || '';

    } catch (error) {
        console.error("Error loading news details:", error);
        alert("Failed to load news details. Please try again later.");
    }
});
