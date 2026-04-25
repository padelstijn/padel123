const TOTAL_LESSONS = 12;
let currentLesson = 1;

// 🔥 44 kolommen (basis + uitbreidbaar)
const fields = [
"Trainer","Datum","Tijd","Lesduur","Niveau",
"Spelers_profiel1","Spelers_profiel2","Spelers_profiel3","Spelers_profiel4",
"Spelers_groep",
"AI_output"
];

// 📌 Tabs
function initTabs() {
    const tabs = document.getElementById("tabs");
    for (let i=1;i<=TOTAL_LESSONS;i++){
        let b = document.createElement("button");
        b.innerText = "Les " + i;
        b.onclick = () => switchLesson(i);
        tabs.appendChild(b);
    }
}

function switchLesson(nr){
    saveLesson();
    currentLesson = nr;
    loadLesson();
}

// 💾 save
function saveLesson(){
    let data = {};
    fields.forEach(f=>{
        let el = document.getElementById(f);
        if(el) data[f] = el.value;
    });
    localStorage.setItem("les_"+currentLesson, JSON.stringify(data));
}

// 📂 load
function loadLesson(){
    let data = JSON.parse(localStorage.getItem("les_"+currentLesson));
    fields.forEach(f=>{
        let el = document.getElementById(f);
        if(el) el.value = data ? (data[f]||"") : "";
    });
}

// 📦 export ALL 12 lessen
function exportAll(){
    saveLesson();
    let all = {};
    for(let i=1;i<=12;i++){
        all[i] = JSON.parse(localStorage.getItem("les_"+i) || "{}");
    }
    let blob = new Blob([JSON.stringify(all)], {type:"text/plain"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "padel123_all_lessons.txt";
    a.click();
}

// 📥 import ALL
function importAll(event){
    let file = event.target.files[0];
    let r = new FileReader();
    r.onload = function(e){
        let all = JSON.parse(e.target.result);
        for(let i=1;i<=12;i++){
            if(all[i]){
                localStorage.setItem("les_"+i, JSON.stringify(all[i]));
            }
        }
        loadLesson();
    };
    r.readAsText(file);
}

// 🧠 AI LESGENERATOR V2
function generateAI(){

    let spelers = [
        document.getElementById("Spelers_profiel1").value,
        document.getElementById("Spelers_profiel2").value,
        document.getElementById("Spelers_profiel3").value,
        document.getElementById("Spelers_profiel4").value
    ].join(" | ");

    fetch("padelslagen.json")
    .then(r=>r.json())
    .then(slagen=>{

        let advies = "";

        // simpele AI logica
        if(spelers.includes("beginner")){
            advies += "Focus op forehand + backhand basics + laag blijven\n";
            advies += "→ GRAS principe toepassen\n";
        }

        if(spelers.includes("gevorderd")){
            advies += "Volley + bandeja + positioneel spel\n";
        }

        // koppeling met slagen DB
        slagen.slice(0,3).forEach(s=>{
            advies += "\n🎾 " + s.slag + ": " + s.doel;
        });

        document.getElementById("AI_output").value = advies;

        saveLesson();
    });
}

// 📡 GOOGLE SHEETS SYNC (publiek sheet)
function syncSheets(){
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRrKAyjEBXwq-UvZFpRj9-oI0X0gwJQRMGih-eIKNUfREeme-UtsL375pC0jBi7mg/pub?output=json")
    .then(r=>r.text())
    .then(data=>{
        console.log("Sheets data:", data);
        alert("Sheets geladen (check console)");
    });
}

// start
initTabs();
loadLesson();
