// =========================
// DATA LOAD
// =========================

let players = JSON.parse(localStorage.getItem("players")) || [];
let lessons = JSON.parse(localStorage.getItem("lessons")) || [];

// =========================
// AI ENGINE (RULE + GPT READY)
// =========================

async function askGPT(prompt) {
  // 🔥 GPT READY (OpenAI API)
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "AI error";
}

// =========================
// 🎾 WHAT TRAIN TOMORROW
// =========================

function whatTrainTomorrow() {
  const focus = analyzeWeakPoints();

  const output = {
    focus: focus,
    drills: generateDrills(focus),
    advies: "Werk 20 min op consistentie + 15 min onder druk"
  };

  document.getElementById("aiOutput").innerText =
    JSON.stringify(output, null, 2);
}

// =========================
// 🧠 SIMPLE AI RULE ENGINE
// =========================

function analyzeWeakPoints() {
  if (players.length === 0) return "geen data";

  let avgBackhand = 0;
  players.forEach(p => avgBackhand += p.backhand || 50);

  avgBackhand = avgBackhand / players.length;

  if (avgBackhand < 60) return "backhand";
  return "volley";
}

// =========================
// 🎯 DRILL GENERATOR
// =========================

function generateDrills(focus) {
  const drills = {
    backhand: ["wall rebound drill", "cross court consistency"],
    volley: ["net reflex drill", "quick hands drill"]
  };

  return drills[focus] || ["free play"];
}

// =========================
// 📅 12 WEEK PLANNER
// =========================

function generatePlan() {
  const plan = [];

  const topics = [
    "forehand basis",
    "backhand stabiliteit",
    "volley control",
    "tactiek",
    "smash",
    "defense",
    "pressure play",
    "match play"
  ];

  for (let i = 0; i < 12; i++) {
    plan.push({
      week: i + 1,
      focus: topics[i % topics.length]
    });
  }

  document.getElementById("planOutput").innerText =
    JSON.stringify(plan, null, 2);
}

// =========================
// 💾 LES OPSLAAN (44 KOL MOGELIJK)
// =========================

function saveLesson() {
  const input = document.getElementById("lessonInput").value;

  try {
    const lesson = JSON.parse(input);

    lessons.push({
      id: Date.now(),
      data: lesson,
      ai_analysis: analyzeLesson(lesson)
    });

    localStorage.setItem("lessons", JSON.stringify(lessons));

    alert("Les opgeslagen");
  } catch (e) {
    alert("Ongeldige JSON");
  }
}

// =========================
// 🧠 LES ANALYSE ENGINE
// =========================

function analyzeLesson(lesson) {
  return {
    feedback: "meer focus op netspel",
    score: Math.floor(Math.random() * 100)
  };
}

// =========================
// 📊 PLAYER LOAD
// =========================

function loadPlayers() {
  const output = players.map(p => `
    Naam: ${p.name}
    Backhand: ${p.backhand}
    Forehand: ${p.forehand}
  `).join("\n----------------\n");

  document.getElementById("playerOutput").innerText = output;
}

// =========================
// INIT DEMO DATA
// =========================

if (players.length === 0) {
  players = [
    { name: "Player 1", backhand: 55, forehand: 70 },
    { name: "Player 2", backhand: 65, forehand: 60 }
  ];
  localStorage.setItem("players", JSON.stringify(players));
}
