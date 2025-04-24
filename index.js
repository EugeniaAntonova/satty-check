"use strict";

// document.addEventListener("DOMContentLoaded", () => {
//   new Scroller(".js-scroller-hero");
//   new Scroller(".js-scroller-prizes");
// });

class Scroller {
    constructor(selector) {
      this.scroller = document.querySelector(selector);
      this.scroller.addEventListener("click", this.onClick.bind(this));
      this.anchor = this.scroller.dataset.target;
    }
  
    onClick() {
      document
        .querySelector(`#${this.anchor}`)
        .scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }