const TOTAL_LESSONS = 12;
let currentLesson = 1;

// Velden (later uitbreidbaar naar 44)
const fields = [
    "Trainer","Datum","Niveau",
    "Spelers_profiel1","Spelers_profiel2","Spelers_profiel3","Spelers_profiel4",
    "Spelers_groep",
    "Slag","Bedoeling","KernA_doel","KernB_doel"
];

// 📊 Slagen database
let slagDatabase = {};

// -------------------- TABS --------------------
function initTabs() {
    const tabsDiv = document.getElementById("tabs");

    for (let i = 1; i <= TOTAL_LESSONS; i++) {
        let btn = document.createElement("button");
        btn.innerText = "Les " + i;
        btn.onclick = () => switchLesson(i);
        tabsDiv.appendChild(btn);
    }
}

function switchLesson(nr) {
    saveLesson();
    currentLesson = nr;
    loadLesson();
}

// -------------------- SAVE / LOAD --------------------
function saveLesson() {
    let data = {};
    fields.forEach(f => {
        let el = document.getElementById(f);
        if (el) data[f] = el.value;
    });

    localStorage.setItem("les_" + currentLesson, JSON.stringify(data));
}

function loadLesson() {
    let data = JSON.parse(localStorage.getItem("les_" + currentLesson));

    fields.forEach(f => {
        let el = document.getElementById(f);
        if (el) el.value = data ? (data[f] || "") : "";
    });
}

// -------------------- EXPORT / IMPORT --------------------
function exportLesson() {
    saveLesson();

    let data = localStorage.getItem("les_" + currentLesson);
    let blob = new Blob([data], { type: "text/plain" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `les_${currentLesson}.txt`;
    a.click();
}

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

// -------------------- SLAGEN (GITHUB) --------------------
async function loadSlagen() {
    const url = "https://raw.githubusercontent.com/padelstijn/padel123/main/padelslagen.json";

    const response = await fetch(url);
    slagDatabase = await response.json();

    populateSlagDropdown();
}

function populateSlagDropdown() {
    const select = document.getElementById("slagSelect");

    select.innerHTML = '<option value="">-- kies slag --</option>';

    Object.keys(slagDatabase).forEach(slag => {
        let option = document.createElement("option");
        option.value = slag;
        option.textContent = slag;
        select.appendChild(option);
    });
}

function fillSlagData() {
    const slag = document.getElementById("slagSelect").value;
    if (!slagDatabase[slag]) return;

    const data = slagDatabase[slag];

    document.getElementById("Slag").value = slag;
    document.getElementById("Bedoeling").value = data.doel || "";
    document.getElementById("KernB_doel").value = data.tactiek || "";

    if (data.techniek) {
        document.getElementById("KernA_doel").value =
            `Voorbereiding: ${data.techniek.voorbereiding}
Slagmoment: ${data.techniek.slagmoment}
Eindpositie: ${data.techniek.eindpositie}`;
    }
}

// -------------------- START --------------------
window.onload = function () {
    initTabs();
    loadLesson();
    loadSlagen();
};
