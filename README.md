# Blue Peter Marine — Client Tools

A private portal of marine compliance tools (RCD reference, calculators,
checklists, generators and test reports) for Blue Peter Marine clients.

## Using it
Open **index.html** (or the published web address). Enter the access code,
then pick a tool. Everything else lives in the `tools/` folder.

## Access code
Set in `tools/access-gate.js` — change the `CODE` value, or set it to `null`
to remove the gate. Note: this is a light deterrent, not strong security.

## Adding a tool
1. Put the tool's `.html` file in the `tools/` folder.
2. Add one line to the `TOOLS` list in `index.html`:
   `{ cat:"Calculators", name:"Tool name", desc:"Short description", file:"tools/your-file.html" },`
