import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient()

let ev = []

async function get_calendar_events() {
    let response = await frappe_client.get('/get_calendar_events')
    ev = response.message.all_events.map(event => ({
        title: event.title,
        start: event.start.replace(' ', 'T'),
        // color: event.color || '#f54458',
        // textColor: event.textColor || 'white',
        url: event.url || "",
        description: event.description
    }))
    console.log("Calendar events loaded:", ev, events) // Log after events are set
    render_calendar()
}

get_calendar_events().catch(error => {
    console.error("Error fetching calendar events:", error)
})





let events = [
    {
        title: 'Team Meeting',
        start: '2025-08-03T10:30:00',
        end: '2025-08-03T11:00:00',
        url: null
    },
    {
        title: 'Doctor Appointment',
        start: '2025-08-05T14:00:00',
        color: '#f54458', // event background
        textColor: 'white', // event text color s
        url: 'https://www.google.com',
        description: "this is my description"
    },
    {
        title: 'Event 2', start: '2025-08-12',
        color: '#f54458', // event background
        textColor: 'white', // event text color ,
        className: 'urgent-event'
    }
]
document.addEventListener('DOMContentLoaded', function () {

});

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
        events: ev,
        eventDidMount: function (info) {
            const eventDate = new Date(info.event.start);
            const today = new Date();


            // eventDate.setHours(0, 0, 0, 0);
            // today.setHours(0, 0, 0, 0);

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
