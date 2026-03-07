const calendarEl = document.getElementById("calendar");
const semesterSection = document.getElementById("semesterSection");
const subjectSection = document.getElementById("subjectSetup");
const subjectsContainer = document.getElementById("subjectsContainer");
const dayNames = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday"
};

let inapplicableDates = new Set();
let timetableLocked = false;
let semesterLocked = false;
let subjects = [];

/* ---------- CALENDAR ---------- */

function generateCalendar(start, end) {
  calendarEl.innerHTML = "";
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const monthEl = document.createElement("div");
    monthEl.className = "calendar-month";

    const title = document.createElement("div");
    title.className = "calendar-title";
    title.textContent = current.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });

    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement("div"));
    }

    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(current.getFullYear(), current.getMonth(), d);
      const iso = date.toISOString().split("T")[0];

      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = d;

      if (date < start || date > end) {
        dayEl.classList.add("disabled");
      }

      if (inapplicableDates.has(iso)) {
        dayEl.classList.add("selected");
      }

      dayEl.onclick = () => {
        if (semesterLocked) return;
        dayEl.classList.toggle("selected");
        if (inapplicableDates.has(iso)) {
          inapplicableDates.delete(iso);
        } else {
          inapplicableDates.add(iso);
        }
      };

      grid.appendChild(dayEl);
    }

    monthEl.appendChild(title);
    monthEl.appendChild(grid);
    calendarEl.appendChild(monthEl);

    current.setMonth(current.getMonth() + 1);
  }
}

/* ---------- SEMESTER CONFIRM ---------- */

confirmSemester.onclick = () => {
  if (!startDate.value || !endDate.value) {
    showError(semesterSection, "Please select start and end dates.");
    return;
  }

  semesterLocked = true;
  semesterSection.classList.add("locked");
  semesterSection.querySelector(".edit-btn").classList.remove("hidden");
  semesterSection.querySelector(".locked-msg").classList.remove("hidden");

  subjectSection.classList.remove("hidden");
};

/* ---------- DATE WATCH ---------- */

startDate.onchange = endDate.onchange = () => {
  if (!startDate.value || !endDate.value) return;
  generateCalendar(new Date(startDate.value), new Date(endDate.value));
};

/* ---------- SUBJECTS ---------- */

function renderSubjects() {
  subjectsContainer.innerHTML = "";

  subjects.forEach((sub, i) => {
    const row = document.createElement("div");
    row.className = "subject-row";

    row.innerHTML = `
      <div class="subject-input-wrap">
        <input type="text" placeholder="Subject name" value="${sub.full}">
        <button class="remove-subject" title="Remove subject">−</button>
      </div>
      <small class="acronym-hint">
        ${sub.suggested ? `Suggested short name: <strong>${sub.suggested}</strong>` : ""}
      </small>
    `;

    const input = row.querySelector("input");
    const removeBtn = row.querySelector(".remove-subject");
    const hint = row.querySelector(".acronym-hint");

    // ✅ update model WITHOUT re-render
    input.oninput = e => {
      subjects[i].full = e.target.value;
      subjects[i].suggested = suggestAcronym(e.target.value);
      hint.innerHTML = subjects[i].suggested
        ? `Suggested short name: <strong>${subjects[i].suggested}</strong>`
        : "";
    };

    // ❌ remove subject
    removeBtn.onclick = () => {
      subjects.splice(i, 1);
      renderSubjects();
    };

    subjectsContainer.appendChild(row);
  });
}


addSubject.onclick = () => {
  subjects.push({ full: "", suggested: "" });
  renderSubjects();
};

confirmSubjects.onclick = () => {
  if (subjects.some(s => !s.full.trim())) {
    alert("Subject names cannot be empty.");
    return;
  }

  subjectSection.classList.add("locked");
  const editBtn = subjectSection.querySelector(".edit-btn");
if (editBtn) editBtn.classList.remove("hidden");
  document.querySelector("#subjectSetup .locked-msg").classList.remove("hidden");


  initStep2();
};

/* ---------- ACRONYM ---------- */

function suggestAcronym(name) {
  if (!name.trim()) return "";

  const words = name.trim().split(/\s+/);
  let base = words.map(w => w[0]).join("").toUpperCase();

  const used = new Set(
    subjects
      .map(s => s.suggested)
      .filter(Boolean)
  );

  if (!used.has(base)) return base;

  // Try first two letters of first word
  if (words[0].length >= 2) {
    const alt = words[0].slice(0, 2).toUpperCase();
    if (!used.has(alt)) return alt;
  }

  // Fallback: base + number
  let i = 2;
  while (used.has(base + i)) i++;
  return base + i;
}

// ---------- STEP 2 STATE ----------

let activeSubject = null;
let timetable = {};
let classAdjustments = {}; 
// shape:
// {
//   "OS": 0,
//   "CN": 0,
//   "__TOTAL__": 0
// }

const classDays = [];

// ---------- AFTER SUBJECT CONFIRM ----------
// Call this AFTER subjects are confirmed & locked
function initStep2() {
  document.getElementById("timetableSection").classList.remove("hidden");
  document.getElementById("attendanceSection").classList.remove("hidden");
renderAdjustments();
  buildSubjectPills();
  buildDayCards();
}

// ---------- SUBJECT PILLS ----------

function buildSubjectPills() {
  const bar = document.getElementById("subjectPillBar");
  bar.innerHTML = "";

  subjects.forEach(sub => {
    const pill = document.createElement("div");
    pill.className = "subject-pill";

    // Use full name, capped to 8 characters for UI
    const name = sub.full.trim();
    pill.innerText = name.length > 8 ? name.slice(0, 8) + "…" : name;

    pill.title = sub.full; // hover shows full name

    pill.onclick = () => {
      document.querySelectorAll(".subject-pill")
        .forEach(p => p.classList.remove("active"));

      pill.classList.add("active");
      activeSubject = sub.full; // IMPORTANT: store full name internally
    };

    bar.appendChild(pill);
  });
}


// ---------- DAY CARDS ----------

function buildDayCards() {
  const container = document.getElementById("dayCards");
  container.innerHTML = "";

  document.querySelectorAll("[data-day]").forEach(cb => {
    if (!cb.checked) return;

    const dayKey = cb.dataset.day;          // "1", "2", etc
    const dayName = dayNames[dayKey];       // "Monday", "Tuesday"

    if (!timetable[dayName]) timetable[dayName] = [];

    const card = document.createElement("div");
    card.className = "day-card";

    card.innerHTML = `
      <h3>${dayName}</h3>
      <div class="classes"></div>
      <button class="add-to-day">+</button>
    `;

    const classesDiv = card.querySelector(".classes");
    const addBtn = card.querySelector(".add-to-day");

  addBtn.onclick = () => {
  if (timetableLocked) return;
      if (!activeSubject) {
        alert("Select a subject first");
        return;
      }

      timetable[dayName].push(activeSubject);
      renderDayClasses(classesDiv, dayName);
    };

    container.appendChild(card);
  });
}


// ---------- RENDER CLASSES IN DAY ----------

function renderDayClasses(container, day) {
  container.innerHTML = "";

  timetable[day].forEach((sub, i) => {
    const pill = document.createElement("div");
    pill.className = "class-pill";
    pill.innerHTML = `
      ${sub}
      <span class="remove-class">×</span>
    `;

    pill.querySelector(".remove-class").onclick = () => {
      if (timetableLocked) return;
      timetable[day].splice(i, 1);
      renderDayClasses(container, day);
    };

    container.appendChild(pill);
  });
}


confirmTimetable.onclick = () => {
  if (!confirm("Are you sure? This will lock your timetable.")) return;

  timetableLocked = true;
  document.getElementById("timetableSection").classList.add("locked");
  document
  .getElementById("timetableSection")
  .querySelector(".edit-btn")
  .classList.remove("hidden");
  document.querySelector("#timetableSection .locked-msg").classList.remove("hidden");
  document.getElementById("calculateSection").classList.remove("hidden");

};

function getFinalWorkingDates() {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  const allowedWeekdays = new Set(
    [...document.querySelectorAll("[data-day]")]
      .filter(cb => cb.checked)
      .map(cb => Number(cb.dataset.day))
  );

  const dates = [];
  let cur = new Date(start);

  while (cur <= end) {
    const iso = cur.toISOString().split("T")[0];
    const weekday = cur.getDay();

    if (
      allowedWeekdays.has(weekday) &&
      !inapplicableDates.has(iso)
    ) {
      dates.push(new Date(cur));
    }

    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

function renderAdjustments() {
  const container = document.getElementById("adjustmentsContainer");
  container.innerHTML = "";

  const totalToggleActive = totalToggle.checked;

  subjects.forEach(sub => {
    if (totalToggleActive) return;

    if (!(sub.full in classAdjustments)) {
      classAdjustments[sub.full] = 0;
    }

    const row = document.createElement("div");
    row.className = "adjust-row";

    row.innerHTML = `
      <strong>${sub.full}</strong>
      <div class="adjust-controls">
        <button data-delta="-1">−</button>
        <span>${classAdjustments[sub.full]}</span>
        <button data-delta="1">+</button>
        <button class="reset">Reset</button>
      </div>
    `;

    const valueEl = row.querySelector("span");

    row.querySelectorAll("button[data-delta]").forEach(btn => {
      btn.onclick = () => {
        classAdjustments[sub.full] += Number(btn.dataset.delta);
        valueEl.textContent = classAdjustments[sub.full];
      };
    });

    row.querySelector(".reset").onclick = () => {
      classAdjustments[sub.full] = 0;
      valueEl.textContent = "0";
    };

    container.appendChild(row);
  });

  // TOTAL ONLY
  if (totalToggle.checked) {
    if (!("__TOTAL__" in classAdjustments)) {
      classAdjustments.__TOTAL__ = 0;
    }

    const row = document.createElement("div");
    row.className = "adjust-row";

    row.innerHTML = `
      <strong>Total only</strong>
      <div class="adjust-controls">
        <button data-delta="-1">−</button>
        <span>${classAdjustments.__TOTAL__}</span>
        <button data-delta="1">+</button>
        <button class="reset">Reset</button>
      </div>
    `;

    const valueEl = row.querySelector("span");

    row.querySelectorAll("button[data-delta]").forEach(btn => {
      btn.onclick = () => {
        classAdjustments.__TOTAL__ += Number(btn.dataset.delta);
        valueEl.textContent = classAdjustments.__TOTAL__;
      };
    });

    row.querySelector(".reset").onclick = () => {
      classAdjustments.__TOTAL__ = 0;
      valueEl.textContent = "0";
    };

    container.appendChild(row);
  }
}

calculateAttendance.onclick = () => {
  const desired = +desiredAttendance.value;
  const required = +requiredAttendance.value;

  const finalDates = getFinalWorkingDates(); // ✅ FIX

  const subjectCounts = {};
  let totalClasses = 0;

  finalDates.forEach(date => {
    const day = date.toLocaleString("default", { weekday: "long" });
    const classesToday = timetable[day] || [];

    totalClasses += classesToday.length;

    classesToday.forEach(sub => {
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });
  });

  const reportGrid = document.getElementById("reportGrid");
  reportGrid.innerHTML = "";

  if (perSubjectToggle.checked) {
    Object.entries(subjectCounts).forEach(([sub, count]) => {
      const adj = classAdjustments[sub] || 0;
const finalCount = Math.max(0, count + adj);

reportGrid.appendChild(makeReportCard(
  sub,
  finalCount,
  Math.ceil(finalCount * required / 100),
  Math.ceil(finalCount * desired / 100),
  count,
  adj
));

    });
  }

  if (totalToggle.checked) {
    const totalAdj = classAdjustments.__TOTAL__ || 0;
const finalTotal = Math.max(0, totalClasses + totalAdj);

reportGrid.appendChild(makeReportCard(
  "Total",
  finalTotal,
  Math.ceil(finalTotal * required / 100),
  Math.ceil(finalTotal * desired / 100),
  totalClasses,
  totalAdj
));
  }

  document.getElementById("reportSection").classList.remove("hidden");
};

function makeReportCard(title, total, req, des, base = null, adj = null) {
  const delta =
    base !== null && adj !== null
      ? ` <small>(${base} ${adj >= 0 ? "+" : ""}${adj})</small>`
      : "";

  const div = document.createElement("div");
  div.className = "report-card";
  div.innerHTML = `
    <h3>${title}${delta}</h3>
    <p>Total classes: <strong>${total}</strong></p>
    <p>Required: <strong>${req}</strong></p>
    <p>Desired: <strong>${des}</strong></p>
  `;
  return div;
}

function saveState() {
  localStorage.setItem("attendanceApp", JSON.stringify({
    startDate: startDate.value,
    endDate: endDate.value,
    inapplicableDates: [...inapplicableDates],
    subjects,
    classAdjustments,
    timetable
    
  }));
}

function loadState() {
  classAdjustments = data.classAdjustments || {};
  const data = JSON.parse(localStorage.getItem("attendanceApp"));
  if (!data) return;

  startDate.value = data.startDate;
  endDate.value = data.endDate;
  inapplicableDates = new Set(data.inapplicableDates);
  subjects = data.subjects;
  timetable = data.timetable || {};

  generateCalendar(new Date(startDate.value), new Date(endDate.value));
  renderSubjects();
  initStep2();
}
loadState();
function unlockSemester() {
  const ok = confirm(
    "Editing semester dates will reset subjects, timetable, and attendance.\n\nDo you want to continue?"
  );
  if (!ok) return;

  semesterLocked = false;
  semesterSection.classList.remove("locked");
  semesterSection.querySelector(".locked-msg").classList.add("hidden");
  semesterSection.querySelector(".edit-btn").classList.add("hidden");

  resetSubjects();
  resetTimetable();
  resetReport();
}





function unlockSubjects() {
  const ok = confirm(
    "Editing subjects will reset your timetable and attendance.\n\nDo you want to continue?"
  );
  if (!ok) return;

  subjectSection.classList.remove("locked");
  subjectSection.querySelector(".locked-msg").classList.add("hidden");
  subjectSection.querySelector(".edit-btn").classList.add("hidden");

  resetTimetable();
  resetReport();
}

function unlockTimetable() {
  const ok = confirm(
    "Editing the timetable will reset attendance calculations.\n\nDo you want to continue?"
  );
  if (!ok) return;

  timetableLocked = false;
  const section = document.getElementById("timetableSection");
  section.classList.remove("locked");
  section.querySelector(".locked-msg").classList.add("hidden");
  section.querySelector(".edit-btn").classList.add("hidden");

  resetReport();
}


function resetSubjects() {
  subjects = [];
  subjectsContainer.innerHTML = "";
  subjectSection.classList.remove("locked");
  subjectSection.classList.add("hidden");
  subjectSection.querySelector(".edit-btn").classList.add("hidden");
}

function resetTimetable() {
  timetable = {};
  activeSubject = null;
  document.getElementById("dayCards").innerHTML = "";
  document.getElementById("subjectPillBar").innerHTML = "";
  document.getElementById("timetableSection").classList.add("hidden");
  document.getElementById("timetableSection").classList.remove("locked");
}

function resetReport() {
  document.getElementById("reportSection").classList.add("hidden");
  document.getElementById("reportGrid").innerHTML = "";
  document.getElementById("calculateSection").classList.add("hidden");
}
