import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient()

let events = []

async function get_calendar_events() {
    let response = await frappe_client.get('/get_calendar_events')
    events = response.message.all_events.map(event => ({
        title: event.title,
        start: event.start.replace(' ', 'T'),
        // color: event.color || '#f54458',
        // textColor: event.textColor || 'white',
        url: event.url || "",
        description: event.description
    }))
    // console.log("Calendar events loaded:", ev) // Log after events are set
    render_calendar()
}

get_calendar_events().catch(error => {
    console.error("Error fetching calendar events:", error)
})


function render_calendar(event) {
    const calendarEl = document.getElementById('calendar');


    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // default view on load

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'  // add view buttons here
        },

        // optional: your event data
        events: events,
        eventClick: function(info) {
            info.jsEvent.preventDefault() // Stop default navigation

            if (info.event.url) {
                window.open(info.event.url, '_blank') // ✅ Open in new tab
            }
        },
        eventDidMount: function (info) {
            const eventDate = new Date(info.event.start);
            const today = new Date();

            if (eventDate < today) {
                info.el.style.backgroundColor = '#d9534f';  // Red
                info.el.style.color = 'white';
            } else if (eventDate > today) {
                info.el.style.backgroundColor = '#5cb85c';  // Green
                info.el.style.color = 'white';
            } else {
                info.el.style.backgroundColor = '#0275d8';  // Blue
                info.el.style.color = 'white';
            }

            // info.el.setAttribute('title', info.event.title);
            tippy(info.el, {
                content: info.event.title + '<br>' + (info.event.extendedProps.description || ''),
                allowHTML: true,
                theme: 'light',
                placement: 'top',
            });
        }



    });


    calendar.render();
}
