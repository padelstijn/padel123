function genereerProfiel() {

    let spelers = [
        document.getElementById("speler1").value,
        document.getElementById("speler2").value,
        document.getElementById("speler3").value,
        document.getElementById("speler4").value
    ].filter(s => s !== "");

    let profiel = "";

    profiel += "Groep van " + spelers.length + " spelers.\n\n";

    if (spelers.length <= 2) {
        profiel += "Veel individuele aandacht mogelijk.\n";
    } else {
        profiel += "Groepsdynamiek en rotatie belangrijk.\n";
    }

    profiel += "\nTechnisch:\n- Inconsistent raakpunt\n- Timing problemen\n";

    profiel += "\nTactisch:\n- Weinig bewuste keuzes\n- Spelen reactief\n";

    profiel += "\nFocus training:\n- Richting\n- Controle\n- Keuze maken\n";

    document.getElementById("groep").value = profiel;
}

function opslaan() {
    let data = {};

    document.querySelectorAll("input, textarea").forEach(el => {
        data[el.id] = el.value;
    });

    localStorage.setItem("lesData", JSON.stringify(data));
    alert("Opgeslagen!");
}

function laden() {
    let data = JSON.parse(localStorage.getItem("lesData"));

    if (!data) return;

    Object.keys(data).forEach(key => {
        if (document.getElementById(key)) {
            document.getElementById(key).value = data[key];
        }
    });

    alert("Geladen!");
}
