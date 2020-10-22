import List from "./src/test.jsx";
import React from "./src/React";

const inst = new React();
inst.start();
inst.render(List, document.getElementById("a1"));
