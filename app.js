const TOTAL_LESSONS = 12;

let state = {
    global: {},
    defaults: {},
    lessons: []
};

let currentLesson = 1;

/* =========================
   INIT
========================= */

async function init() {
    await loadDataLayer();
    initTabs();
    loadLesson(1);
}

/* =========================
   LOAD DATALAYER
========================= */

async function loadDataLayer() {
    try {
        const res = await fetch("datalayer.json");
        const data = await res.json();

        state.global = data.global || {};
        state.defaults = data.defaults || {};

        state.lessons = data.lessons || generateEmptyLessons();

    } catch (e) {
        console.warn("No datalayer found, using fallback");
        state.lessons = generateEmptyLessons();
    }
}

function generateEmptyLessons() {
    let arr = [];
    for (let i = 1; i <= TOTAL_LESSONS; i++) {
        arr.push({
            id: i,
            Datum: "",
            Lesweek: i,
            Tijd: "09:00",
            AI_output: ""
        });
    }
    return arr;
}

/* =========================
   TABS
========================= */

function initTabs() {
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = "";

    for (let i = 1; i <= TOTAL_LESSONS; i++) {
        let btn = document.createElement("button");
        btn.innerText = "Les " + i;
        btn.onclick = () => switchLesson(i);
        tabs.appendChild(btn);
    }
}

function switchLesson(id) {
    saveLesson();
    currentLesson = id;
    loadLesson(id);
}

/* =========================
   LOAD LESSON
========================= */

function loadLesson(id) {
    const lesson = state.lessons.find(l => l.id === id);

    if (!lesson) return;

    // merge global + lesson + defaults
    const merged = {
        ...state.global,
        ...state.defaults,
        ...lesson
    };

    for (let key in merged) {
        let el = document.getElementById(key);
        if (el) el.value = merged[key] || "";
    }
}

/* =========================
   SAVE LESSON
========================= */

function saveLesson() {
    let lesson = state.lessons.find(l => l.id === currentLesson);
    if (!lesson) return;

    document.querySelectorAll("#form input, #form textarea").forEach(el => {
        lesson[el.id] = el.value;
    });

    localStorage.setItem("padel123_state", JSON.stringify(state));
}

/* =========================
   AI ENGINE
========================= */

function runAI(lessonId) {
    const lesson = state.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    let niveau = state.global.Niveau || "beginner";
    let zwaktes = lesson.Technische_zwaktes || "";

    let slagen = getSlagenByLevel(niveau);

    let gekozenSlag = pickBestSlag(slagen, zwaktes);

    lesson.Slag = gekozenSlag;

    lesson.AI_output =
        `AI: focus op ${gekozenSlag} voor niveau ${niveau}. ` +
        `Gebaseerd op zwaktes: ${zwaktes}`;

    loadLesson(lessonId);
}

function getSlagenByLevel(level) {
    const db = window.padelslagen || {
        beginner: ["forehand", "backhand"],
        intermediate: ["volley_forehand", "volley_backhand"],
        advanced: ["bandeja", "vibora", "smash"]
    };

    return db[level] || db.beginner;
}

function pickBestSlag(slagen, zwaktes) {
    if (!zwaktes) return slagen[0];

    if (zwaktes.includes("achter")) return "backhand";
    if (zwaktes.includes("net")) return "volley_forehand";
    if (zwaktes.includes("kracht")) return "smash";

    return slagen[Math.floor(Math.random() * slagen.length)];
}

/* =========================
   DATE AUTO FILL
========================= */

function autoFillDates(startDate) {
    let start = new Date(startDate);

    state.lessons.forEach((lesson, i) => {
        let d = new Date(start);
        d.setDate(start.getDate() + (i * 7));

        lesson.Datum = d.toISOString().split("T")[0];
    });

    loadLesson(currentLesson);
}

/* =========================
   EXPORT JSON
========================= */

function exportJSON() {
    saveLesson();

    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json"
    });

    download(blob, "padel123_export.json");
}

/* =========================
   IMPORT JSON / TXT
========================= */

function importFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            state = data;

            loadLesson(currentLesson);
        } catch (err) {
            alert("Invalid file format");
        }
    };

    reader.readAsText(file);
}

/* =========================
   CSV EXPORT (FLAT)
========================= */

function exportCSV() {
    saveLesson();

    let headers = Object.keys(state.lessons[0]);

    let rows = state.lessons.map(l =>
        headers.map(h => `"${(l[h] || "").toString().replace(/"/g, '""')}"`).join(";")
    );

    let csv = headers.join(";") + "\n" + rows.join("\n");

    download(new Blob([csv]), "padel123_export.csv");
}

/* =========================
   DOWNLOAD HELPER
========================= */

function download(blob, name) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
}

/* =========================
   GLOBAL UPDATE
========================= */

function updateGlobal() {
    document.querySelectorAll("#global input").forEach(el => {
        state.global[el.id] = el.value;
    });

    saveLesson();
}

/* =========================
   INIT START
========================= */

init();
