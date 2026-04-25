let DB;

function openDB() {
  return new Promise((resolve) => {
    let req = indexedDB.open("padelDB", 1);

    req.onupgradeneeded = (e) => {
      let db = e.target.result;
      db.createObjectStore("lessen", { keyPath: "id" });
      db.createObjectStore("global", { keyPath: "id" });
    };

    req.onsuccess = (e) => {
      DB = e.target.result;
      resolve(DB);
    };
  });
}

function saveLessonDB(lesson) {
  let tx = DB.transaction("lessen", "readwrite");
  tx.objectStore("lessen").put(lesson);
}

function getAllLessons() {
  return new Promise((resolve) => {
    let tx = DB.transaction("lessen", "readonly");
    let req = tx.objectStore("lessen").getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

function saveGlobalDB(global) {
  let tx = DB.transaction("global", "readwrite");
  tx.objectStore("global").put({ id: 1, ...global });
}

function getGlobalDB() {
  return new Promise((resolve) => {
    let tx = DB.transaction("global", "readonly");
    let req = tx.objectStore("global").get(1);
    req.onsuccess = () => resolve(req.result || {});
  });
}
