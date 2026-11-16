/*!
 * Blue Peter Marine — RCD Navigator language switch (EN / FR)
 *
 * One page, two languages. English is the source and stays in the page.
 * Other languages are added as a list of texts, keyed by a short name.
 * The page opens in English; the client's choice is remembered for all pages.
 *
 * In the page:
 *   <script src="bpm-i18n.js"></script>
 *   <h1 data-i18n="title">Boat Data Sheet</h1>                       text or HTML of an element
 *   <input data-i18n-attr="placeholder:phName,title:tipName">        attributes of an element
 *   <div data-i18n-switch></div>                                      where the EN | FR button goes
 *                                                                     (without it: top right corner)
 *   <script>BPMI18n.add("fr", { title: "Fiche de données du bateau" });</script>
 *
 * In scripts:
 *   BPMI18n.t("saved", "Saved in this browser")                      English given as the fallback
 *   BPMI18n.t("count", "{n} of {of}", { n: 2, of: 5 })               with values
 *   BPMI18n.onChange(function (lang) { redraw(); })                  redraw what a script built
 *
 * Rules that keep saved data safe:
 *   1. Never store translated text. Store the value ("motor"), show the label in the chosen language.
 *   2. Keys in exported files (JSON) stay the same in every language.
 *
 * A link can force a language once: page.html?lang=fr
 */
(function (root) {
  "use strict";

  var KEY = "bpm.lang";
  var LANGS = ["en", "fr"];
  var NAMES = { en: "English", fr: "Français" };
  var dict = {};
  var listeners = [];

  function stored() {
    try { var v = localStorage.getItem(KEY); if (LANGS.indexOf(v) >= 0) return v; } catch (e) {}
    return "en";
  }
  function fromUrl() {
    var m = /[?&]lang=([a-z]{2})\b/i.exec(root.location ? root.location.search : "");
    return m && LANGS.indexOf(m[1].toLowerCase()) >= 0 ? m[1].toLowerCase() : null;
  }

  var api = {
    lang: "en",
    langs: LANGS,

    add: function (lang, texts) {
      var d = dict[lang] || (dict[lang] = {});
      for (var k in texts) if (Object.prototype.hasOwnProperty.call(texts, k)) d[k] = texts[k];
      if (lang === api.lang && root.document && document.readyState !== "loading") api.apply();
    },

    has: function (key) { return !!(dict[api.lang] && dict[api.lang][key] != null); },

    /* text for scripts: the chosen language if it has the key, otherwise the English given */
    t: function (key, english, values) {
      var s = (api.lang !== "en" && dict[api.lang] && dict[api.lang][key] != null) ? dict[api.lang][key] : english;
      if (values) s = String(s).replace(/\{(\w+)\}/g, function (m, name) { return values[name] != null ? values[name] : m; });
      return s;
    },

    /* put the chosen language into every marked element under node (default: the whole page) */
    apply: function (node) {
      node = node || document;
      var d = api.lang === "en" ? null : dict[api.lang];
      var i, els = node.querySelectorAll("[data-i18n]");
      for (i = 0; i < els.length; i++) {
        var el = els[i], key = el.getAttribute("data-i18n");
        if (el.__bpmEn === undefined) el.__bpmEn = el.innerHTML;
        var html = (d && d[key] != null) ? d[key] : el.__bpmEn;
        if (el.innerHTML !== html) el.innerHTML = html;
      }
      els = node.querySelectorAll("[data-i18n-attr]");
      for (i = 0; i < els.length; i++) {
        var e2 = els[i], pairs = e2.getAttribute("data-i18n-attr").split(",");
        if (!e2.__bpmEnAttr) e2.__bpmEnAttr = {};
        for (var j = 0; j < pairs.length; j++) {
          var p = pairs[j].split(":"), attr = p[0].trim(), k2 = (p[1] || "").trim();
          if (!attr || !k2) continue;
          if (e2.__bpmEnAttr[attr] === undefined) e2.__bpmEnAttr[attr] = e2.getAttribute(attr) || "";
          e2.setAttribute(attr, (d && d[k2] != null) ? d[k2] : e2.__bpmEnAttr[attr]);
        }
      }
      document.documentElement.setAttribute("lang", api.lang);
      var btns = document.querySelectorAll(".bpm-lang button");
      for (i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-lang") === api.lang ? "true" : "false");
    },

    set: function (lang, quiet) {
      if (LANGS.indexOf(lang) < 0 || lang === api.lang) return;
      api.lang = lang;
      if (!quiet) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
      if (root.document) api.apply();
      listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
    },

    onChange: function (fn) { listeners.push(fn); },

    /* the EN | FR button */
    mount: function (where) {
      if (document.querySelector(".bpm-lang")) return;
      var css = document.createElement("style");
      css.textContent =
        ".bpm-lang{display:inline-flex;border:1px solid #1a2e4a;border-radius:6px;overflow:hidden;background:#fff}" +
        ".bpm-lang.bpm-lang-fixed{position:fixed;top:10px;right:10px;z-index:99998;box-shadow:0 1px 5px rgba(0,0,0,.2)}" +
        ".bpm-lang button{all:unset;cursor:pointer;font:700 13px/1 Barlow,Arial,sans-serif;letter-spacing:.4px;padding:7px 10px;color:#1a2e4a;background:#fff}" +
        ".bpm-lang button+button{border-left:1px solid #1a2e4a}" +
        ".bpm-lang button[aria-pressed=true]{background:#1a2e4a;color:#fff}" +
        ".bpm-lang button:focus-visible{outline:2px solid #c8860a;outline-offset:-2px}" +
        "@media print{.bpm-lang{display:none!important}}";
      document.head.appendChild(css);
      var box = document.createElement("div");
      box.className = "bpm-lang" + (where ? "" : " bpm-lang-fixed");
      box.setAttribute("role", "group");
      box.setAttribute("aria-label", "Language / Langue");
      LANGS.forEach(function (l) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("data-lang", l); b.setAttribute("lang", l);
        b.title = NAMES[l]; b.textContent = l.toUpperCase();
        b.setAttribute("aria-pressed", l === api.lang ? "true" : "false");
        b.onclick = function () { api.set(l); };
        box.appendChild(b);
      });
      (where || document.body).appendChild(box);
    }
  };

  api.lang = fromUrl() || stored();
  if (fromUrl()) { try { localStorage.setItem(KEY, api.lang); } catch (e) {} }

  /* the choice made on another open page of the Navigator is followed here too */
  if (root.addEventListener) root.addEventListener("storage", function (e) {
    if (e.key === KEY && LANGS.indexOf(e.newValue) >= 0) api.set(e.newValue, true);
  });

  function start() { api.mount(document.querySelector("[data-i18n-switch]")); api.apply(); }
  if (root.document) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  }

  root.BPMI18n = api;
})(window);
