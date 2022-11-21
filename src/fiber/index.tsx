import React from "react";
import ReactDOM from "react-dom/client";

const element = (
  <div id="A1">
    <div id="B1">
      <div id="C1"></div>
      <div id="C2"></div>
    </div>
    <div id="B2"></div>
  </div>
);
console.log(JSON.stringify(element,null, 2))
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  element
);
