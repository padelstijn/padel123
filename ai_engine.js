function analyzeLesson(lesson) {
  let score = {
    techniek: 50,
    tactiek: 50,
    consistentie: 50,
    positionering: 50
  };

  let text = JSON.stringify(lesson).toLowerCase();

  // TECHNIEK
  if (text.includes("forehand")) score.techniek += 10;
  if (text.includes("backhand")) score.techniek += 10;
  if (text.includes("volley")) score.techniek += 15;

  // TACTIEK
  if (text.includes("mikpunt")) score.tactiek += 10;
  if (text.includes("beslissing")) score.tactiek += 10;

  // POSITIONERING
  if (text.includes("net")) score.positionering += 15;
  if (text.includes("positie")) score.positionering += 10;

  // CONSISTENTIE
  if (text.includes("zonder fouten")) score.consistentie += 15;
  if (text.includes("%")) score.consistentie += 10;

  return score;
}

/* ---------------- PLAYER AI PROFILE ---------------- */

function buildPlayerProfile(lessons) {
  let profile = {
    techniek: 0,
    tactiek: 0,
    consistentie: 0,
    positionering: 0,
    niveau: "beginner"
  };

  let count = 0;

  lessons.forEach(l => {
    if (!l) return;

    let s = analyzeLesson(l);

    profile.techniek += s.techniek;
    profile.tactiek += s.tactiek;
    profile.consistentie += s.consistentie;
    profile.positionering += s.positionering;

    count++;
  });

  if (count > 0) {
    profile.techniek = Math.round(profile.techniek / count);
    profile.tactiek = Math.round(profile.tactiek / count);
    profile.consistentie = Math.round(profile.consistentie / count);
    profile.positionering = Math.round(profile.positionering / count);
  }

  let avg = (profile.techniek + profile.tactiek + profile.consistentie + profile.positionering) / 4;

  if (avg > 80) profile.niveau = "gevorderd";
  else if (avg > 60) profile.niveau = "intermediate";
  else profile.niveau = "beginner";

  return profile;
}

/* ---------------- AI NEXT LESSON SUGGESTION ---------------- */

function suggestNextLesson(profile) {
  let focus = [];

  if (profile.techniek < 60) focus.push("techniek (forehand/backhand)");
  if (profile.positionering < 60) focus.push("positionering naar net");
  if (profile.consistentie < 60) focus.push("consistentie onder druk");
  if (profile.tactiek < 60) focus.push("beslissingsmomenten");

  return {
    focus: focus.length ? focus : ["verfijning en match play"],
    advies:
      "Volgende les focussen op: " + focus.join(", ")
  };
}

/* ---------------- AUTO LES GENERATOR ---------------- */

function autoFillLesson(base) {
  return {
    ...base,
    Bedoeling: base.Bedoeling || "AI gegenereerde opbouw",
    KernA_doel: base.KernA_doel || "Techniek + consistentie training",
    KernB_doel: base.KernB_doel || "Tactische toepassing in rally",
    Evaluatie: base.Evaluatie || "AI: spelers analyseren progressie"
  };
}
