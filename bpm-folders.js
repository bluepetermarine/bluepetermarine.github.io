/*
  RCD Navigator, Blue Peter Marine
  Saved files sorted by essential requirement.

  Every file a client saves from the Navigator or one of its tools belongs to an
  essential requirement (Directive 2013/53/EU, Annex I) or to the general
  submission documents. This script:
    1. gives the file name the requirement number after the project number
       (e.g. 14128_ESR-3.2_iso12217-2-option3.json)
    2. attaches a copy under that requirement in the Navigator (browser storage
       rcdDocsDB, the same list as "Attach documents"), so Download all
       documentation (ZIP) delivers it in the right folder, in every browser
    3. in Chrome and Edge, saves the file straight into the client's project
       folder, in a subfolder per requirement ("3.2 Stability and freeboard").
       The folder is chosen once; the browser may ask again for permission.
       Subfolders are made only when a file is saved in them.
  Folder names follow the EN | FR switch (bpm-i18n.js, stored as bpm.lang).
  An existing folder for the same requirement in the other language is reused.

  In a page (after bpm-watermark.js):
    <script src="bpm-folders.js"></script>
  The requirement of a page comes from PAGES below, or from
    <meta name="bpm-esr" content="3.2">
  A download link can set its own:
    data-bpm-esr="5.3"       requirement of this file
    data-bpm-file="root"     project folder itself, not attached in the Navigator (ZIP, CSV status)
    data-bpm-file="none"     plain download, nothing else
*/
(function () {
  "use strict";
  if (window.BPMFolders) return;

  /* ---------- essential requirements: [English, French] ---------- */
  var TITLES = {
    "_general": ["General submission documents", "Documents généraux à fournir"],
    "1": ["Design categories A, B, C, D", "Catégories de conception A, B, C, D"],
    "2.1": ["Watercraft identification", "Identification des bateaux"],
    "2.2": ["Builder's plate", "Plaque du constructeur du bateau"],
    "2.3": ["Protection from falling overboard and means of reboarding", "Prévention des chutes par-dessus bord et moyens permettant de remonter à bord"],
    "2.4": ["Visibility from the main steering position", "Visibilité à partir du poste de barre principal"],
    "2.5": ["Owner's manual", "Manuel du propriétaire"],
    "3.1": ["Structure", "Structure"],
    "3.2": ["Stability and freeboard", "Stabilité et franc-bord"],
    "3.3": ["Buoyancy and flotation", "Flottabilité"],
    "3.4": ["Openings in hull, deck and superstructure", "Ouvertures dans la coque, le pont et la superstructure"],
    "3.5": ["Flooding", "Envahissement"],
    "3.6": ["Manufacturer's maximum recommended load", "Charge maximale recommandée par le fabricant"],
    "3.7": ["Life raft stowage", "Emplacement du radeau de sauvetage"],
    "3.8": ["Escape", "Évacuation"],
    "3.9": ["Anchoring, mooring and towing", "Ancrage, amarrage et remorquage"],
    "4": ["Handling characteristics", "Caractéristiques concernant les manœuvres"],
    "5.1.1": ["Engines and engine compartments - inboard engine", "Moteurs et compartiments moteurs - moteurs in-bord"],
    "5.1.2": ["Engines and engine compartments - ventilation", "Moteurs et compartiments moteurs - ventilation"],
    "5.1.3": ["Engines and engine compartments - exposed parts", "Moteurs et compartiments moteurs - parties exposées"],
    "5.1.4": ["Outboard propulsion engine starting", "Démarrage du moteur hors-bord de propulsion"],
    "5.1.5": ["Personal watercraft running without driver", "Véhicules nautiques à moteur fonctionnant sans pilote"],
    "5.1.6": ["Tiller-controlled outboard engines", "Moteurs hors-bord avec commande à la barre"],
    "5.2.1": ["Fuel system - general", "Circuit d'alimentation - généralités"],
    "5.2.2": ["Fuel tanks", "Réservoirs de carburant"],
    "5.3": ["Electrical system", "Système électrique"],
    "5.4.1": ["Steering system - general", "Direction - généralités"],
    "5.4.2": ["Steering system - emergency arrangements", "Direction - dispositifs de secours"],
    "5.5": ["Gas system", "Appareils à gaz"],
    "5.6.1": ["Fire protection - general", "Protection contre l'incendie - généralités"],
    "5.6.2": ["Fire-fighting equipment", "Équipement de lutte contre l'incendie"],
    "5.7": ["Navigation lights, shapes and sound signals", "Feux de navigation, marques et signalisations sonores"],
    "5.8": ["Discharge prevention and installations facilitating the delivery ashore of waste", "Prévention des décharges et installations permettant de transférer les déchets à terre"],
    "II.1": ["Ignition-protected equipment for inboard and stern drive petrol engines and petrol tank spaces", "Équipement protégé contre la déflagration pour moteurs in-bord et moteurs à embase arrière à essence et pour emplacements de réservoirs à essence"],
    "II.2": ["Start-in-gear protection devices for outboard engines", "Dispositifs de protection contre le démarrage des moteurs hors-bord lorsque le levier de vitesse est engagé"],
    "II.3": ["Steering wheels, steering mechanisms and cable assemblies", "Roues de gouvernail, mécanismes de direction et systèmes de câbles"],
    "II.4": ["Fuel tanks intended for fixed installations and fuel hoses", "Réservoirs de carburant destinés à des installations fixes et conduites de carburant"],
    "II.5": ["Prefabricated hatches and port lights", "Panneaux préfabriqués et hublots"]
  };

  /* ---------- requirement of each page (file name, in site/ or site/tools/) ---------- */
  var PAGES = {
    "rcd-navigator.html": "_general", "boat-data-sheet.html": "_general", "principal-data.html": "_general",
    "principal-data-reference.html": "_general", "rcd-master-index.html": "_general",
    "win-generator.html": "2.1",
    "builders-plate-generator.html": "2.2",
    "reboarding-checklist.html": "2.3", "iso15085-reboarding-checklist.html": "2.3", "iso15085-test-report.html": "2.3",
    "card-iso15085-5-2.html": "2.3", "card-iso15085-7-3.html": "2.3", "card-iso15085-8-5-2.html": "2.3",
    "visibility-checklist.html": "2.4",
    "owners-manual.html": "2.5", "iso10240_labels.html": "2.5",
    "iso6185-3-checklist.html": "3.1",
    "iso12217-3-stability.html": "3.2", "iso12217_figures.html": "3.2", "gzmax-calculator.html": "3.2",
    "catamaran-gz-curve.html": "3.2", "iso12217-2-inversion.html": "3.2",
    "iso12217-1-option2.html": "3.2", "iso12217-1-option4.html": "3.2", "iso12217-1-option5.html": "3.2", "iso12217-1-option6.html": "3.2",
    "iso12217-2-option3.html": "3.2", "iso12217-2-option4.html": "3.2", "iso12217-2-option5.html": "3.2",
    "iso12217-2-option6.html": "3.2", "iso12217-2-option7.html": "3.2",
    "iso12217-3-option1.html": "3.2", "iso12217-3-option2.html": "3.2", "iso12217-3-option3.html": "3.2",
    "iso12217-3-option4.html": "3.2", "iso12217-3-option5.html": "3.2", "iso12217-3-option6a.html": "3.2",
    "Window calculator bpm.html": "3.4", "iso12216_labels.html": "3.4", "iso9093_labels.html": "3.4",
    "through-hull-checklist.html": "3.4", "ISO9093_Assembly_Test_Report.html": "3.4", "iso9093-assembly-test-report.html": "3.4",
    "footbasin-10-3-checklist.html": "3.5", "hull-openings-bilge-checklist.html": "3.5",
    "max-load-worksheet.html": "3.6",
    "cleat-checklist.html": "3.9", "iso15084-strong-points-checklist.html": "3.9",
    "object-avoidance-checklist.html": "4", "iso11591-2-object-avoidance.html": "4",
    "iso11105_labels.html": "5.1.2", "iso11105-petrol-ventilation.html": "5.1.2",
    "iso10088_labels.html": "5.2.1", "iso10088-diesel-checklist.html": "5.2.1", "iso10088-petrol-checklist.html": "5.2.1",
    "fuel-tank-tests.html": "5.2.2", "iso21487_labels.html": "5.2.2",
    "iso21487-diesel-metallic-tank-checklist.html": "5.2.2", "iso21487-petrol-metallic-tank-checklist.html": "5.2.2",
    "iso21487-petrol-nonmetallic-tank-checklist.html": "5.2.2", "iso21487-diesel-metallic-tank.html": "5.2.2",
    "iso21487-diesel-nonmetallic-tank.html": "5.2.2", "iso21487-petrol-metallic-tank.html": "5.2.2",
    "cable-size-checklist.html": "5.3", "iso13297-electrical-calculator.html": "5.3", "iso13297_labels.html": "5.3",
    "voltage_drop_calculator.html": "5.3",
    "iso8848_checklist.html": "5.4.1", "iso10592_checklist.html": "5.4.1", "iso25197_checklist.html": "5.4.1",
    "iso10239_labels.html": "5.5", "iso10239-lpg-ventilation.html": "5.5", "ventilation-checklist.html": "5.5",
    "iso9094_labels.html": "5.6.1",
    "blue-peter-nav-lights.html": "5.7",
    "iso8099_labels.html": "5.8"
  };

  /* ---------- texts ---------- */
  var TXT = {
    en: {
      askTitle: "Save into your project folder?",
      askText: "Files you save can go straight into a folder on this computer, sorted in a subfolder for each essential requirement (for example “{folder}”). Choose the project folder once. You can change this later in the RCD Navigator, under the documentation summary.",
      askChoose: "Choose project folder", askNo: "Download as usual",
      saved: "Saved in {folder}", savedRoot: "Saved in your project folder",
      failed: "Could not save in the folder, the file was downloaded instead.",
      attached: "Also attached under {esr} in the RCD Navigator"
    },
    fr: {
      askTitle: "Enregistrer dans le dossier du projet ?",
      askText: "Les fichiers que vous enregistrez peuvent aller directement dans un dossier de cet ordinateur, rangés dans un sous-dossier par exigence essentielle (par exemple « {folder} »). Choisissez le dossier du projet une seule fois. Vous pouvez modifier ce choix plus tard dans le RCD Navigator, sous le résumé de la documentation.",
      askChoose: "Choisir le dossier du projet", askNo: "Télécharger comme d'habitude",
      saved: "Enregistré dans {folder}", savedRoot: "Enregistré dans le dossier du projet",
      failed: "Enregistrement dans le dossier impossible, le fichier a été téléchargé.",
      attached: "Également joint sous {esr} dans le RCD Navigator"
    }
  };
  function lang() {
    try { if (window.BPMI18n && window.BPMI18n.lang) return window.BPMI18n.lang === "fr" ? "fr" : "en"; } catch (e) {}
    try { return localStorage.getItem("bpm.lang") === "fr" ? "fr" : "en"; } catch (e) {}
    return "en";
  }
  function tx(key, values) {
    var s = (TXT[lang()] || TXT.en)[key] || TXT.en[key] || key;
    if (values) s = s.replace(/\{(\w+)\}/g, function (m, n) { return values[n] != null ? values[n] : m; });
    return s;
  }

  /* ---------- folder names ---------- */
  function numOf(esr) { return esr === "_general" ? "0" : esr; }
  function folderName(esr, lg) {
    var t = TITLES[esr]; if (!t) return null;
    var name = numOf(esr) + " " + t[(lg || lang()) === "fr" ? 1 : 0];
    name = name.replace(/[\\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
    if (name.length > 80) { name = name.slice(0, 80); var sp = name.lastIndexOf(" "); if (sp > 40) name = name.slice(0, sp); }
    return name.replace(/[ .]+$/, "");
  }

  /* ---------- requirement of this page ---------- */
  function pageEsr() {
    try {
      var m = document.querySelector('meta[name="bpm-esr"]');
      if (m && TITLES[m.content]) return m.content;
    } catch (e) {}
    var file = "";
    try { file = decodeURIComponent(location.pathname.split("/").pop() || ""); } catch (e) {}
    return PAGES[file] || "_general";
  }

  /* ---------- storage of the folder choice ---------- */
  var MODE_KEY = "bpm.folders";            // "folder" | "download" | (not chosen yet)
  var supported = typeof window.showDirectoryPicker === "function" && window.isSecureContext !== false && window.top === window.self;
  function getMode() { try { return localStorage.getItem(MODE_KEY) || ""; } catch (e) { return ""; } }
  function setMode(m) { try { if (m) localStorage.setItem(MODE_KEY, m); else localStorage.removeItem(MODE_KEY); } catch (e) {} }

  function kvDb() {
    return new Promise(function (res, rej) {
      try {
        var r = indexedDB.open("bpmFolders", 1);
        r.onupgradeneeded = function (e) { e.target.result.createObjectStore("kv"); };
        r.onsuccess = function (e) { res(e.target.result); };
        r.onerror = function () { rej(r.error); };
      } catch (err) { rej(err); }
    });
  }
  function kvGet(key) {
    return kvDb().then(function (db) {
      return new Promise(function (res) {
        var q = db.transaction("kv", "readonly").objectStore("kv").get(key);
        q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); };
      });
    });
  }
  function kvSet(key, val) {
    return kvDb().then(function (db) {
      return new Promise(function (res) {
        var st = db.transaction("kv", "readwrite").objectStore("kv");
        var q = val == null ? st.delete(key) : st.put(val, key);
        q.onsuccess = function () { res(); }; q.onerror = function () { res(); };
      });
    });
  }

  function chooseFolder() {
    if (!supported) return Promise.reject(new Error("not supported"));
    return window.showDirectoryPicker({ id: "bpm-project", mode: "readwrite" }).then(function (h) {
      return kvSet("root", h).then(function () { setMode("folder"); return h; });
    });
  }
  /* the project folder, with write permission; interactive: may open the picker or ask permission */
  function rootDir(interactive) {
    if (!supported) return Promise.resolve(null);
    return kvGet("root").catch(function () { return null; }).then(function (h) {
      if (!h) return interactive ? chooseFolder() : null;
      var opt = { mode: "readwrite" };
      return Promise.resolve(h.queryPermission ? h.queryPermission(opt) : "granted").then(function (p) {
        if (p === "granted") return h;
        if (!interactive || !h.requestPermission) return null;
        return h.requestPermission(opt).then(function (p2) { return p2 === "granted" ? h : null; });
      });
    });
  }
  function folderLabel() {
    if (!supported) return Promise.resolve(null);
    return kvGet("root").then(function (h) { return h ? (h.name || "\u2026") : null; }).catch(function () { return null; });
  }
  function forget() { setMode("download"); return kvSet("root", null).catch(function () {}); }

  /* subfolder of a requirement: reuse one that starts with the same number (any language) */
  function esrDir(root, esr) {
    var prefix = numOf(esr) + " ";
    var found = null;
    function scan() {
      if (!root.values) return Promise.resolve();
      var it = root.values();
      function step() {
        return it.next().then(function (r) {
          if (r.done) return;
          if (r.value.kind === "directory" && r.value.name.indexOf(prefix) === 0) { found = r.value; return; }
          return step();
        });
      }
      return step();
    }
    return scan().catch(function () {}).then(function () {
      return found || root.getDirectoryHandle(folderName(esr), { create: true });
    });
  }

  /* write a file; esr null = the project folder itself. Resolves with the folder name. */
  function writeFile(esr, name, blob, interactive) {
    return rootDir(interactive !== false).then(function (root) {
      if (!root) throw new Error("no folder");
      return (esr ? esrDir(root, esr) : Promise.resolve(root)).then(function (dir) {
        return dir.getFileHandle(name, { create: true }).then(function (fh) {
          return fh.createWritable();
        }).then(function (w) {
          return w.write(blob).then(function () { return w.close(); });
        }).then(function () { return esr ? dir.name : root.name; });
      });
    });
  }

  /* ---------- copy under the requirement in the Navigator (rcdDocsDB, as base.html) ---------- */
  function docsDb() {
    return new Promise(function (res, rej) {
      function upgrade(db) {
        if (!db.objectStoreNames.contains("files")) { var s = db.createObjectStore("files", { keyPath: "id", autoIncrement: true }); s.createIndex("esr", "esr", { unique: false }); }
        if (!db.objectStoreNames.contains("checks")) db.createObjectStore("checks", { keyPath: "key" });
        if (!db.objectStoreNames.contains("workbook")) db.createObjectStore("workbook", { keyPath: "key" });
      }
      try {
        var r = indexedDB.open("rcdDocsDB");
        r.onupgradeneeded = function (e) { upgrade(e.target.result); };
        r.onerror = function () { rej(r.error); };
        r.onsuccess = function (e) {
          var db = e.target.result;
          if (db.objectStoreNames.contains("files")) return res(db);
          var v = Math.max(2, db.version + 1); db.close();
          var r2 = indexedDB.open("rcdDocsDB", v);
          r2.onupgradeneeded = function (e2) { upgrade(e2.target.result); };
          r2.onsuccess = function (e2) { res(e2.target.result); };
          r2.onerror = function () { rej(r2.error); };
        };
      } catch (err) { rej(err); }
    });
  }
  var channel = null;
  try { channel = new BroadcastChannel("bpm-docs"); } catch (e) {}
  function announce(esr) {
    try { if (channel) channel.postMessage({ esr: esr }); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent("bpm-docs-changed", { detail: { esr: esr } })); } catch (e) {}
  }
  /* one copy per requirement and file name: saving again replaces the earlier copy */
  function attach(esr, name, blob) {
    return docsDb().then(function (db) {
      return new Promise(function (res, rej) {
        var tr = db.transaction("files", "readwrite"), st = tr.objectStore("files");
        var q = st.index("esr").getAll(esr);
        q.onsuccess = function () {
          (q.result || []).forEach(function (f) { if (f.name === name) st.delete(f.id); });
          st.add({ esr: esr, name: name, size: blob.size, type: blob.type || "", blob: blob, from: "tool", saved: Date.now() });
        };
        tr.oncomplete = function () { res(); announce(esr); };
        tr.onerror = function () { rej(tr.error); };
      });
    });
  }

  /* ---------- small messages ---------- */
  var CSS = "font-family:'Barlow',Arial,sans-serif;color:#1a2e4a;";
  function toast(text, sub) {
    try {
      var d = document.createElement("div");
      d.setAttribute("role", "status");
      d.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483646;max-width:360px;background:#1a2e4a;color:#fff;" +
        "font-family:'Barlow',Arial,sans-serif;font-size:14px;line-height:1.4;padding:10px 14px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.25);border-left:4px solid #c8860a";
      d.textContent = text;
      if (sub) { var s = document.createElement("div"); s.style.cssText = "font-size:12px;opacity:.8;margin-top:3px"; s.textContent = sub; d.appendChild(s); }
      (document.body || document.documentElement).appendChild(d);
      setTimeout(function () { d.style.transition = "opacity .4s"; d.style.opacity = "0"; }, 3600);
      setTimeout(function () { d.remove(); }, 4100);
    } catch (e) {}
  }
  function ask(example) {
    return new Promise(function (res) {
      var bg = document.createElement("div");
      bg.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(26,46,74,.45);display:flex;align-items:center;justify-content:center;padding:16px";
      var box = document.createElement("div");
      box.style.cssText = CSS + "background:#fff;max-width:460px;border-radius:8px;padding:20px 22px;box-shadow:0 8px 30px rgba(0,0,0,.3);border-top:4px solid #c8860a";
      var h = document.createElement("div"); h.style.cssText = "font-weight:700;font-size:17px;margin-bottom:8px"; h.textContent = tx("askTitle");
      var p = document.createElement("div"); p.style.cssText = "font-size:14px;line-height:1.5;margin-bottom:16px"; p.textContent = tx("askText", { folder: example });
      var row = document.createElement("div"); row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end";
      function btn(label, primary, val) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = label;
        b.style.cssText = "font:700 14px 'Barlow Condensed',Arial,sans-serif;letter-spacing:.03em;padding:9px 16px;border-radius:5px;cursor:pointer;" +
          (primary ? "background:#1a2e4a;color:#fff;border:none" : "background:#fff;color:#1a2e4a;border:1px solid #1a2e4a");
        b.onclick = function () { bg.remove(); res(val); };
        return b;
      }
      row.appendChild(btn(tx("askNo"), false, "download"));
      row.appendChild(btn(tx("askChoose"), true, "folder"));
      box.appendChild(h); box.appendChild(p); box.appendChild(row); bg.appendChild(box);
      bg.addEventListener("click", function (e) { if (e.target === bg) { bg.remove(); res(null); } });
      (document.body || document.documentElement).appendChild(bg);
    });
  }

  /* ---------- saved files ---------- */
  var origCreate = URL.createObjectURL, origRevoke = URL.revokeObjectURL;
  var blobs = {};   // object URL -> Blob, so a file can still be read after the page revokes its URL
  URL.createObjectURL = function (o) {
    var u = origCreate.apply(URL, arguments);
    try { if (o && typeof o.size === "number" && typeof o.slice === "function") blobs[u] = o; } catch (e) {}
    return u;
  };
  URL.revokeObjectURL = function (u) {
    if (blobs[u]) setTimeout(function () { delete blobs[u]; }, 60000);
    return origRevoke.apply(URL, arguments);
  };
  function blobOf(href) {
    if (blobs[href]) return Promise.resolve(blobs[href]);
    return fetch(href).then(function (r) { return r.blob(); });
  }

  var origClick = HTMLAnchorElement.prototype.click;
  function plainDownload(blob, name) {
    var a = document.createElement("a");
    a.href = origCreate.call(URL, blob); a.download = name; a.setAttribute("data-bpm-file", "none");
    (document.body || document.documentElement).appendChild(a);
    origClick.call(a); a.remove();
  }

  function fileName(a, esr, root) {
    var n = a.getAttribute("download") || "download";
    try {
      if (typeof window.BPM_PROJNAME === "function") n = window.BPM_PROJNAME(n);
      else {   /* pages without bpm-watermark.js (tools/): same rule, project number first */
        var info = JSON.parse(localStorage.getItem("bpm_client") || "null");
        var pr = info && info.p ? String(info.p).trim().replace(/[^A-Za-z0-9_-]+/g, "") : "";
        if (pr && n.indexOf(pr) < 0) n = pr + "_" + n;
      }
    } catch (e) {}
    if (root || !esr || esr === "_general" || /(^|_)ESR-/.test(n)) return n;
    var tag = "ESR-" + esr + "_";
    var m = /^(\d+)_/.exec(n);     // after the project number, if there is one
    return m ? m[0] + tag + n.slice(m[0].length) : tag + n;
  }

  /* returns true when this script takes over the download */
  function intercept(a) {
    if (!a || !a.hasAttribute || !a.hasAttribute("download")) return false;
    var how = a.getAttribute("data-bpm-file") || "";
    if (how === "none") return false;
    var href = a.getAttribute("href") || "";
    if (!/^(blob:|data:)/i.test(href)) return false;
    var root = how === "root";
    var esr = a.getAttribute("data-bpm-esr") || PAGE_ESR;
    if (!TITLES[esr]) esr = "_general";
    var name = fileName(a, esr, root);
    a.setAttribute("download", name);
    var blobP = blobOf(a.href);
    if (!root) blobP.then(function (b) { return attach(esr, name, b); }).catch(function () {});

    var mode = getMode();
    if (!supported || mode === "download") return false;     // ordinary download, with the new name
    var dest = root ? null : esr;
    var go = mode === "folder" ? Promise.resolve("folder") : ask(folderName(esr));
    go.then(function (choice) {
      if (choice !== "folder") {
        if (choice === "download") setMode("download");
        return blobP.then(function (b) { plainDownload(b, name); });
      }
      return blobP.then(function (b) {
        return writeFile(dest, name, b, true).then(function (where) {
          toast(dest ? tx("saved", { folder: where }) : tx("savedRoot"),
            (!root && PAGE_ESR !== "_general" && !/rcd-navigator\.html$/i.test(location.pathname)) ? tx("attached", { esr: esr }) : "");
        }).catch(function (err) {
          if (err && err.name === "AbortError") return;     // picker closed: nothing saved, nothing downloaded
          toast(tx("failed"));
          plainDownload(b, name);
        });
      });
    }).catch(function () {});
    return true;
  }

  HTMLAnchorElement.prototype.click = function () {
    var took = false;
    try { took = intercept(this); } catch (e) {}
    if (took) return;
    this.__bpmSeen = true;
    try { return origClick.apply(this, arguments); } finally { this.__bpmSeen = false; }
  };
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    var a = e.target && e.target.closest ? e.target.closest("a[download]") : null;
    if (!a || a.__bpmSeen) return;
    try { if (intercept(a)) e.preventDefault(); } catch (err) {}
  }, true);

  var PAGE_ESR = pageEsr();

  window.BPMFolders = {
    supported: supported,
    titles: TITLES,
    pageEsr: PAGE_ESR,
    folderName: folderName,
    mode: getMode,
    setMode: setMode,
    chooseFolder: chooseFolder,
    folderLabel: folderLabel,
    forget: forget,
    writeFile: writeFile,
    toast: toast
  };
})();
