/* =========================================================
   CAMPUSPLAN
   Student Planner + Timetable OCR + PWA
   ========================================================= */


/* =========================
   DATA
========================= */

let classes = JSON.parse(
  localStorage.getItem("cp_classes") || "[]"
);

let tasks = JSON.parse(
  localStorage.getItem("cp_tasks") || "[]"
);

let shopping = JSON.parse(
  localStorage.getItem("cp_shopping") || "[]"
);


function saveData() {
  localStorage.setItem(
    "cp_classes",
    JSON.stringify(classes)
  );

  localStorage.setItem(
    "cp_tasks",
    JSON.stringify(tasks)
  );

  localStorage.setItem(
    "cp_shopping",
    JSON.stringify(shopping)
  );
}


/* =========================
   BASIC HELPERS
========================= */

function uid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatTime(time) {
  if (!time) return "";

  const [hour, minute] = time.split(":");

  let h = Number(hour);

  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;

  if (h === 0) {
    h = 12;
  }

  return `${h}:${minute} ${ampm}`;
}


function formatDate(date) {
  if (!date) return "";

  return new Date(
    date + "T00:00:00"
  ).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}


function todayISO() {
  const d = new Date();

  const y = d.getFullYear();

  const m = String(
    d.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    d.getDate()
  ).padStart(2, "0");

  return `${y}-${m}-${day}`;
}


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-btn").forEach(
  button => {

    button.addEventListener("click", () => {

      const page = button.dataset.page;

      document
        .querySelectorAll(".page")
        .forEach(p => {
          p.classList.remove("active");
        });


      const targetPage =
        document.getElementById(page);

      if (targetPage) {
        targetPage.classList.add("active");
      }


      document
        .querySelectorAll(".nav-btn")
        .forEach(btn => {
          btn.classList.remove("active");
        });


      button.classList.add("active");

      renderAll();

    });

  }
);


/* =========================
   MODALS
========================= */

function openModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.classList.remove("hidden");
  }

}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.classList.add("hidden");
  }

}


function openAddModal() {
  openModal("addModal");
}


function openClassModal() {

  const form =
    document.getElementById("classForm");

  if (form) {
    form.reset();
  }

  openModal("classModal");

}


function openTaskModal() {

  const form =
    document.getElementById("taskForm");

  if (form) {
    form.reset();
  }


  const date =
    document.getElementById("taskDate");

  if (date) {
    date.value = todayISO();
  }


  openModal("taskModal");

}


function openShoppingModal() {

  const form =
    document.getElementById("shoppingForm");

  if (form) {
    form.reset();
  }


  const quantity =
    document.getElementById(
      "shoppingQuantity"
    );

  if (quantity) {
    quantity.value = 1;
  }


  openModal("shoppingModal");

}


/* =========================
   ADD CLASS
========================= */

const classForm =
  document.getElementById("classForm");


if (classForm) {

  classForm.addEventListener(
    "submit",
    function(e) {

      e.preventDefault();


      const item = {

        id: uid(),

        course:
          document
            .getElementById("classCourse")
            .value
            .trim(),

        day:
          document
            .getElementById("classDay")
            .value,

        start:
          document
            .getElementById("classStart")
            .value,

        end:
          document
            .getElementById("classEnd")
            .value,

        venue:
          document
            .getElementById("classVenue")
            .value
            .trim()

      };


      classes.push(item);

      saveData();

      closeModal("classModal");

      renderAll();

    }
  );

}


/* =========================
   ADD TASK
========================= */

const taskForm =
  document.getElementById("taskForm");


if (taskForm) {

  taskForm.addEventListener(
    "submit",
    function(e) {

      e.preventDefault();


      const item = {

        id: uid(),

        title:
          document
            .getElementById("taskTitle")
            .value
            .trim(),

        date:
          document
            .getElementById("taskDate")
            .value,

        time:
          document
            .getElementById("taskTime")
            .value,

        reminder:
          Number(
            document
              .getElementById("taskReminder")
              .value
          ),

        completed: false

      };


      tasks.push(item);

      saveData();

      closeModal("taskModal");

      renderAll();

    }
  );

}


/* =========================
   ADD SHOPPING
========================= */

const shoppingForm =
  document.getElementById(
    "shoppingForm"
  );


if (shoppingForm) {

  shoppingForm.addEventListener(
    "submit",
    function(e) {

      e.preventDefault();


      const item = {

        id: uid(),

        title:
          document
            .getElementById(
              "shoppingTitle"
            )
            .value
            .trim(),

        quantity:
          Number(
            document
              .getElementById(
                "shoppingQuantity"
              )
              .value
          ) || 1,

        completed: false

      };


      shopping.push(item);

      saveData();

      closeModal("shoppingModal");

      renderAll();

    }
  );

}


/* =========================
   DELETE FUNCTIONS
========================= */

function deleteClass(id) {

  classes =
    classes.filter(
      item => item.id !== id
    );

  saveData();

  renderAll();

}


function deleteTask(id) {

  tasks =
    tasks.filter(
      item => item.id !== id
    );

  saveData();

  renderAll();

}


function deleteShopping(id) {

  shopping =
    shopping.filter(
      item => item.id !== id
    );

  saveData();

  renderAll();

}


/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {

  const task =
    tasks.find(
      t => t.id === id
    );

  if (!task) return;

  task.completed =
    !task.completed;

  saveData();

  renderAll();

}


/* =========================
   COMPLETE SHOPPING
========================= */

function toggleShopping(id) {

  const item =
    shopping.find(
      i => i.id === id
    );

  if (!item) return;

  item.completed =
    !item.completed;

  saveData();

  renderAll();

}


/* =========================
   DAY CONVERSION
========================= */

function dayNameToNumber(day) {

  const days = {

    Sunday: 0,

    Monday: 1,

    Tuesday: 2,

    Wednesday: 3,

    Thursday: 4,

    Friday: 5,

    Saturday: 6

  };


  return days[day];

}


/* =========================
   TODAY CLASSES
========================= */

function getTodayClasses() {

  const today = new Date();

  const day =
    today.toLocaleDateString(
      undefined,
      {
        weekday: "long"
      }
    );


  return classes
    .filter(
      c => c.day === day
    )
    .sort(
      (a, b) =>
        a.start.localeCompare(
          b.start
        )
    );

}


/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard() {

  const today = new Date();


  const todayTitle =
    document.getElementById(
      "todayTitle"
    );

  const todayDate =
    document.getElementById(
      "todayDate"
    );


  if (todayTitle) {

    todayTitle.textContent =
      today.toLocaleDateString(
        undefined,
        {
          weekday: "long"
        }
      );

  }


  if (todayDate) {

    todayDate.textContent =
      today.toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );

  }


  const todayClasses =
    getTodayClasses();


  const todayTasks =
    tasks.filter(
      task =>
        task.date === todayISO()
    );


  const classCount =
    document.getElementById(
      "classCount"
    );

  const taskCount =
    document.getElementById(
      "taskCount"
    );

  const shoppingCount =
    document.getElementById(
      "shoppingCount"
    );


  if (classCount) {
    classCount.textContent =
      todayClasses.length;
  }


  if (taskCount) {
    taskCount.textContent =
      tasks.filter(
        t => !t.completed
      ).length;
  }


  if (shoppingCount) {
    shoppingCount.textContent =
      shopping.filter(
        s => !s.completed
      ).length;
  }


  const list =
    document.getElementById(
      "todayList"
    );

  if (!list) return;


  let html = "";


  todayClasses.forEach(c => {

    html += `

      <div class="card">

        <div class="card-main">

          <div class="card-title">
            📚 ${escapeHTML(c.course)}
          </div>

          <div class="card-info">
            ${formatTime(c.start)}
            -
            ${formatTime(c.end)}
            ${
              c.venue
                ? " • " +
                  escapeHTML(c.venue)
                : ""
            }
          </div>

          <span class="badge">
            Class
          </span>

        </div>

        <div class="card-actions">

          <button
            class="icon-btn delete-btn"
            onclick="deleteClass('${c.id}')"
          >
            🗑️
          </button>

        </div>

      </div>

    `;

  });


  todayTasks.forEach(task => {

    html += `

      <div class="card">

        <div class="card-main">

          <div
            class="card-title ${
              task.completed
                ? "complete"
                : ""
            }"
          >

            ${
              task.completed
                ? "☑️"
                : "⬜"
            }

            ${escapeHTML(task.title)}

          </div>

          <div class="card-info">

            ${
              task.time
                ? formatTime(task.time)
                : "No time set"
            }

          </div>

          <span class="badge">
            Task
          </span>

        </div>

        <div class="card-actions">

          <button
            class="icon-btn"
            onclick="toggleTask('${task.id}')"
          >
            ✓
          </button>

          <button
            class="icon-btn delete-btn"
            onclick="deleteTask('${task.id}')"
          >
            🗑️
          </button>

        </div>

      </div>

    `;

  });


  if (!html) {

    html = `

      <div class="empty">

        🎉 Nothing planned for today.

        <br><br>

        Enjoy your day or add something!

      </div>

    `;

  }


  list.innerHTML = html;

}


/* =========================
   PLANNER
========================= */

function showPlannerDate() {
  renderPlanner();
}


function renderPlanner() {

  const input =
    document.getElementById(
      "plannerDate"
    );

  if (!input) return;


  if (!input.value) {
    input.value = todayISO();
  }


  const date =
    input.value;


  const selected =
    new Date(
      date + "T00:00:00"
    );


  const day =
    selected.toLocaleDateString(
      undefined,
      {
        weekday: "long"
      }
    );


  const list =
    document.getElementById(
      "plannerList"
    );

  if (!list) return;


  let html = "";


  classes
    .filter(
      c => c.day === day
    )
    .sort(
      (a, b) =>
        a.start.localeCompare(
          b.start
        )
    )
    .forEach(c => {

      html += `

        <div class="card">

          <div class="card-main">

            <div class="card-title">
              📚 ${escapeHTML(c.course)}
            </div>

            <div class="card-info">

              ${day} •

              ${formatTime(c.start)}
              -
              ${formatTime(c.end)}

              ${
                c.venue
                  ? " • " +
                    escapeHTML(c.venue)
                  : ""
              }

            </div>

          </div>

          <button
            class="icon-btn delete-btn"
            onclick="deleteClass('${c.id}')"
          >
            🗑️
          </button>

        </div>

      `;

    });


  tasks
    .filter(
      t => t.date === date
    )
    .forEach(t => {

      html += `

        <div class="card">

          <div class="card-main">

            <div
              class="card-title ${
                t.completed
                  ? "complete"
                  : ""
              }"
            >

              ${
                t.completed
                  ? "☑️"
                  : "⬜"
              }

              ${escapeHTML(t.title)}

            </div>

            <div class="card-info">

              ${
                t.time
                  ? formatTime(t.time)
                  : "No time set"
              }

            </div>

          </div>

          <div class="card-actions">

            <button
              class="icon-btn"
              onclick="toggleTask('${t.id}')"
            >
              ✓
            </button>

            <button
              class="icon-btn delete-btn"
              onclick="deleteTask('${t.id}')"
            >
              🗑️
            </button>

          </div>

        </div>

      `;

    });


  if (!html) {

    html = `

      <div class="empty">

        Nothing scheduled for
        ${formatDate(date)}.

      </div>

    `;

  }


  list.innerHTML = html;

}


const plannerDate =
  document.getElementById(
    "plannerDate"
  );


if (plannerDate) {

  plannerDate.addEventListener(
    "change",
    renderPlanner
  );

}


/* =========================
   TASKS
========================= */

function renderTasks() {

  const list =
    document.getElementById(
      "tasksList"
    );

  if (!list) return;


  if (!tasks.length) {

    list.innerHTML = `

      <div class="empty">
        No tasks yet.
      </div>

    `;

    return;

  }


  const sorted =
    [...tasks].sort(
      (a, b) =>
        (
          a.date + a.time
        ).localeCompare(
          b.date + b.time
        )
    );


  list.innerHTML =
    sorted.map(task => `

      <div class="card">

        <div class="card-main">

          <div
            class="card-title ${
              task.completed
                ? "complete"
                : ""
            }"
          >

            ${
              task.completed
                ? "☑️"
                : "⬜"
            }

            ${escapeHTML(task.title)}

          </div>

          <div class="card-info">

            ${formatDate(task.date)}

            ${
              task.time
                ? " • " +
                  formatTime(task.time)
                : ""
            }

          </div>

        </div>

        <div class="card-actions">

          <button
            class="icon-btn"
            onclick="toggleTask('${task.id}')"
          >
            ✓
          </button>

          <button
            class="icon-btn delete-btn"
            onclick="deleteTask('${task.id}')"
          >
            🗑️
          </button>

        </div>

      </div>

    `).join("");

}


/* =========================
   SHOPPING
========================= */

function renderShopping() {

  const list =
    document.getElementById(
      "shoppingList"
    );

  if (!list) return;


  if (!shopping.length) {

    list.innerHTML = `

      <div class="empty">
        Your shopping list is empty.
      </div>

    `;

    return;

  }


  list.innerHTML =
    shopping.map(item => `

      <div class="card">

        <div class="card-main">

          <div
            class="card-title ${
              item.completed
                ? "complete"
                : ""
            }"
          >

            ${
              item.completed
                ? "☑️"
                : "🛒"
            }

            ${escapeHTML(item.title)}

          </div>

          <div class="card-info">

            Quantity:
            ${item.quantity}

          </div>

        </div>

        <div class="card-actions">

          <button
            class="icon-btn"
            onclick="toggleShopping('${item.id}')"
          >
            ✓
          </button>

          <button
            class="icon-btn delete-btn"
            onclick="deleteShopping('${item.id}')"
          >
            🗑️
          </button>

        </div>

      </div>

    `).join("");

}


/* =========================================================
   TIMETABLE OCR
   ========================================================= */


/* =========================
   UPLOAD IMAGE
========================= */

const timetableImage =
  document.getElementById(
    "timetableImage"
  );


if (timetableImage) {

  timetableImage.addEventListener(
    "change",
    async function(e) {

      const file =
        e.target.files[0];

      if (!file) return;


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select an image."
        );

        return;

      }


      const ocrProgress =
        document.getElementById(
          "ocrProgress"
        );

      const ocrResultBox =
        document.getElementById(
          "ocrResultBox"
        );


      if (ocrProgress) {
        ocrProgress.classList.remove(
          "hidden"
        );
      }


      if (ocrResultBox) {
        ocrResultBox.classList.add(
          "hidden"
        );
      }


      try {

        const status =
          document.getElementById(
            "ocrStatus"
          );


        if (status) {
          status.textContent =
            "Preparing image...";
        }


        if (
          typeof Tesseract ===
          "undefined"
        ) {

          throw new Error(
            "Tesseract OCR library was not loaded."
          );

        }


        const result =
          await Tesseract.recognize(
            file,
            "eng",
            {

              logger: message => {

                if (
                  message.status ===
                  "recognizing text"
                ) {

                  const progress =
                    Math.round(
                      (
                        message.progress ||
                        0
                      ) * 100
                    );


                  if (status) {

                    status.textContent =
                      `Reading timetable... ${progress}%`;

                  }

                } else {

                  if (status) {

                    status.textContent =
                      message.status ||
                      "Processing...";

                  }

                }

              }

            }
          );


        const text =
          result.data.text || "";


        const ocrText =
          document.getElementById(
            "ocrText"
          );


        if (ocrText) {
          ocrText.value = text;
        }


        if (ocrProgress) {
          ocrProgress.classList.add(
            "hidden"
          );
        }


        if (ocrResultBox) {
          ocrResultBox.classList.remove(
            "hidden"
          );
        }


        if (!text.trim()) {

          alert(
            "No readable text was detected. Try a clearer timetable image."
          );

        }

      } catch (error) {

        console.error(
          "OCR error:",
          error
        );


        if (ocrProgress) {
          ocrProgress.classList.add(
            "hidden"
          );
        }


        alert(
          "Could not read the timetable. Try another clearer image."
        );

      }

    }
  );

}


/* =========================
   CLEAR OCR
========================= */

function clearOCR() {

  const ocrText =
    document.getElementById(
      "ocrText"
    );

  const ocrResultBox =
    document.getElementById(
      "ocrResultBox"
    );

  const image =
    document.getElementById(
      "timetableImage"
    );


  if (ocrText) {
    ocrText.value = "";
  }


  if (ocrResultBox) {
    ocrResultBox.classList.add(
      "hidden"
    );
  }


  if (image) {
    image.value = "";
  }

}


/* =========================================================
   TIMETABLE TEXT PROCESSING
   ========================================================= */

function processOCRText() {

  const textarea =
    document.getElementById(
      "ocrText"
    );


  const text =
    textarea
      ? textarea.value.trim()
      : "";


  if (!text) {

    alert(
      "There is no timetable text to process."
    );

    return;

  }


  const detected =
    parseTimetableText(text);


  if (!detected.length) {

    alert(
      "I could not confidently identify classes from the text.\n\n" +
      "You can still add the classes manually using Add Class."
    );

    return;

  }


  let added = 0;


  detected.forEach(item => {

    const exists =
      classes.some(c =>

        c.course.toLowerCase() ===
          item.course.toLowerCase() &&

        c.day === item.day &&

        c.start === item.start

      );


    if (!exists) {

      classes.push({

        id: uid(),

        course: item.course,

        day: item.day,

        start: item.start,

        end: item.end,

        venue: item.venue

      });


      added++;

    }

  });


  saveData();

  renderAll();


  alert(
    `${added} class${
      added === 1 ? "" : "es"
    } added successfully.`
  );


  clearOCR();

}


/* =========================
   OCR PARSER
========================= */

function parseTimetableText(text) {

  const lines =
    text
      .split(/\r?\n/)
      .map(
        line =>
          line.trim()
      )
      .filter(Boolean);


  const results = [];

  let currentDay = null;


  const dayRegex =
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i;


  const timeRegex =
    /\b([0-2]?\d)[.:]([0-5]\d)\s*(?:-|to|–)\s*([0-2]?\d)[.:]([0-5]\d)\b/i;


  for (
    const originalLine
    of lines
  ) {

    const line =
      originalLine
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    const dayMatch =
      line.match(dayRegex);


    if (dayMatch) {

      currentDay =
        dayMatch[1]
          .charAt(0)
          .toUpperCase() +

        dayMatch[1]
          .slice(1)
          .toLowerCase();


      continue;

    }


    if (!currentDay) {
      continue;
    }


    const timeMatch =
      line.match(
        timeRegex
      );


    if (!timeMatch) {
      continue;
    }


    const startHour =
      Number(
        timeMatch[1]
      );

    const startMinute =
      Number(
        timeMatch[2]
      );

    const endHour =
      Number(
        timeMatch[3]
      );

    const endMinute =
      Number(
        timeMatch[4]
      );


    if (
      startHour > 23 ||
      endHour > 23 ||
      startMinute > 59 ||
      endMinute > 59
    ) {
      continue;
    }


    const start =
      `${String(
        startHour
      ).padStart(2, "0")}:` +

      `${String(
        startMinute
      ).padStart(2, "0")}`;


    const end =
      `${String(
        endHour
      ).padStart(2, "0")}:` +

      `${String(
        endMinute
      ).padStart(2, "0")}`;


    let remaining =
      line
        .replace(
          timeMatch[0],
          ""
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    const courseMatch =
      remaining.match(
        /\b([A-Z]{2,5}\s?-?\s?\d{3})\b/i
      );


    if (!courseMatch) {
      continue;
    }


    const course =
      courseMatch[1]
        .replace(
          /\s+/g,
          " "
        )
        .toUpperCase();


    let venue =
      remaining
        .replace(
          courseMatch[0],
          ""
        )
        .replace(
          /[-|,:]/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    if (
      /^(am|pm|class|lecture|lectures|venue|room)$/i
        .test(venue)
    ) {

      venue = "";

    }


    results.push({

      course,

      day: currentDay,

      start,

      end,

      venue

    });

  }


  return results;

}


/* =========================================================
   ICS EXPORT
   ========================================================= */

function icsEscape(value) {

  return String(value || "")
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /;/g,
      "\\;"
    )
    .replace(
      /,/g,
      "\\,"
    )
    .replace(
      /\r?\n/g,
      "\\n"
    );

}


function formatICSDate(
  date,
  time
) {

  const d =
    new Date(
      `${date}T${
        time || "00:00"
      }:00`
    );


  const y =
    d.getFullYear();


  const m =
    String(
      d.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      d.getDate()
    ).padStart(2, "0");


  const h =
    String(
      d.getHours()
    ).padStart(2, "0");


  const min =
    String(
      d.getMinutes()
    ).padStart(2, "0");


  const sec = "00";


  return (
    `${y}${m}${day}` +
    `T${h}${min}${sec}`
  );

}


function nextDateForDay(day) {

  const target =
    dayNameToNumber(day);


  const now =
    new Date();


  const current =
    now.getDay();


  let difference =
    target - current;


  if (difference < 0) {
    difference += 7;
  }


  const date =
    new Date(now);


  date.setDate(
    now.getDate() +
    difference
  );


  return date;

}


function exportTimetableICS() {

  if (!classes.length) {

    alert(
      "You don't have any classes yet."
    );

    return;

  }


  let ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusPlan//Student Planner//EN
CALSCALE:GREGORIAN
`;


  classes.forEach(c => {

    const date =
      nextDateForDay(
        c.day
      );


    const dateString =
      `${date.getFullYear()}-` +

      `${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-` +

      `${String(
        date.getDate()
      ).padStart(2, "0")}`;


    const start =
      formatICSDate(
        dateString,
        c.start
      );


    const end =
      formatICSDate(
        dateString,
        c.end
      );


    ics +=
`BEGIN:VEVENT
UID:${c.id}@campusplan
DTSTART:${start}
DTEND:${end}
SUMMARY:${icsEscape(c.course)}
LOCATION:${icsEscape(c.venue)}
RRULE:FREQ=WEEKLY
END:VEVENT
`;

  });


  ics +=
    "END:VCALENDAR";


  const blob =
    new Blob(
      [ics],
      {
        type:
          "text/calendar;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href = url;

  a.download =
    "campusplan-timetable.ics";


  document.body.appendChild(a);

  a.click();

  a.remove();


  URL.revokeObjectURL(url);

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

const notifyBtn =
  document.getElementById(
    "notifyBtn"
  );


if (notifyBtn) {

  notifyBtn.addEventListener(
    "click",
    async () => {

      if (
        !(
          "Notification" in
          window
        )
      ) {

        alert(
          "This browser does not support notifications."
        );

        return;

      }


      try {

        const permission =
          await Notification.requestPermission();


        if (
          permission ===
          "granted"
        ) {

          notifyBtn.textContent =
            "🔔 Reminders enabled";


          new Notification(
            "CampusPlan",
            {
              body:
                "Reminders are now enabled."
            }
          );

        } else {

          alert(
            "Notifications were not enabled."
          );

        }

      } catch (error) {

        console.error(
          "Notification error:",
          error
        );

        alert(
          "Could not enable notifications."
        );

      }

    }
  );

}


/* =========================
   REMINDER CHECK
========================= */

function checkReminders() {

  if (
    !(
      "Notification" in
      window
    ) ||
    Notification.permission !==
      "granted"
  ) {

    return;

  }


  const now =
    new Date();


  const today =
    todayISO();


  tasks.forEach(task => {

    if (
      task.completed ||
      task.date !== today ||
      !task.time
    ) {

      return;

    }


    const target =
      new Date(
        `${task.date}T${task.time}:00`
      );


    const reminderTime =
      new Date(
        target.getTime() -
        task.reminder * 60000
      );


    const difference =
      Math.abs(
        now.getTime() -
        reminderTime.getTime()
      );


    if (
      difference < 30000
    ) {

      const key =
        `reminded_${task.id}_${task.date}_${task.time}`;


      if (
        !localStorage.getItem(key)
      ) {

        new Notification(
          "CampusPlan reminder",
          {
            body:
              `${task.title} is coming up.`
          }
        );


        localStorage.setItem(
          key,
          "1"
        );

      }

    }

  });

}


setInterval(
  checkReminders,
  30000
);


/* =========================================================
   RENDER TIMETABLE
   ========================================================= */

function renderTimetable() {

  const list =
    document.getElementById(
      "timetableList"
    );


  if (!list) return;


  if (!classes.length) {

    list.innerHTML = `

      <div class="empty">

        No classes yet.

        <br><br>

        Upload your timetable
        or add a class manually.

      </div>

    `;

    return;

  }


  const order = {

    Monday: 1,

    Tuesday: 2,

    Wednesday: 3,

    Thursday: 4,

    Friday: 5,

    Saturday: 6,

    Sunday: 7

  };


  const sorted =
    [...classes].sort(
      (a, b) => {

        if (
          order[a.day] !==
          order[b.day]
        ) {

          return (
            order[a.day] -
            order[b.day]
          );

        }


        return a.start.localeCompare(
          b.start
        );

      }
    );


  list.innerHTML =
    sorted.map(c => `

      <div class="card">

        <div class="card-main">

          <div class="card-title">

            📚 ${escapeHTML(c.course)}

          </div>

          <div class="card-info">

            ${escapeHTML(c.day)}

            •

            ${formatTime(c.start)}

            -

            ${formatTime(c.end)}

            ${
              c.venue
                ? " • " +
                  escapeHTML(c.venue)
                : ""
            }

          </div>

          <span class="badge">

            Weekly class

          </span>

        </div>

        <button
          class="icon-btn delete-btn"
          onclick="deleteClass('${c.id}')"
        >

          🗑️

        </button>

      </div>

    `).join("");

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  renderDashboard();

  renderPlanner();

  renderTasks();

  renderShopping();

  renderTimetable();

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const plannerDate =
      document.getElementById(
        "plannerDate"
      );


    if (plannerDate) {

      plannerDate.value =
        todayISO();

    }


    renderAll();

  }
);


/* =========================================================
   PWA INSTALLATION
   ========================================================= */

let deferredInstallPrompt = null;


/*
  Chrome/compatible browser tells us
  when CampusPlan can be installed.
*/

window.addEventListener(
  "beforeinstallprompt",
  event => {

    // Prevent the automatic browser prompt
    event.preventDefault();


    // Save the installation prompt
    deferredInstallPrompt =
      event;


    // Find the install button
    const installBtn =
      document.getElementById(
        "installBtn"
      );


    // Show our own button
    if (installBtn) {

      installBtn.style.display =
        "inline-block";

    }

  }
);


/* =========================
   INSTALL BUTTON
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const installBtn =
      document.getElementById(
        "installBtn"
      );


    if (!installBtn) {
      return;
    }


    installBtn.addEventListener(
      "click",
      async () => {

        /*
          Sometimes Chrome has not supplied
          the installation prompt yet.
        */

        if (!deferredInstallPrompt) {

          alert(
            "The installation option is not available yet. " +
            "Please wait a few seconds and try again."
          );

          return;

        }


        // Show browser installation dialog
        deferredInstallPrompt.prompt();


        // Wait for user's choice
        const result =
          await deferredInstallPrompt
            .userChoice;


        if (
          result.outcome ===
          "accepted"
        ) {

          console.log(
            "CampusPlan installation accepted."
          );

        } else {

          console.log(
            "CampusPlan installation dismissed."
          );

        }


        /*
          The saved prompt can only
          be used once.
        */

        deferredInstallPrompt =
          null;


        installBtn.style.display =
          "none";

      }
    );

  }
);


/* =========================
   APP INSTALLED
========================= */

window.addEventListener(
  "appinstalled",
  () => {

    console.log(
      "CampusPlan has been installed."
    );


    deferredInstallPrompt =
      null;


    const installBtn =
      document.getElementById(
        "installBtn"
      );


    if (installBtn) {

      installBtn.style.display =
        "none";

    }

  }
);