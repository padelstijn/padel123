const TOTAL_LESSONS = 12;
let currentLesson = 1;

// 44 kolommen
const fields = {
    global: [
        "Trainer","Lesgroep","Niveau","Lesduur","Locatie"
    ],
    lesson: [
        "Datum","Lesweek","Tijd",
        "Spelers_groep",
        "Spelers_profiel1","Spelers_profiel2","Spelers_profiel3","Spelers_profiel4",
        "Beginsituatie_algemeen","Technische_zwaktes","Tactische_zwaktes",
        "Hoofdspelsituatie","Bedoeling","Slag","Niveaubepalende_factor",
        "KernA_doel","KernA_succescriteria",
        "KernB_doel","KernB_beslissingsregels",
        "Inleiding_doel","Inleiding_oefenvorm","Inleiding_coaching",
        "KernA1_doel","KernA1_oefenvorm","KernA1_coaching",
        "KernA2_doel","KernA2_oefenvorm","KernA2_coaching",
        "KernB_doel_uitwerking","KernB_oefenvorm","KernB_coaching",
        "Slot_spelvorm","Slot_regels",
        "Evaluatie","Differentiatie",
        "Materiaal","Notities_trainer"
    ]
};

// -------------------- INIT --------------------
initTabs();
buildForm();
loadLesson();

// -------------------- TABS --------------------
function initTabs(){
    const el = document.getElementById("tabs");
    for(let i=1;i<=TOTAL_LESSONS;i++){
        let b=document.createElement("button");
        b.innerText="Les "+i;
        b.onclick=()=>switchLesson(i);
        el.appendChild(b);
    }
}

function switchLesson(n){
    saveLesson();
    currentLesson=n;
    loadLesson();
}

// -------------------- FORM --------------------
function buildForm(){
    const form=document.getElementById("form");

    let all=[...fields.global,...fields.lesson];

    all.forEach(f=>{
        let div=document.createElement("div");
        div.innerHTML=`<label>${f}</label>
        <textarea id="${f}"></textarea>`;
        form.appendChild(div);
    });
}

// -------------------- SAVE/LOAD --------------------
function saveLesson(){
    let data={};

    [...fields.global,...fields.lesson].forEach(f=>{
        let el=document.getElementById(f);
        if(el) data[f]=el.value;
    });

    localStorage.setItem("les_"+currentLesson,JSON.stringify(data));
}

function loadLesson(){
    let data=JSON.parse(localStorage.getItem("les_"+currentLesson)||"{}");

    [...fields.global,...fields.lesson].forEach(f=>{
        let el=document.getElementById(f);
        if(el) el.value=data[f]||"";
    });
}

// -------------------- GLOBAL SAVE --------------------
function saveGlobal(){
    let g={};
    fields.global.forEach(f=>{
        g[f]=document.getElementById(f).value;
    });
    localStorage.setItem("global",JSON.stringify(g));
}

// -------------------- EXPORT --------------------
function buildData(){
    let global=JSON.parse(localStorage.getItem("global")||"{}");
    let lessons={};

    for(let i=1;i<=12;i++){
        lessons[i]=JSON.parse(localStorage.getItem("les_"+i)||"{}");
    }

    return {global,lessons};
}

function exportAll(){
    saveLesson();
    let data=buildData();
    download(JSON.stringify(data,null,2),"padel123.json");
}

function exportTXT(){
    let data=buildData();
    download(JSON.stringify(data,null,2),"padel123.txt");
}

function exportCSV(){
    let data=buildData();
    let rows=[];

    for(let i=1;i<=12;i++){
        let l=data.lessons[i]||{};
        let row=[];

        fields.global.forEach(f=>row.push(data.global[f]||""));
        fields.lesson.forEach(f=>row.push(l[f]||""));

        rows.push(row.join(";"));
    }

    download(rows.join("\n"),"padel123.csv");
}

// -------------------- IMPORT --------------------
function importLesson(e){
    let file=e.target.files[0];
    let reader=new FileReader();

    reader.onload=function(ev){
        let txt=ev.target.result;
        let data=JSON.parse(txt);

        localStorage.clear();

        if(data.global){
            localStorage.setItem("global",JSON.stringify(data.global));
        }

        for(let i=1;i<=12;i++){
            localStorage.setItem("les_"+i,JSON.stringify(data.lessons?.[i]||{}));
        }

        loadLesson();
    };

    reader.readAsText(file);
}

// -------------------- DOWNLOAD --------------------
function download(data,name){
    let a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([data]));
    a.download=name;
    a.click();
}
