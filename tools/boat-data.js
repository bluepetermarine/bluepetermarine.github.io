/*!
 * Blue Peter Marine — RCD Navigator Boat Data Sheet engine
 * One shared data set per boat, entered once on boat-data-sheet.html,
 * read by every RCD Navigator tool that needs it.
 *
 * Single source of truth:
 *   TOOLS  — the tools that take boat data, in Annex I.A essential requirement order
 *   FIELDS — every shared input, with the tools (and page elements) that use it
 *
 * To connect a new tool: add it to TOOLS, add or extend FIELDS[].use with the
 * page's element selector, and include this script on the tool page:
 *   <script src="https://bluepetermarine.github.io/tools/boat-data.js"></script>
 */
(function (root) {
  "use strict";

  var SITE = "https://bluepetermarine.github.io/";
  var STORE_KEY = "bpm.boatdata.v1";
  var SHEET = SITE + "boat-data-sheet.html";

  /* ---------- Tools, in essential requirement order ---------- */
  var TOOLS = [
    { id: "win",       esr: "2.1",   title: "Watercraft identification", tool: "WIN generator",                     pages: ["tools/win-generator.html"] },
    { id: "plate",     esr: "2.2",   title: "Builder's plate",           tool: "Builder's plate generator",         pages: ["tools/builders-plate-generator.html"] },
    { id: "reboard",   esr: "2.3",   title: "Falling overboard and reboarding", tool: "ISO 15085 test report generator", pages: ["reboarding-checklist.html"] },
    { id: "vis",       esr: "2.4",   title: "Visibility from the main steering position", tool: "ISO 11591 field of vision checklist", pages: ["visibility-checklist.html"] },
    { id: "maxload",   esr: "3.2",   title: "Stability, freeboard and maximum load", tool: "Maximum load worksheet (ISO 12217)", pages: ["max-load-worksheet.html"] },
    { id: "window",    esr: "3.4",   title: "Openings in hull, deck and superstructure", tool: "Window calculator", pages: ["Window calculator bpm.html"] },
    { id: "bilge",     esr: "3.5",   title: "Flooding",                  tool: "Flooding and dewatering tool",      pages: ["tools/hull-openings-bilge-checklist.html"] },
    { id: "footbasin", esr: "3.5",   title: "Flooding",                  tool: "Foot basin drainage checklist",     pages: ["footbasin-10-3-checklist.html"] },
    { id: "cleat",     esr: "3.9",   title: "Anchoring, mooring and towing", tool: "ISO 15084 strong points checklist", pages: ["cleat-checklist.html"] },
    { id: "avoid",     esr: "4",     title: "Handling characteristics",  tool: "ISO 11592-2 avoidance line test",   pages: ["object-avoidance-checklist.html"] },
    { id: "fuel",      esr: "5.2",   title: "Fuel system and fuel tanks", tool: "ISO 21487 fuel tank checklists",   pages: ["iso21487-petrol-metallic-tank-checklist.html", "iso21487-diesel-metallic-tank-checklist.html", "tools/iso21487-diesel-nonmetallic-tank.html", "iso21487-petrol-nonmetallic-tank-checklist.html"], open: "fuel-tank-tests.html" },
    { id: "cable",     esr: "5.3",   title: "Electrical system",         tool: "ISO 13297 electrical systems calculator", pages: ["cable-size-checklist.html"] },
    { id: "vdrop",     esr: "5.3",   title: "Electrical system",         tool: "Voltage drop calculator",           pages: ["tools/voltage_drop_calculator.html"] },
    { id: "vent",      esr: "5.5",   title: "Gas system",                tool: "ISO 10239 LPG ventilation calculator", pages: ["ventilation-checklist.html"] }
  ];

  /* ---------- value converters used when a tool needs a different format ---------- */
  var PROP_AVOID = { outboard: "Outboard Motor", sterndrive: "Sterndrive (I/O)", sterndrive_ie: "Sterndrive (I/O)", inboard_prop: "Inboard with Propeller", inboard_shaft: "Inboard with Shaft Drive", waterjet: "Waterjet", pod: "Pod Drive", other: "Other" };
  var conv = {
    yy:        function (v) { v = String(v).trim(); return v.length >= 2 ? v.slice(-2) : v; },
    mToMm:     function (v) { var n = parseFloat(v); return isNaN(n) ? "" : String(Math.round(n * 1000)); },
    catLong:   function (v) { return v; },
    dcText:    function (v) { return v + "V DC"; },
    windowHull:function (v) { return (v === "motor" || v === "motor_multi" || v === "inflatable") ? "Motor" : (v ? "Sail" : ""); },
    bilgeHull: function (v) { return { motor: "Motor boat", motor_multi: "Motor boat", sail_mono: "Sailing monohull", sail_multi: "Sailing multihull" }[v] || ""; },
    footHull:  function (v) { return v === "sail_mono" ? "Sailing monohull" : (v ? "Non-sailing" : ""); },
    avoidProp: function (v) { return PROP_AVOID[v] || ""; }
  };

  /*
   * FIELDS — listed in the order the essential requirements first need them.
   * use: [toolId, selector, converter?, matchMode?, pageDefault?]
 *   pageDefault: a starting value the tool page puts in the field itself; it may be replaced
 *   selector null: the tool page reads the boat data itself (builder's plate generator)
   *   matchMode for selects: "cat" (A–D design category), "country" (text holds "(XX)"), "start" (option text starts with value)
   * core: true fields apply to every tool and always show.
 * optional: true fields do not count towards a tool being complete.
   */
  var FIELDS = [
    { key: "projectNumber", label: "Project number", type: "text", core: true, hint: "Used to file your data and on every report",
      use: [["win", "#projectNumber"], ["maxload", "#projectNumber"], ["avoid", "#projectNumber"], ["fuel", "#projectNumber"], ["cable", "#projectNumber"], ["vent", "#projectNumber"]] },
    { key: "manufacturer", label: "Manufacturer", type: "text", core: true, hint: "Registered name or trade mark",
      use: [["plate", null], ["reboard", "#craftManufacturer"], ["vis", "#mfr"], ["maxload", "#manufacturer"], ["window", "#proj-manufacturer"], ["footbasin", "#manufacturer"]] },
    { key: "model", label: "Model name", type: "text", core: true, hint: "Model designation, for example Voyager 650",
      use: [["plate", null], ["reboard", "#craftName"], ["vis", "#name"], ["maxload", "#model"], ["window", "#proj-model"], ["bilge", "#vessel"], ["footbasin", "#modelName"], ["cleat", "#vesselName"]] },
    { key: "designCategory", label: "Design category", type: "select", core: true, esr: "1",
      options: [["A", "A — Ocean"], ["B", "B — Offshore"], ["C", "C — Inshore"], ["D", "D — Sheltered waters"]],
      hint: "Highest design category claimed",
      use: [["maxload", "#designCategory", null, "cat"], ["window", "#proj-cat", null, "cat"], ["bilge", "#category", null, "cat"], ["footbasin", "#designCategory", null, "cat"], ["cleat", "#designCategory", null, "cat"]] },
    { key: "boatType", label: "Type of boat", type: "select",
      options: [["motor", "Motor boat, monohull"], ["motor_multi", "Motor boat, multihull (power catamaran)"], ["sail_mono", "Sailing monohull"], ["sail_multi", "Sailing multihull"], ["inflatable", "Inflatable boat or RIB"]],
      use: [["maxload", "#boatType"], ["window", "#proj-craft", "windowHull"], ["bilge", "#boattype", "bilgeHull"], ["footbasin", "#craftType", "footHull", "start"]] },
    { key: "engineFuel", label: "Propulsion engine", type: "select", core: true,
      options: [["none", "No engine (sail or paddle only)"], ["diesel", "Diesel"], ["petrol", "Petrol"], ["electric", "Electric"], ["hybrid", "Hybrid (diesel and electric)"], ["lpg", "LPG (gas) engine"]],
      hint: "The fuel of the propulsion engine(s). Decides which standards and requirements apply",
      use: [] },
    { key: "generator", label: "Generator on board", type: "select", core: true,
      options: [["none", "No generator"], ["diesel", "Diesel generator"], ["petrol", "Petrol generator"], ["lpg", "LPG generator"]],
      hint: "Also a small back-up generator, for example on an electric boat",
      use: [] },
    { key: "modelYear", label: "Model year", type: "number", hint: "The model year is the year the boat is intended to be placed on the market. The manufacturer gives it to the model (ISO 10087). It is the last part of the WIN and can differ from the year the boat is built: a boat built in October 2026 can be model year 2027. Four digits, for example 2027",
      use: [["win", "#modelYear", "yy"], ["reboard", "#modelYear"]] },

    /* ESR 2.1 */
    { key: "winCraftType", label: "Craft type for the WIN", type: "select",
      options: [["Monohull with Transom", "Monohull with transom"], ["Monohull without Transom", "Monohull without transom"], ["Catamaran", "Catamaran"], ["Trimaran", "Trimaran"], ["Inflatable Boat", "Inflatable boat"]],
      use: [["win", "#craftType", null, "start"]] },
    { key: "countryCode", label: "Manufacturer country code", type: "text", unit: "2 letters", hint: "ISO country code, for example ZA",
      use: [["win", "#countryCode", null, "country"]] },
    { key: "manufacturerCode", label: "Manufacturer code (MIC)", type: "text", unit: "3 characters",
      use: [["win", "#manufacturerCode"]] },
    { key: "serialNumber", label: "Hull serial number", type: "text", unit: "5 characters",
      use: [["win", "#serialNumber"]] },
    { key: "buildMonth", label: "Month of manufacture", type: "select",
      options: [["1","January"],["2","February"],["3","March"],["4","April"],["5","May"],["6","June"],["7","July"],["8","August"],["9","September"],["10","October"],["11","November"],["12","December"]],
      use: [["win", "#manufactureMonth", null, "month"]] },
    { key: "buildYear", label: "Year of manufacture", type: "number",
      use: [["win", "#manufactureYear"]] },

    /* ESR 2.2 */
    { key: "contactAddress", label: "Manufacturer contact address", type: "textarea",
      use: [["plate", null]] },
    { key: "notifiedBody", label: "Notified body number", type: "text", optional: true, hint: "Only if a notified body is involved, for example 0123",
      use: [["plate", null]] },
    { key: "maxPersons", label: "Maximum number of persons", type: "number", unit: "persons", hint: "For the highest design category",
      use: [["plate", null], ["maxload", "#crewAdults"], ["vent", "#persons", null, null, "2"]] },
    { key: "maxLoad", label: "Maximum recommended load", type: "number", unit: "kg", hint: "ESR 3.6, excluding full fixed tanks",
      use: [["plate", null]] },
    { key: "propulsion", label: "Engine installation", type: "select",
      options: [["none", "No engine"], ["outboard", "Outboard engine"], ["sterndrive", "Sterndrive, separate exhaust"], ["sterndrive_ie", "Sterndrive with integral exhaust (through the drive)"], ["inboard_prop", "Inboard with propeller"], ["inboard_shaft", "Inboard with shaft drive"], ["saildrive", "Sail-drive"], ["waterjet", "Waterjet"], ["pod", "Pod drive"], ["other", "Other"]],
      use: [["plate", null], ["avoid", "#propulsionType", "avoidProp"]] },
    { key: "engineCount", label: "Number of propulsion engines", type: "number", optional: true, hint: "1 for a single engine, 2 for twin engines",
      use: [] },
    { key: "maxPower", label: "Maximum rated engine power", type: "number", optional: true, hint: "Leave empty if there is no engine", unit: "kW",
      use: [["plate", null]] },

    /* ESR 2.3 */
    { key: "lh", label: "Length of hull, LH", type: "number", unit: "m", hint: "ISO 8666",
      use: [["reboard", "#lh"], ["vis", "#lh"], ["maxload", "#lh"], ["window", "#proj-lh", null, null, "12"], ["bilge", "#hulllen"], ["footbasin", "#hullLength", "mToMm"], ["cleat", "#hullLength"], ["avoid", "#hullLength"]] },
    { key: "maxSpeed", label: "Maximum speed", type: "number", unit: "knots",
      use: [["reboard", "#maxSpeed"], ["avoid", "#maxSpeed"]] },

    { key: "lwl", label: "Length of waterline, LWL", type: "number", unit: "m", hint: "ISO 8666, boat upright at design trim. For a multihull, the longest individual hull",
      use: [["maxload", "#lwl"], ["cleat", "#waterlineLength"], ["avoid", "#waterlileLength"]] },

    /* ESR 3.9 */
    { key: "mldc", label: "Loaded displacement mass, mLDC", type: "number", unit: "kg", hint: "ISO 8666",
      use: [["cleat", "#loadedMass"]] },

    /* ESR 5.2 */
    { key: "tankManufacturer", label: "Fuel tank manufacturer", type: "text", optional: true, hint: "Only for a tank bought ready-made (off the shelf): the company that made it. Leave empty for a tank you build yourself", use: [["fuel", "#tankManufacturer"]] },
    { key: "tankModel", label: "Fuel tank model or type", type: "text", optional: true, hint: "Only for a tank bought ready-made (off the shelf): the model or type reference on the tank maker's Declaration of Conformity (ISO 21487). Leave empty for a tank you build yourself", use: [["fuel", "#tankModel"]] },
    { key: "tankMaterial", label: "Fuel tank material", type: "select",
      options: [["Aluminium alloy", "Metal: aluminium alloy"], ["Stainless steel", "Metal: stainless steel"], ["Copper", "Metal: copper, tin-coated inside"], ["Mild steel", "Metal: mild steel, hot-dip zinc-coated"], ["Aluminized steel", "Metal: aluminized steel"],
                ["hdpe", "Plastic: high-density polyethylene (HDPE), for example rotomoulded"], ["ldpe", "Plastic: low-density polyethylene (LDPE)"], ["frp", "Plastic: fibre-reinforced plastic (FRP / GRP), non-integral"], ["other-nm", "Other non-metallic"]],
      use: [["fuel", "#tankMaterial", null, "start"]] },
    { key: "tankCapacity", label: "Fuel tank capacity", type: "number", unit: "L", use: [["fuel", "#tankCapacity"]] },

    /* ESR 5.3 */
    { key: "dcVoltage", label: "DC system voltage", type: "select", unit: "V",
      options: [["12", "12 V DC"], ["24", "24 V DC"], ["48", "48 V DC"]],
      use: [["cable", "#systemVoltage", "dcText"], ["vdrop", "#vdc"]] },
    { key: "acPhase", label: "AC system", type: "select", optional: true,
      options: [["none", "No AC system"], ["single", "Single-phase AC"], ["three", "Three-phase AC"]],
      hint: "Three-phase installations can also use EN 60092-507", use: [["vdrop", null]] },
    { key: "acVoltage", label: "AC system voltage", type: "number", optional: true, unit: "V", hint: "Leave empty if there is no AC system",
      use: [["vdrop", "#vac", null, null, "230"]] },

    /* ESR 5.5 */
    { key: "lpgUnflued", label: "Unflued LPG appliances, total rating U", type: "number", unit: "kW", use: [["vent", "#unfluedRating", null, null, "0"]] },
    { key: "lpgFlued", label: "Open-flued LPG appliances, total rating F", type: "number", optional: true, unit: "kW", use: [["vent", "#fluedRating", null, null, "0"]] }
  ];

  /* ---------- storage ---------- */
  function readStore() {
    try { var s = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); if (s && s.boats) return s; } catch (e) {}
    return { current: "", boats: {} };
  }
  function writeStore(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }
  function currentBoat(s) { s = s || readStore(); return s.boats[s.current] || null; }

  function toolById(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].id === id) return TOOLS[i]; return null; }
  function fieldsForTool(id) {
    return FIELDS.filter(function (f) { return f.use.some(function (u) { return u[0] === id; }); });
  }
  function toolsForField(f) {
    var ids = []; f.use.forEach(function (u) { if (ids.indexOf(u[0]) < 0) ids.push(u[0]); });
    return TOOLS.filter(function (t) { return ids.indexOf(t.id) >= 0; });
  }

  /* ---------- filling a tool page ---------- */
  function norm(x) { return String(x == null ? "" : x).toLowerCase().replace(/&mdash;|—|–/g, "-").replace(/\s+/g, " ").trim(); }

  function pickOption(sel, v, mode) {
    var opts = Array.prototype.slice.call(sel.options), want = norm(v), i, o, t;
    for (i = 0; i < opts.length; i++) { o = opts[i]; if (norm(o.value) === want || norm(o.textContent) === want) return o; }
    for (i = 0; i < opts.length; i++) {
      o = opts[i]; t = norm(o.textContent);
      if (mode === "cat" && (new RegExp("^(category )?" + want + "\\b")).test(t)) return o;
      if (mode === "country" && t.indexOf("(" + want + ")") >= 0) return o;
      if (mode === "month" && (norm(o.value) === String(parseInt(want, 10)) || norm(o.value) === ("0" + want).slice(-2))) return o;
      if ((mode === "start" || !mode) && want && t.indexOf(want) === 0) return o;
    }
    if (mode === "month") {
      var idx = parseInt(want, 10);
      var named = opts.filter(function (x) { return x.value !== "" && !/select/i.test(x.textContent); });
      if (named.length === 12 && named[idx - 1]) return named[idx - 1];
    }
    return null;
  }

  function isEmpty(el) {
    if (el.tagName === "SELECT") {
      /* a select counts as empty while it still shows the page's own starting option */
      var def = 0;
      for (var k = 0; k < el.options.length; k++) if (el.options[k].defaultSelected) { def = k; break; }
      return el.selectedIndex <= def;
    }
    return String(el.value).trim() === "";
  }

  function fire(el) {
    ["input", "change"].forEach(function (n) { try { el.dispatchEvent(new Event(n, { bubbles: true })); } catch (e) {} });
  }

  function markFilled(el) {
    if (el.getAttribute("data-bpm-filled")) return;
    el.setAttribute("data-bpm-filled", "1");
    el.style.boxShadow = "inset 3px 0 0 #c8860a";
    el.title = "Pre-filled from the Boat Data Sheet. You can change it here.";
  }

  function pageMatches(page) {
    var p = decodeURIComponent(location.pathname).replace(/^\/+/, "");
    return p === page || p.slice(-(page.length + 1)) === "/" + page;
  }

  function fillPage() {
    var tool = null, i, j;
    for (i = 0; i < TOOLS.length && !tool; i++)
      for (j = 0; j < TOOLS[i].pages.length; j++) if (pageMatches(TOOLS[i].pages[j])) { tool = TOOLS[i]; break; }
    if (!tool) return { tool: null, filled: [] };

    var store = readStore(), boat = currentBoat(store);
    var data = (boat && boat.values) || {};
    var filled = [];

    FIELDS.forEach(function (f) {
      f.use.forEach(function (u) {
        if (u[0] !== tool.id || !u[1]) return;
        var selector = typeof u[1] === "function" ? u[1](data) : u[1];
        var el = document.querySelector(selector);
        if (!el) return;
        var raw = data[f.key];
        var plain = !u[2] && u[3] !== "cat" && u[3] !== "country" && u[3] !== "month" && el.tagName !== "SELECT" && typeof u[1] !== "function";

        var pageDefault = u[4] !== undefined && String(el.value) === String(u[4]) && String(raw) !== String(u[4]);
        if (raw !== undefined && raw !== "" && (isEmpty(el) || pageDefault)) {
          var v = u[2] ? conv[u[2]](raw) : raw;
          if (el.tagName === "SELECT") {
            var o = pickOption(el, v, u[3]);
            if (o) { el.value = o.value; o.selected = true; fire(el); markFilled(el); filled.push(f.key); }
          } else { el.value = v; fire(el); markFilled(el); filled.push(f.key); }
        }

        /* write plain edits back to the sheet so the two never disagree */
        if (plain && !el.getAttribute("data-bpm-listen")) {
          el.setAttribute("data-bpm-listen", "1");
          el.addEventListener("change", function () {
            var s = readStore(); if (!s.current || !s.boats[s.current]) return;
            s.boats[s.current].values[f.key] = el.value;
            s.boats[s.current].updated = new Date().toISOString();
            writeStore(s);
          });
        }
      });
    });
    return { tool: tool, filled: filled, boat: data.projectNumber || (boat ? "your project" : "") };
  }

  function chip(res) {
    if (!res.tool || document.getElementById("bpm-boatdata-chip")) return;
    var c = document.createElement("a");
    c.id = "bpm-boatdata-chip";
    c.href = SHEET;
    c.target = "_blank";
    c.rel = "noopener";
    c.textContent = res.boat ? ("Boat data: " + res.boat + (res.filled ? " · " + res.filled + " fields pre-filled" : "") + " · Open sheet") : "Fill the Boat Data Sheet once to pre-fill this tool";
    c.setAttribute("style", "position:fixed;right:14px;bottom:14px;z-index:99999;background:#1a2e4a;color:#fff;text-decoration:none;" +
      "font:600 13px/1.3 Barlow,Arial,sans-serif;padding:8px 12px;border-radius:6px;border-left:4px solid #c8860a;box-shadow:0 2px 8px rgba(0,0,0,.25);max-width:calc(100vw - 28px)");
    var printCss = document.createElement("style");
    printCss.textContent = "@media print{#bpm-boatdata-chip{display:none!important}}";
    document.head.appendChild(printCss);
    document.body.appendChild(c);
  }

  function boot() {
    if (root.BPM_BOATDATA_SHEET) return;            /* the sheet itself does not self-fill */
    var tries = 0, best = { tool: null, keys: {} };
    /* some tools draw their fields after load, so retry briefly */
    (function run() {
      var r = fillPage();
      if (r.tool) { best.tool = r.tool; best.boat = r.boat; r.filled.forEach(function (k) { best.keys[k] = 1; }); }
      if (++tries < 6) setTimeout(run, tries < 3 ? 300 : 900);
      else { best.filled = Object.keys(best.keys).length; chip(best); }
    })();
  }

  root.BPMBoatData = {
    SITE: SITE, STORE_KEY: STORE_KEY, TOOLS: TOOLS, FIELDS: FIELDS,
    readStore: readStore, writeStore: writeStore, currentBoat: currentBoat,
    toolById: toolById, fieldsForTool: fieldsForTool, toolsForField: toolsForField,
    fillPage: fillPage
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window);
