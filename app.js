const TOTAL_LESSONS = 12;
let currentLesson = 1;

// Alle velden (breid uit naar jouw 44!)
const fields = [
    "Trainer","Datum","Niveau",
    "Spelers_profiel1","Spelers_profiel2","Spelers_profiel3","Spelers_profiel4",
    "Spelers_groep"
];

// Tabs maken
function initTabs() {
    const tabsDiv = document.getElementById("tabs");
    for (let i = 1; i <= TOTAL_LESSONS; i++) {
        let btn = document.createElement("button");
        btn.innerText = "Les " + i;
        btn.onclick = () => switchLesson(i);
        tabsDiv.appendChild(btn);
    }
}

// Wissel van les
function switchLesson(nr) {
    saveLesson();
    currentLesson = nr;
    loadLesson();
}

// Opslaan (localStorage)
function saveLesson() {
    let data = {};
    fields.forEach(f => {
        data[f] = document.getElementById(f).value;
    });
    localStorage.setItem("les_" + currentLesson, JSON.stringify(data));
}

// Laden
function loadLesson() {
    let data = JSON.parse(localStorage.getItem("les_" + currentLesson));
    fields.forEach(f => {
        document.getElementById(f).value = data ? (data[f] || "") : "";
    });
}

// Export .txt
function exportLesson() {
    saveLesson();

    let data = localStorage.getItem("les_" + currentLesson);
    let blob = new Blob([data], { type: "text/plain" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `les_${currentLesson}.txt`;
    a.click();
}

// Import .txt
function importLesson(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let data = JSON.parse(e.target.result);
        localStorage.setItem("les_" + currentLesson, JSON.stringify(data));
        loadLesson();
    };
    reader.readAsText(file);
}

// Start
initTabs();
loadLesson();
