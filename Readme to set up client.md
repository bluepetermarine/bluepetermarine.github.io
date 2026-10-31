Readme to set up client
=======================

Blue Peter Marine, RCD Navigator client access


Where clients are set up
------------------------

1. The client list is the file keys.json, in the main folder of this site.
2. Clients log in on client.html, using their own access code.
3. client.html checks the code against keys.json. If the code matches, the client gets into the RCD Navigator and the tools.


Important
---------

1. Do not edit keys.json by hand. Each client's entry is encrypted, so it looks like scrambled text. A hand edit can lock everyone out.
2. Keep a private list of which access code belongs to which client. That list is not stored on this site and should never be uploaded here.
3. Removing a client also changes the site key, so the removed code stops working straight away. The other clients keep their own codes.


How to add a client
-------------------

1. Open Claude and say: "Add a new client to the RCD Navigator on bluepetermarine.github.io".
2. Give the client's name (for your own records).
3. Claude creates the access code, updates keys.json and publishes the change.
4. Write the code into your private client list.
5. Send the client the link https://bluepetermarine.github.io/client.html and their access code.


How to remove a client
----------------------

1. Open Claude and say: "Remove a client from the RCD Navigator on bluepetermarine.github.io".
2. Say which client (or which access code) to remove.
3. Claude removes the entry from keys.json, renews the site key and publishes the change.
4. Cross the client off your private list.


Other useful files
------------------

1. client.html is the client login page and the RCD Navigator.
2. index.html is the main page of the portal.
3. The tools folder holds generators such as the builder's plate and WIN generators.
