const TOTAL_LESSONS = 12;
let currentLesson = 1;

// 🟦 44 kolommen (vereenvoudigd beheersbaar)
const fields = {
    global: [
        "Trainer","Lesgroep","Lesduur","Niveau","Locatie","Notities_trainer"
    ],
    lesson: [
        "Datum","Tijd","Lesweek",
        "Spelers_profiel1","Spelers_profiel2","Spelers_profiel3","Spelers_profiel4",
        "Spelers_groep",
        "Inleiding_doel","Inleiding_oefenvorm",
        "KernA_doel","KernA_oefenvorm","KernA_coaching",
        "KernA2_doel","KernA2_oefenvorm","KernA2_coaching",
        "KernB_doel_uitwerking","KernB_oefenvorm","KernB_coaching",
        "Slot_spelvorm","Slot_regels",
        "Evaluatie","Differentiatie",
        "Slag","Bedoeling","Hoofdspelsituatie",
        "AI_output"
    ]
};

// 🧠 GLOBAL LOAD/SAVE
function saveGlobal(){
    let g = {};
    fields.global.forEach(f=>{
        let el = document.getElementById(f);
        if(el) g[f] = el.value;
    });
    localStorage.setItem("global", JSON.stringify(g));
}

function loadGlobal(){
    let g = JSON.parse(localStorage.getItem("global") || "{}");
    fields.global.forEach(f=>{
        let el = document.getElementById(f);
        if(el) el.value = g[f] || "";
    });
}

// 📚 LES LOAD/SAVE
function saveLesson(){
    let data = {};
    fields.lesson.forEach(f=>{
        let el = document.getElementById(f);
        if(el) data[f] = el.value;
    });
    localStorage.setItem("les_"+currentLesson, JSON.stringify(data));
}

function loadLesson(){
    let data = JSON.parse(localStorage.getItem("les_"+currentLesson) || "{}");
    fields.lesson.forEach(f=>{
        let el = document.getElementById(f);
        if(el) el.value = data[f] || "";
    });

    // 🔁 inject global defaults als leeg
    let g = JSON.parse(localStorage.getItem("global") || "{}");
    fields.global.forEach(f=>{
        let el = document.getElementById(f);
        if(el && !el.value) el.value = g[f] || "";
    });
}

// 🔁 TABS
function initTabs(){
    const tabs = document.getElementById("tabs");
    for(let i=1;i<=TOTAL_LESSONS;i++){
        let b = document.createElement("button");
        b.innerText = "Les "+i;
        b.onclick = ()=>switchLesson(i);
        tabs.appendChild(b);
    }
}

function switchLesson(n){
    saveLesson();
    saveGlobal();
    currentLesson = n;
    loadLesson();
}

// 📦 EXPORT JSON (FULL SYSTEM)
function exportAll(){
    saveLesson();
    saveGlobal();

    let all = {
        global: JSON.parse(localStorage.getItem("global")||"{}"),
        lessons: {}
    };

    for(let i=1;i<=12;i++){
        all.lessons[i] = JSON.parse(localStorage.getItem("les_"+i)||"{}");
    }

    download(JSON.stringify(all), "padel123_full.json");
}

// 📊 EXPORT CSV (Excel 44 kolommen)
function exportCSV(){
    let csv = [];

    for(let i=1;i<=12;i++){
        let row = [];
        let data = JSON.parse(localStorage.getItem("les_"+i)||"{}");

        fields.global.forEach(f=>{
            row.push((JSON.parse(localStorage.getItem("global")||"{}")[f]||""));
        });

        fields.lesson.forEach(f=>{
            row.push(data[f]||"");
        });

        csv.push(row.join(";"));
    }

    download(csv.join("\n"), "padel123.csv");
}

// 📄 EXPORT TXT
function exportTXT(){
    exportAll();
}

// 📥 IMPORT FULL RESET
function importAll(event){
    let r = new FileReader();
    r.onload = function(e){
        let data = JSON.parse(e.target.result);

        localStorage.setItem("global", JSON.stringify(data.global||{}));

        for(let i=1;i<=12;i++){
            localStorage.setItem("les_"+i, JSON.stringify(data.lessons[i]||{}));
        }

        loadGlobal();
        loadLesson();
    };
    r.readAsText(event.target.files[0]);
}

// 🧠 AI koppeling (slagen + spelers)
function generateAI(){
    let profiel = [
        document.getElementById("Spelers_profiel1").value,
        document.getElementById("Spelers_profiel2").value
    ].join(" ");

    fetch("padelslagen.json")
    .then(r=>r.json())
    .then(slagen=>{
        let out = "";

        if(profiel.includes("beginner")){
            out += "Focus: forehand, backhand, GRAS, lage bal\n";
        }

        if(profiel.includes("gevorderd")){
            out += "Focus: volley, bandeja, positioneel spel\n";
        }

        slagen.forEach(s=>{
            out += "\n🎾 "+s.slag+": "+s.doel;
        });

        document.getElementById("AI_output").value = out;
        saveLesson();
    });
}

// helper
function download(data,name){
    let b = new Blob([data],{type:"text/plain"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = name;
    a.click();
}

// start
initTabs();
loadGlobal();
loadLesson();
