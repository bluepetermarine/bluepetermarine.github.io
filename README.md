# Blue Peter Marine — Client Tools

A private portal of marine compliance tools (RCD reference, calculators,
checklists, generators and test reports) for Blue Peter Marine clients.

## Using it
Open **index.html** (or the published web address). Enter the access code,
then pick a tool. Everything else lives in the `tools/` folder.

## Client access
Clients log in on `client.html`. The client list is `keys.json` (encrypted,
do not edit by hand). See **Readme to set up client.md** for how to add or
remove a client.

## Adding a tool
1. Put the tool's `.html` file in the `tools/` folder.
2. Add one line to the `TOOLS` list in `index.html`:
   `{ cat:"Calculators", name:"Tool name", desc:"Short description", file:"tools/your-file.html" },`
