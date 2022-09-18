<h2>Owie - Designupgrade Mockup</h3>  

This Repo holds a design upgrade mockup for the OWIE (lolwheel/owie) Webinterface.   
Following Frameworks are included (but not finialized as for now!):  
 - ~~Picnic CSS (a very small CSS Framework mainly for grid placing...)(takes aprox. 40k)~~   
   ~~(This Framework may be abandoned, since only the grid option is used, which may be replaced by custom css)~~  
   **was replaces by custom css**
 - ~~Font Awesome (v6 Free, solid only!) (takes around 640k!!! including the needed webfonts...)   
   (since there is very limited space on the D1 boards, this is probably going to be striped down or replaced by inline svg...)~~  
  **Was replaced by inline SVG (free icon svg from Fontawesome)**

The JavaScript part will be plain JS without framework (as for now)

<h3>Developer Information</h3>
 - <b>Requirements:</b>
    - NodeJS (min version 14)
    - npm (normally installed with NodeJS installer)

To serve the mockup website execute following commands in the repo dir:
 - ```npm update```
 - ```npm install```
 - ```node bin/www```

Optional the ```nodemon``` package may be used instead of ```node``` to start the webserver.  
This package triggers an automatic update and reload of the static web serving!  
(```npm install nodemon```)   

Website ist served under http://localhost:3000 with the current config. 

**Generally speaking, less Code is the way to go.**
