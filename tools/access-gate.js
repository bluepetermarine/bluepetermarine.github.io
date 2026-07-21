/* Blue Peter Marine — shared client access gate.
   Referenced by portal.html and every tool, so the access code is required
   whichever file is opened, and only needs to be entered once per browser session.

   To change the access code, edit CODE below (this is the only place).
   To switch the gate off entirely, set CODE = null.

   Note: this is a light deterrent for sharing with clients, not strong security —
   anyone who views the page source can read the code. For true protection, host
   this folder behind a proper login on your server. */

(function () {
  var CODE = "bluepeter";
  var KEY = "bpm_auth";

  if (CODE === null) return;
  function authed() { try { return sessionStorage.getItem(KEY) === "ok"; } catch (e) { return false; } }
  if (authed()) return;

  function mount() {
    if (document.getElementById("bpmGate")) return;
    var g = document.createElement("div");
    g.id = "bpmGate";
    g.setAttribute("style",
      "position:fixed;inset:0;background:linear-gradient(150deg,#16283f,#1a2e4a);" +
      "z-index:2147483647;display:flex;align-items:center;justify-content:center;" +
      "font-family:Arial,Helvetica,sans-serif;padding:20px");
    g.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:32px 30px;max-width:360px;width:100%;' +
      'text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.35)">' +
        '<div style="font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:12px;' +
        'color:#c8860a;margin-bottom:10px">Blue Peter Marine</div>' +
        '<h2 style="color:#1a2e4a;font-size:22px;margin:0 0 6px">Client access</h2>' +
        '<p style="color:#5a7080;font-size:14px;margin:0 0 16px">Enter your access code to continue.</p>' +
        '<input id="bpmGateInput" type="password" placeholder="Access code" autocomplete="off" ' +
        'style="width:100%;padding:11px 12px;border:1px solid #ccd5dc;border-radius:8px;font-size:16px;text-align:center;box-sizing:border-box">' +
        '<button id="bpmGateBtn" style="margin-top:12px;width:100%;background:#c8860a;color:#fff;border:none;' +
        'padding:12px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer">Enter</button>' +
        '<div id="bpmGateErr" style="color:#b02020;font-size:13px;margin-top:8px;min-height:16px"></div>' +
      '</div>';
    document.documentElement.style.overflow = "hidden";
    (document.body || document.documentElement).appendChild(g);

    var inp = document.getElementById("bpmGateInput");
    var err = document.getElementById("bpmGateErr");
    function go() {
      if ((inp.value || "").trim() === CODE) {
        try { sessionStorage.setItem(KEY, "ok"); } catch (e) {}
        document.documentElement.style.overflow = "";
        if (g.parentNode) g.parentNode.removeChild(g);
      } else {
        err.textContent = "Incorrect code. Please try again.";
        inp.select();
      }
    }
    document.getElementById("bpmGateBtn").onclick = go;
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    inp.focus();
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
