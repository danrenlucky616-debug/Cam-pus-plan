/* ============================================
   CAMPUSPLAN
   Simple student planning application
   ============================================ */

const STORAGE_KEY = "campusplan_items";

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let selectedDate = getDateString(new Date());


/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("todayDate").textContent =
    formatLongDate(new Date());

  setupNavigation();
  setupForm();
  setupWeekSelector();
  setupNotifications();
  setupICSImport();

  renderEverything();

  requestNotificationPermission();

  setInterval(checkReminders, 30000);

});


/* ============================================
   NAVIGATION
   ============================================ */

function setupNavigation() {

  document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

      const page = button.dataset.page;

      document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active-page");
      });

      document.getElementById(page).classList.add("active-page");

      document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

    });

  });

}


/* ============================================
   MODAL
   ============================================ */

function openModal(type = "activity") {

  const modal = document.getElementById("modal");

  modal.classList.remove("hidden");

  document.getElementById("itemForm").reset();

  document.getElementById("itemType").value = type;

  document.getElementById("itemDate").value =
    selectedDate || getDateString(new Date());

  const select = document.getElementById("typeSelect");

  select.value = type;

  updateModalTitle(type);
}


function closeModal() {

  document.getElementById("modal").classList.add("hidden");

}


function updateModalTitle(type) {

  const titles = {
    class: "Add Class",
    task: "Add Task",
    activity: "Add Activity",
    shopping: "Add Shopping Item"
  };

  document.getElementById("modalTitle").textContent =
    titles[type] || "Add item";

}


/* ============================================
   FORM
   ============================================ */

function setupForm() {

  document
    .getElementById("typeSelect")
    .addEventListener("change", e => {

      updateModalTitle(e.target.value);

      document.getElementById("itemType").value =
        e.target.value;

    });


  document
    .getElementById("itemForm")
    .addEventListener("submit", e => {

      e.preventDefault();

      const title =
        document.getElementById("itemTitle").value.trim();

      const type =
        document.getElementById("typeSelect").value;

      const date =
        document.getElementById("itemDate").value;

      const startTime =
        document.getElementById("startTime").value;

      const endTime =
        document.getElementById("endTime").value;

      const reminder =
        Number(document.getElementById("reminder").value);

      const notes =
        document.getElementById("notes").value.trim();


      if (!title || !date) {

        showToast("Please enter a title and date.");

        return;

      }


      const newItem = {

        id: Date.now().toString(),

        title,

        type,

        date,

        startTime,

        endTime,

        reminder,

        notes,

        completed: false,

        reminded: false

      };


      items.push(newItem);

      saveItems();

      closeModal();

      renderEverything();

      showToast("Saved successfully.");

    });

}


/* ============================================
   STORAGE
   ============================================ */

function saveItems() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  );

}


/* ============================================
   RENDER EVERYTHING
   ============================================ */

function renderEverything() {

  renderToday();

  renderPlanner();

  renderTasks();

  renderShopping();

  updateStats();

}


/* ============================================
   TODAY
   ============================================ */

function renderToday() {

  const container =
    document.getElementById("todayEvents");

  const empty =
    document.getElementById("emptyToday");

  const today =
    getDateString(new Date());

  const todayItems =
    items
      .filter(item => item.date === today)
      .sort(sortByTime);


  container.innerHTML = "";


  if (todayItems.length === 0) {

    empty.style.display = "block";

    return;

  }


  empty.style.display = "none";


  todayItems.forEach(item => {

    container.appendChild(
      createEventCard(item)
    );

  });

}


/* ============================================
   PLANNER
   ============================================ */

function setupWeekSelector() {

  const container =
    document.getElementById("weekSelector");

  container.innerHTML = "";


  const today = new Date();

  const monday = getMonday(today);


  for (let i = 0; i < 7; i++) {

    const date = new Date(monday);

    date.setDate(monday.getDate() + i);


    const dateString =
      getDateString(date);


    const button =
      document.createElement("button");

    button.className = "day-btn";


    if (dateString === selectedDate) {

      button.classList.add("selected");

    }


    button.innerHTML = `
      <strong>${date.toLocaleDateString(
        undefined,
        { weekday: "short" }
      )}</strong>

      <small>${date.getDate()}</small>
    `;


    button.addEventListener("click", () => {

      selectedDate = dateString;

      setupWeekSelector();

      renderPlanner();

    });


    container.appendChild(button);

  }

}


function renderPlanner() {

  const container =
    document.getElementById("plannerList");

  container.innerHTML = "";


  const dayItems =
    items
      .filter(item => item.date === selectedDate)
      .sort(sortByTime);


  if (dayItems.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div>📅</div>
        <h3>Nothing planned</h3>
        <p>Add a class, task or activity.</p>
      </div>
    `;

    return;

  }


  dayItems.forEach(item => {

    container.appendChild(
      createEventCard(item)
    );

  });

}


/* ============================================
   EVENT CARD
   ============================================ */

function createEventCard(item) {

  const card =
    document.createElement("div");

  card.className = "event-card";


  let time = "Anytime";


  if (item.startTime) {

    time = formatTime(item.startTime);

    if (item.endTime) {

      time +=
        " - " + formatTime(item.endTime);

    }

  }


  const typeLabels = {

    class: "📚 Class",

    task: "📝 Task",

    activity: "🎯 Activity",

    shopping: "🛒 Shopping"

  };


  card.innerHTML = `

    <div class="event-time">
      ${time}
    </div>

    <div class="event-info">

      <h3>${escapeHTML(item.title)}</h3>

      <p>
        ${typeLabels[item.type] || "📌 Item"}
        ${item.notes ? " • " + escapeHTML(item.notes) : ""}
      </p>

    </div>

    <button
      class="delete-btn"
      onclick="deleteItem('${item.id}')"
    >
      ×
    </button>

  `;


  return card;

}


/* ============================================
   TASKS
   ============================================ */

function renderTasks() {

  const container =
    document.getElementById("taskList");

  container.innerHTML = "";


  const tasks =
    items
      .filter(item =>
        item.type === "task" ||
        item.type === "activity"
      )
      .sort(sortByDateTime);


  if (tasks.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div>📝</div>
        <h3>No tasks yet</h3>
        <p>Add assignments and activities.</p>
      </div>
    `;

    return;

  }


  tasks.forEach(item => {

    const card =
      document.createElement("div");

    card.className = "task-card";


    card.innerHTML = `

      <input
        class="check-box"
        type="checkbox"
        ${item.completed ? "checked" : ""}
        onchange="toggleComplete('${item.id}')"
      >

      <div class="task-content
        ${item.completed ? "completed" : ""}">

        <h3>${escapeHTML(item.title)}</h3>

        <p>
          ${formatShortDate(item.date)}
          ${item.startTime
            ? " • " + formatTime(item.startTime)
            : ""}
        </p>

      </div>

      <button
        class="delete-btn"
        onclick="deleteItem('${item.id}')"
      >
        ×
      </button>

    `;


    container.appendChild(card);

  });

}


/* ============================================
   SHOPPING
   ============================================ */

function renderShopping() {

  const container =
    document.getElementById("shoppingList");

  container.innerHTML = "";


  const shopping =
    items
      .filter(item => item.type === "shopping")
      .sort(sortByDateTime);


  if (shopping.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div>🛒</div>
        <h3>Nothing on your shopping list</h3>
        <p>Add something you don't want to forget.</p>
      </div>
    `;

    return;

  }


  shopping.forEach(item => {

    const card =
      document.createElement("div");

    card.className = "shopping-card";


    card.innerHTML = `

      <input
        class="check-box"
        type="checkbox"
        ${item.completed ? "checked" : ""}
        onchange="toggleComplete('${item.id}')"
      >

      <span class="${item.completed ? "completed" : ""}">
        ${escapeHTML(item.title)}
      </span>

      <button
        class="delete-btn"
        onclick="deleteItem('${item.id}')"
      >
        ×
      </button>

    `;


    container.appendChild(card);

  });

}


/* ============================================
   ACTIONS
   ============================================ */

function toggleComplete(id) {

  const item =
    items.find(item => item.id === id);

  if (!item) return;

  item.completed = !item.completed;

  saveItems();

  renderEverything();

}


function deleteItem(id) {

  const confirmed =
    confirm("Delete this item?");

  if (!confirmed) return;

  items =
    items.filter(item => item.id !== id);

  saveItems();

  renderEverything();

  showToast("Deleted.");

}


/* ============================================
   STATISTICS
   ============================================ */

function updateStats() {

  const today =
    getDateString(new Date());

  document.getElementById("todayCount").textContent =
    items.filter(item => item.date === today).length;

  document.getElementById("taskCount").textContent =
    items.filter(item =>
      (item.type === "task" ||
       item.type === "activity") &&
      !item.completed
    ).length;

  document.getElementById("shoppingCount").textContent =
    items.filter(item =>
      item.type === "shopping" &&
      !item.completed
    ).length;

}


/* ============================================
   NOTIFICATIONS
   ============================================ */

function setupNotifications() {

  document
    .getElementById("notificationBtn")
    .addEventListener("click", async () => {

      if (!("Notification" in window)) {

        showToast(
          "Notifications aren't supported here."
        );

        return;

      }


      const permission =
        await Notification.requestPermission();


      if (permission === "granted") {

        showToast("Notifications enabled 🔔");

      } else {

        showToast(
          "Notification permission was not granted."
        );

      }

    });

}


function requestNotificationPermission() {

  if (
    "Notification" in window &&
    Notification.permission === "default"
  ) {

    // We intentionally don't immediately request
    // permission on page load.

  }

}


function checkReminders() {

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {

    return;

  }


  const now =
    new Date();


  items.forEach(item => {

    if (
      !item.startTime ||
      item.completed ||
      item.reminded
    ) {

      return;

    }


    const eventTime =
      new Date(
        `${item.date}T${item.startTime}`
      );


    const reminderTime =
      new Date(
        eventTime.getTime() -
        item.reminder * 60000
      );


    const difference =
      Math.abs(
        now.getTime() -
        reminderTime.getTime()
      );


    if (difference <= 30000) {

      new Notification(
        "CampusPlan Reminder",
        {
          body:
            `${item.title} starts ${item.reminder === 0
              ? "now"
              : "soon"}.`
        }
      );


      item.reminded = true;

      saveItems();

    }

  });

}


/* ============================================
   CALENDAR EXPORT
   ============================================ */

function exportCalendar() {

  if (items.length === 0) {

    showToast("Nothing to export.");

    return;

  }


  let ics =
    "BEGIN:VCALENDAR\r\n" +
    "VERSION:2.0\r\n" +
    "PRODID:-//CampusPlan//EN\r\n" +
    "CALSCALE:GREGORIAN\r\n";


  items
    .filter(item =>
      item.startTime &&
      item.date
    )
    .forEach(item => {

      const start =
        item.date.replaceAll("-", "") +
        "T" +
        item.startTime.replace(":", "") +
        "00";


      let end;


      if (item.endTime) {

        end =
          item.date.replaceAll("-", "") +
          "T" +
          item.endTime.replace(":", "") +
          "00";

      } else {

        const startDate =
          new Date(
            `${item.date}T${item.startTime}`
          );

        const endDate =
          new Date(
            startDate.getTime() +
            60 * 60 * 1000
          );

        end =
          formatICSDate(endDate);

      }


      ics +=
        "BEGIN:VEVENT\r\n";

      ics +=
        `UID:${item.id}@campusplan\r\n`;

      ics +=
        `DTSTART:${start}\r\n`;

      ics +=
        `DTEND:${end}\r\n`;

      ics +=
        `SUMMARY:${escapeICS(item.title)}\r\n`;

      if (item.notes) {

        ics +=
          `DESCRIPTION:${escapeICS(item.notes)}\r\n`;

      }

      ics +=
        "END:VEVENT\r\n";

    });


  ics +=
    "END:VCALENDAR\r\n";


  const blob =
    new Blob(
      [ics],
      { type: "text/calendar" }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "CampusPlan-Timetable.ics";

  link.click();


  URL.revokeObjectURL(url);

  showToast("Calendar file created.");

}


/* ============================================
   ICS IMPORT
   ============================================ */

function setupICSImport() {

  document
    .getElementById("icsInput")
    .addEventListener("change", async event => {

      const file =
        event.target.files[0];

      if (!file) return;

      const text =
        await file.text();

      const imported =
        parseICS(text);


      if (imported.length === 0) {

        showToast(
          "No calendar events found."
        );

        return;

      }


      items =
        items.concat(imported);

      saveItems();

      renderEverything();

      showToast(
        `${imported.length} events imported.`
      );

    });

}


function parseICS(text) {

  const events = [];

  const blocks =
    text.split("BEGIN:VEVENT");


  blocks.slice(1).forEach(block => {

    const summary =
      getICSValue(block, "SUMMARY");

    const start =
      getICSValue(block, "DTSTART");

    const end =
      getICSValue(block, "DTEND");

    if (!summary || !start) return;


    const parsedStart =
      parseICSDate(start);

    if (!parsedStart) return;


    const item = {

      id:
        "imported-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2),

      title: summary,

      type: "class",

      date:
        getDateString(parsedStart),

      startTime:
        getTimeString(parsedStart),

      endTime:
        end
          ? getTimeString(parseICSDate(end))
          : "",

      reminder: 0,

      notes: "",

      completed: false,

      reminded: false

    };


    events.push(item);

  });


  return events;

}


function getICSValue(block, key) {

  const regex =
    new RegExp(
      `(?:^|\\r?\\n)${key}(?:;[^:]*)?:(.*)`,
      "i"
    );

  const match =
    block.match(regex);

  return match
    ? match[1].trim()
    : "";

}


function parseICSDate(value) {

  value =
    value.replace("Z", "");


  if (value.length < 15) {

    return null;

  }


  const year =
    Number(value.slice(0, 4));

  const month =
    Number(value.slice(4, 6)) - 1;

  const day =
    Number(value.slice(6, 8));

  const hour =
    Number(value.slice(9, 11));

  const minute =
    Number(value.slice(11, 13));

  const second =
    Number(value.slice(13, 15));


  return new Date(
    year,
    month,
    day,
    hour,
    minute,
    second
  );

}


/* ============================================
   DATE HELPERS
   ============================================ */

function getDateString(date) {

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");


  return `${year}-${month}-${day}`;

}


function getTimeString(date) {

  return (
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );

}


function formatLongDate(date) {

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );

}


function formatShortDate(dateString) {

  const date =
    new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

}


function formatTime(time) {

  const [hour, minute] =
    time.split(":").map(Number);

  const date =
    new Date();

  date.setHours(
    hour,
    minute,
    0,
    0
  );


  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


function sortByTime(a, b) {

  return (
    (a.startTime || "99:99")
      .localeCompare(
        b.startTime || "99:99"
      )
  );

}


function sortByDateTime(a, b) {

  const first =
    `${a.date} ${a.startTime || "23:59"}`;

  const second =
    `${b.date} ${b.startTime || "23:59"}`;

  return first.localeCompare(second);

}


function getMonday(date) {

  const d =
    new Date(date);

  const day =
    d.getDay();

  const difference =
    day === 0 ? -6 : 1 - day;

  d.setDate(
    d.getDate() + difference
  );

  d.setHours(0, 0, 0, 0);

  return d;

}


/* ============================================
   SECURITY / STRING HELPERS
   ============================================ */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeICS(value) {

  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");

}


function formatICSDate(date) {

  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0") +
    "T" +
    String(date.getHours()).padStart(2, "0") +
    String(date.getMinutes()).padStart(2, "0") +
    String(date.getSeconds()).padStart(2, "0")
  );

}


/* ============================================
   TOAST
   ============================================ */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(() => {

    toast.classList.remove("show");

  }, 2500);

}