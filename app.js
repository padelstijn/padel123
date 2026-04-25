let state = {
  lessons: [],
  global: {}
};

let currentLesson = 1;

init();

async function init() {
  await openDB();

  let dbLessons = await getAllLessons();
  let dbGlobal = await getGlobalDB();

  state.global = dbGlobal;

  // FORCE 12 LESSONS
  state.lessons = Array.from({ length: 12 }, (_, i) => {
    let found = dbLessons.find(l => l.id === i + 1);
    return found || { id: i + 1 };
  });

  loadGlobal();
  renderTabs();
  loadLesson(1);
}

/* ---------------- GLOBAL ---------------- */

function loadGlobal() {
  for (let k in state.global) {
    if (document.getElementById(k)) {
      document.getElementById(k).value = state.global[k];
    }
  }
}

function saveGlobal() {
  document.querySelectorAll("#global input").forEach(i => {
    state.global[i.id] = i.value;
  });

  saveGlobalDB(state.global);
}

/* ---------------- LESSON ---------------- */

function loadLesson(id) {
  currentLesson = id;
  let lesson = state.lessons.find(l => l.id === id);

  let form = document.getElementById("form");
  form.innerHTML = "";

  for (let key in lesson) {
    if (key === "id") continue;

    form.innerHTML += `
      <label>${key}</label>
      <textarea id="${key}">${lesson[key] || ""}</textarea>
    `;
  }
}

function saveLesson() {
  let lesson = state.lessons.find(l => l.id === currentLesson);

  document.querySelectorAll("#form textarea").forEach(t => {
    lesson[t.id] = t.value;
  });

  saveLessonDB(lesson);
}

/* ---------------- TABS ---------------- */

function renderTabs() {
  let tabs = document.getElementById("tabs");
  tabs.innerHTML = "";

  state.lessons.forEach(l => {
    tabs.innerHTML += `<button onclick="loadLesson(${l.id});saveLesson()">
      Les ${l.id}
    </button>`;
  });
}

/* ---------------- EXPORT ---------------- */

function exportJSON() {
  saveLesson();

  let data = {
    global: state.global,
    lessen: state.lessons
  };

  download(JSON.stringify(data, null, 2), "padel_v5.json");
}

function exportCSV() {
  saveLesson();

  let keys = new Set();
  state.lessons.forEach(l => Object.keys(l).forEach(k => keys.add(k)));

  let headers = [...keys];

  let rows = state.lessons.map(l =>
    headers.map(h => `"${l[h] || ""}"`).join(";")
  );

  download(headers.join(";") + "\n" + rows.join("\n"), "padel_v5.csv");
}

function exportTXT() {
  saveLesson();

  let txt = state.lessons.map(l =>
    Object.entries(l).map(([k,v]) => `${k}: ${v}`).join("\n")
  ).join("\n\n-----\n\n");

  download(txt, "padel_v5.txt");
}

function download(data, name) {
  let a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data]));
  a.download = name;
  a.click();
}

/* ---------------- IMPORT ---------------- */

function importFile(e) {
  let file = e.target.files[0];

  let reader = new FileReader();

  reader.onload = async (ev) => {
    let data = JSON.parse(ev.target.result);

    state.global = data.global || {};

    state.lessons = Array.from({ length: 12 }, (_, i) => {
      return data.lessen.find(l => l.id === i + 1) || { id: i + 1 };
    });

    renderTabs();
    loadLesson(1);
  };

  reader.readAsText(file);
}
