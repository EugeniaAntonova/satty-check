"use strict";

document.addEventListener("DOMContentLoaded", () => {
  new AccordeonControl(".accordeon");
  //   new Scroller(".js-scroller-hero");
  //   new Scroller(".js-scroller-prizes");
});

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

class AccordeonControl {
  constructor(selector) {
    this.accordeon = document.querySelector(selector);
    this.active = null;
    this.accordeon.addEventListener("click", this.onAccordeonClick.bind(this));
    this.accordeon.addEventListener("keydown", this.onSpace.bind(this));
  }

  onAccordeonClick(evt) {
    let target = evt.target;
    if (!(target.tagName == "SUMMARY" || target == this.active)) return;
    if (this.active) {
      this.active.closest("details").removeAttribute("open");
    }
    this.active = target;
  }

  onSpace(evt) {
    if (evt.code != "Space") return;
    if (evt.target != this.active) return;
    this.active.removeAttribute("open");
    this.active = null;
  }
}
