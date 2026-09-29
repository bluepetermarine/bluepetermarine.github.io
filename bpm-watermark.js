/*
  RCD Navigator, Blue Peter Marine
  Client watermark for everything a signed-in client prints or downloads.

  The client's name and project number are stored by client.html when the
  client signs in. Pages that include this script then add a light,
  diagonal "Prepared for ..." watermark to:
    1. anything printed or saved as PDF from the browser
    2. PNG / JPEG images downloaded from the page (download links and canvas exports)
    3. images saved with right-click or long-press (pages marked data-images="1")
    4. CSV exports (a "Prepared for ..." first line)
    5. PDF documents from this site opened through a link (stamped on every page),
       except the IMCI checklists in tools/checklists/ and any RSG document
       (file name containing "RSG"), which always open unmarked
  Visitors who have not signed in as a client get a copyright watermark instead:
  "(c) <year> Blue Peter Marine - www.ceinspector.com - Not for reproduction".
*/
(function () {
  "use strict";

  var info = null;
  try { info = JSON.parse(localStorage.getItem("bpm_client") || "null"); } catch (e) {}
  var isClient = !!(info && info.n);

  var TEXT = isClient
    ? "Prepared for " + info.n + (info.p ? " \u00B7 Project " + info.p : "") + " \u00B7 Blue Peter Marine"
    : "\u00A9 " + new Date().getFullYear() + " Blue Peter Marine \u00B7 www.ceinspector.com \u00B7 Not for reproduction";
  var NAVY = "26,46,74";
  var PDF_LIB = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
  var thisScript = document.currentScript;
  var imagesOptIn = thisScript && thisScript.getAttribute("data-images") === "1";
  window.BPM_WATERMARK = TEXT;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 1. print and save as PDF ---------- */
  function addPrintLayer() {
    if (document.getElementById("bpm-wm-print")) return;
    var st = document.createElement("style");
    st.textContent =
      "#bpm-wm-print{display:none}" +
      "@media print{#bpm-wm-print{display:block;position:fixed;top:0;left:0;width:100%;height:100%;" +
      "z-index:2147483647;pointer-events:none}}";
    document.head.appendChild(st);
    var w = Math.max(380, TEXT.length * 8 + 80);
    var d = document.createElement("div");
    d.id = "bpm-wm-print";
    d.setAttribute("aria-hidden", "true");
    d.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
      '<defs><pattern id="bpm-wm-pat" width="' + w + '" height="170" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">' +
      '<text x="10" y="60" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="rgb(' + NAVY + ')" fill-opacity="0.13">' + esc(TEXT) + "</text>" +
      '<text x="' + (10 - w / 2) + '" y="145" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="rgb(' + NAVY + ')" fill-opacity="0.13">' + esc(TEXT) + "</text>" +
      '<text x="' + (10 + w / 2) + '" y="145" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="rgb(' + NAVY + ')" fill-opacity="0.13">' + esc(TEXT) + "</text>" +
      "</pattern></defs>" +
      '<rect width="100%" height="100%" fill="url(#bpm-wm-pat)"/></svg>';
    document.body.appendChild(d);
  }
  if (document.body) addPrintLayer();
  else document.addEventListener("DOMContentLoaded", addPrintLayer);

  /* ---------- shared: stamp a canvas ---------- */
  function stamp(ctx, w, h) {
    ctx.save();
    var fs = Math.max(11, Math.round(Math.min(w, h) / 30));
    ctx.font = fs + "px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "rgba(" + NAVY + ",0.12)";
    ctx.textBaseline = "middle";
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    var tw = ctx.measureText(TEXT).width + fs * 3;
    var lh = fs * 5;
    var R = Math.sqrt(w * w + h * h) / 2 + tw;
    var row = 0;
    for (var y = -R; y < R; y += lh, row++) {
      for (var x = -R - (row % 2) * tw / 2; x < R; x += tw) ctx.fillText(TEXT, x, y);
    }
    ctx.restore();
  }

  var P = HTMLCanvasElement.prototype;
  var origToDataURL = P.toDataURL;
  var origToBlob = P.toBlob;

  function markedCopy(src, width, height) {
    var k = document.createElement("canvas");
    k.__bpm = true;
    k.width = width;
    k.height = height;
    var x = k.getContext("2d");
    x.drawImage(src, 0, 0, width, height);
    stamp(x, width, height);
    return k;
  }

  /* ---------- 2a. canvas exports ---------- */
  P.toDataURL = function () {
    if (this.__bpm || !this.width || !this.height) return origToDataURL.apply(this, arguments);
    try { return origToDataURL.apply(markedCopy(this, this.width, this.height), arguments); }
    catch (e) { return origToDataURL.apply(this, arguments); }
  };
  if (origToBlob) {
    P.toBlob = function () {
      if (this.__bpm || !this.width || !this.height) return origToBlob.apply(this, arguments);
      try { return origToBlob.apply(markedCopy(this, this.width, this.height), arguments); }
      catch (e) { return origToBlob.apply(this, arguments); }
    };
  }

  function imageTypeFor(name, href) {
    if (/\.jpe?g$/i.test(name || "") || /^data:image\/jpe?g/i.test(href || "")) return "image/jpeg";
    return "image/png";
  }

  function markedImageURL(img, type) {
    var k = markedCopy(img, img.naturalWidth, img.naturalHeight);
    return origToDataURL.call(k, type || "image/png", 0.92);
  }

  /* ---------- 2b. image download links ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[download]") : null;
    if (!a || a.getAttribute("data-bpm-done")) return;
    var href = a.getAttribute("href") || "";
    var name = a.getAttribute("download") || "download.png";
    var isImg = /^data:image\/(png|jpe?g|webp)/i.test(href) ||
      (/^blob:/i.test(href) && /\.(png|jpe?g|webp)$/i.test(name)) ||
      (!/^(data|blob):/i.test(href) && /\.(png|jpe?g|webp)(\?|#|$)/i.test(href));
    if (!isImg) return;
    e.preventDefault();
    e.stopPropagation();
    var img = new Image();
    img.onload = function () {
      try {
        var type = imageTypeFor(name, href);
        var out = document.createElement("a");
        out.href = markedImageURL(img, type);
        out.download = name;
        out.setAttribute("data-bpm-done", "1");
        document.body.appendChild(out);
        out.click();
        out.remove();
      } catch (err) {
        a.setAttribute("data-bpm-done", "1"); a.click(); a.removeAttribute("data-bpm-done");
      }
    };
    img.onerror = function () { a.setAttribute("data-bpm-done", "1"); a.click(); a.removeAttribute("data-bpm-done"); };
    img.src = href;
  }, true);

  /* ---------- 3. right-click / long-press save on label pages ---------- */
  if (imagesOptIn) {
    var swapImage = function (e) {
      var img = e.target;
      if (!img || img.tagName !== "IMG" || img.__bpmMarked) return;
      if (!img.complete || img.naturalWidth < 120) return;
      try {
        var type = /^data:image\/jpe?g/i.test(img.src) ? "image/jpeg" : "image/png";
        var url = markedImageURL(img, type);
        img.__bpmMarked = true;
        if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
        img.src = url;
      } catch (err) {}
    };
    document.addEventListener("contextmenu", swapImage, true);
    document.addEventListener("dragstart", swapImage, true);
    document.addEventListener("touchstart", function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG") setTimeout(function () { swapImage({ target: t }); }, 350);
    }, { capture: true, passive: true });
  }

  /* ---------- 4. CSV exports ---------- */
  var OrigBlob = window.Blob;
  function MarkedBlob(parts, opts) {
    try {
      if (parts && opts && opts.type && /csv/i.test(opts.type)) {
        parts = ['"' + TEXT.replace(/"/g, '""') + '"\n'].concat(parts);
      }
    } catch (e) {}
    return new OrigBlob(parts, opts);
  }
  MarkedBlob.prototype = OrigBlob.prototype;
  window.Blob = MarkedBlob;

  /* ---------- 5. PDF documents from this site ---------- */
  var pdfLibPromise = null;
  function loadPdfLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (!pdfLibPromise) {
      pdfLibPromise = new Promise(function (res, rej) {
        var s = document.createElement("script");
        s.src = window.BPM_PDF_LIB || PDF_LIB;
        s.onload = function () { res(window.PDFLib); };
        s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    return pdfLibPromise;
  }

  var pdfCache = {};
  function stampPdf(url) {
    if (pdfCache[url]) return pdfCache[url];
    pdfCache[url] = loadPdfLib().then(function (L) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error("fetch failed");
        return r.arrayBuffer();
      }).then(function (buf) {
        return L.PDFDocument.load(buf, { ignoreEncryption: true });
      }).then(function (doc) {
        return doc.embedFont(L.StandardFonts.Helvetica).then(function (font) {
          var txt = TEXT;
          try { font.widthOfTextAtSize(txt, 10); }
          catch (e) { txt = TEXT.normalize("NFD").replace(/[^\x20-\x7E\u00B7]/g, ""); }
          doc.getPages().forEach(function (page) {
            var sz = page.getSize();
            var fs = Math.max(8, Math.min(sz.width, sz.height) / 45);
            var tw = font.widthOfTextAtSize(txt, fs) + fs * 4;
            var lh = fs * 7;
            var row = 0;
            for (var y = -sz.width; y < sz.height + sz.width; y += lh, row++) {
              for (var x = -sz.height - (row % 2) * tw / 2; x < sz.width + sz.height; x += tw) {
                page.drawText(txt, {
                  x: x, y: y, size: fs, font: font,
                  color: L.rgb(26 / 255, 46 / 255, 74 / 255),
                  opacity: 0.12, rotate: L.degrees(30)
                });
              }
            }
          });
          return doc.save();
        });
      }).then(function (bytes) {
        return URL.createObjectURL(new OrigBlob([bytes], { type: "application/pdf" }));
      });
    });
    pdfCache[url].catch(function () { delete pdfCache[url]; });
    return pdfCache[url];
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var raw = a.getAttribute("href") || "";
    if (!/\.pdf(\?|#|$)/i.test(raw)) return;
    var abs;
    try { abs = new URL(raw, location.href); } catch (err) { return; }
    if (abs.origin !== location.origin) return;
    if (/\/tools\/checklists\//i.test(abs.pathname)) return; // IMCI checklists open unmarked
    if (/rsg/i.test(abs.pathname.split("/").pop())) return;      // RSG documents open unmarked
    e.preventDefault();
    e.stopPropagation();
    var hash = abs.hash || "";
    abs.hash = "";
    var file = abs.pathname.split("/").pop() || "document.pdf";
    var win = window.open("", "_blank");
    if (win) {
      try {
        win.document.write('<title>' + esc(decodeURIComponent(file)) + '</title>' +
          '<p style="font-family:Arial,sans-serif;color:#1a2e4a;padding:2em">Preparing your document\u2026</p>');
      } catch (err) {}
    }
    stampPdf(abs.href).then(function (blobUrl) {
      if (a.hasAttribute("download")) {
        var d = document.createElement("a");
        d.href = blobUrl; d.download = a.getAttribute("download") || decodeURIComponent(file);
        document.body.appendChild(d); d.click(); d.remove();
        if (win) win.close();
      } else if (win) { win.location.href = blobUrl + hash; }
      else { location.href = blobUrl + hash; }
    }).catch(function () {
      if (win) win.location.href = abs.href + hash;
      else location.href = abs.href + hash;
    });
  }, true);
})();
