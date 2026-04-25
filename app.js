/****************************************************
 * 🧠 PADDEL123 - AI COACH ENGINE v6 FULL APP.JS
 ****************************************************/

const FIELDS = [
  "Trainer","Datum","Lesweek","Tijd","Lesduur","Locatie","Lesgroep","Niveau",
  "Spelers_groep","Spelers_profiel1","Spelers_profiel2","Spelers_profiel3","Spelers_profiel4",
  "Beginsituatie_algemeen","Technische_zwaktes","Tactische_zwaktes","Verwachting_spel",
  "Hoofdspelsituatie","Bedoeling","Slag","Niveaubepalende_factor",
  "KernA_doel","KernA_succescriteria",
  "KernB_doel","KernB_beslissingsregels",
  "Inleiding_doel","Inleiding_oefenvorm","Inleiding_coaching",
  "KernA1_doel","KernA1_oefenvorm","KernA1_coaching",
  "KernA2_doel","KernA2_oefenvorm","KernA2_coaching",
  "KernB_doel_uitwerking","KernB_oefenvorm","KernB_coaching",
  "Slot_spelvorm","Slot_regels",
  "Evaluatie","Differentiatie","Materiaal","Notities_trainer"
];

let state = {
  lessons: [],
  activeLesson: 0
};

/* ---------------- INIT ---------------- */

window.onload = async () => {
  await loadDataLayer();
  initEmptyIfNeeded();
  renderAll();
  runAI();
};

/* ---------------- LOAD DATA ---------------- */

async function loadDataLayer() {
  try {
    let res = await fetch("./datalayer.json");
    let data = await res.json();

    if (data.lessen) {
      state.lessons = data.lessen;
    } else if (data.lessons) {
      state.lessons = Object.values(data.lessons);
    }

  } catch (e) {
    console.log("No datalayer.json found, using empty");
  }
}

/* ---------------- INIT 12 LESSONS ---------------- */

function initEmptyIfNeeded() {
  if (!state.lessons || state.lessons.length === 0) {
    state.lessons = Array.from({ length: 12 }, (_, i) => createEmptyLesson(i + 1));
  }

  // force 12
  while (state.lessons.length < 12) {
    state.lessons.push(createEmptyLesson(state.lessons.length + 1));
  }
}

function createEmptyLesson(id) {
  let obj = { id };

  FIELDS.forEach(f => obj[f] = "");

  return obj;
}

/* ---------------- SAVE ---------------- */

function save() {
  localStorage.setItem("padel_lessons", JSON.stringify(state.lessons));
  runAI();
}

/* ---------------- UPDATE FIELD ---------------- */

function updateField(id, field, value) {
  state.lessons[id][field] = value;
  save();
}

/* ---------------- RENDER ---------------- */

function renderAll() {
  let container = document.getElementById("app");
  container.innerHTML = "";

  state.lessons.forEach((lesson, i) => {
    let div = document.createElement("div");
    div.className = "lesson";

    div.innerHTML = `
      <h2>Les ${i + 1}</h2>
      ${FIELDS.map(f => `
        <label>${f}</label>
        <input value="${lesson[f] || ""}" 
               onchange="updateField(${i}, '${f}', this.value)" />
      `).join("")}
    `;

    container.appendChild(div);
  });
}

/* ---------------- EXPORT JSON ---------------- */

function exportJSON() {
  downloadFile(JSON.stringify({ lessen: state.lessons }, null, 2), "lessen.json", "application/json");
}

/* ---------------- IMPORT JSON ---------------- */

function importJSON(file) {
  let reader = new FileReader();

  reader.onload = function (e) {
    let data = JSON.parse(e.target.result);

    if (data.lessen || data.lessons) {
      state.lessons = data.lessen || Object.values(data.lessons);
      save();
      renderAll();
    }
  };

  reader.readAsText(file);
}

/* ---------------- EXPORT CSV ---------------- */

function exportCSV() {
  let header = ["id", ...FIELDS];

  let rows = state.lessons.map(l =>
    header.map(h => `"${(l[h] || "").replaceAll('"', '""')}"`).join(";")
  );

  let csv = header.join(";") + "\n" + rows.join("\n");

  downloadFile(csv, "lessen.csv", "text/csv");
}

/* ---------------- IMPORT CSV ---------------- */

function importCSV(file) {
  let reader = new FileReader();

  reader.onload = function (e) {
    let lines = e.target.result.split("\n");

    let header = lines[0].split(";");

    let lessons = lines.slice(1).filter(Boolean).map(line => {
      let values = line.split(";");

      let obj = {};

      header.forEach((h, i) => {
        obj[h] = values[i] || "";
      });

      return obj;
    });

    state.lessons = lessons;
    save();
    renderAll();
  };

  reader.readAsText(file);
}

/* ---------------- EXPORT TXT (JSON INSIDE) ---------------- */

function exportTXT() {
  downloadFile(JSON.stringify({ global: {}, lessons: state.lessons }, null, 2),
    "lessen.txt",
    "text/plain"
  );
}

/* ---------------- IMPORT TXT ---------------- */

function importTXT(file) {
  let reader = new FileReader();

  reader.onload = function (e) {
    let data = JSON.parse(e.target.result);

    state.lessons = data.lessons || Object.values(data.lessons || {});
    save();
    renderAll();
  };

  reader.readAsText(file);
}

/* ---------------- DOWNLOAD HELPER ---------------- */

function downloadFile(content, filename, type) {
  let blob = new Blob([content], { type });
  let a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* ===================================================
   🧠 AI COACH ENGINE v6
=================================================== */

function analyzeLesson(lesson) {
  let score = {
    techniek: 50,
    tactiek: 50,
    consistentie: 50,
    positionering: 50
  };

  let text = JSON.stringify(lesson).toLowerCase();

  if (text.includes("forehand")) score.techniek += 10;
  if (text.includes("backhand")) score.techniek += 10;
  if (text.includes("volley")) score.techniek += 15;

  if (text.includes("mikpunt")) score.tactiek += 10;
  if (text.includes("beslissing")) score.tactiek += 10;

  if (text.includes("net")) score.positionering += 15;
  if (text.includes("positie")) score.positionering += 10;

  if (text.includes("zonder fouten")) score.consistentie += 15;

  return score;
}

function buildPlayerProfile() {
  let profile = {
    techniek: 0,
    tactiek: 0,
    consistentie: 0,
    positionering: 0,
    niveau: "beginner"
  };

  let count = 0;

  state.lessons.forEach(l => {
    let s = analyzeLesson(l);

    profile.techniek += s.techniek;
    profile.tactiek += s.tactiek;
    profile.consistentie += s.consistentie;
    profile.positionering += s.positionering;

    count++;
  });

  profile.techniek /= count;
  profile.tactiek /= count;
  profile.consistentie /= count;
  profile.positionering /= count;

  let avg = (profile.techniek + profile.tactiek + profile.consistentie + profile.positionering) / 4;

  if (avg > 80) profile.niveau = "gevorderd";
  else if (avg > 60) profile.niveau = "intermediate";

  return profile;
}

function suggestNextLesson(profile) {
  let focus = [];

  if (profile.techniek < 60) focus.push("techniek");
  if (profile.positionering < 60) focus.push("positionering");
  if (profile.consistentie < 60) focus.push("consistentie");
  if (profile.tactiek < 60) focus.push("tactiek");

  return {
    focus,
    advies: "Volgende les focus: " + (focus.join(", ") || "match play & verfijning")
  };
}

function runAI() {
  let profile = buildPlayerProfile();
  let suggestion = suggestNextLesson(profile);

  console.log("🧠 AI PROFILE:", profile);
  console.log("🎯 SUGGESTION:", suggestion);

  renderAI(profile, suggestion);
}

function renderAI(profile, suggestion) {
  let el = document.getElementById("ai");

  if (!el) return;

  el.innerHTML = `
    <h2>🧠 AI Coach</h2>
    <p>Techniek: ${profile.techniek.toFixed(1)}</p>
    <p>Tactiek: ${profile.tactiek.toFixed(1)}</p>
    <p>Consistentie: ${profile.consistentie.toFixed(1)}</p>
    <p>Positionering: ${profile.positionering.toFixed(1)}</p>
    <h3>Niveau: ${profile.niveau}</h3>
    <h3>🎯 Advies</h3>
    <p>${suggestion.advies}</p>
  `;
}
