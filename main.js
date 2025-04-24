"use strict";

document.addEventListener("DOMContentLoaded", () => {
  new AccordeonControl(".accordeon");
  new Scroller(".js-scroller-hero");
  new Scroller(".js-scroller-prizes");
  let lang = document.querySelector(".hero").classList.contains("kz");
  new DataFiller(lang);
  new FormHandler(lang);
});

// value animations

class Animator {
  constructor(countMin = 0, countMax = 0) {
    this.countStart = countMin;
    this.countCurrent = countMax;
  }

  linear(timeFraction) {
    return timeFraction;
  }

  animate({ timing, draw, duration }) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      let progress = timing(timeFraction);

      draw(progress);

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
    });
  }

  animateCount(selector, min = 0, add = 0) {
    if (add == 0) return;
    const field = document.querySelector(selector);

    this.animate({
      timing: this.linear,
      draw: (progress) => {
        field.textContent = Math.floor(min + add * progress).toLocaleString(
          "ru-RU"
        );
      },
      duration: 1000,
    });
  }
}
// rating

class DataFiller {
  constructor(lang) {
    this.starter = 10000000;
    this.npfPercent = 0.01;
    this.charityPercent = 0.01;
    this.totalPrizeSelector = ".js-prize-value";
    this.totalCharitySelector = ".js-charity-value";
    // this.source = './data.csv';
    // this.source = 'https://sz.kz/picture?file=635';
    this.source = "https://www.szhuldyz.kz/szreports/marathon-feb.csv";
    this.init(lang);
  }

  findElements() {
    this.itemTemplate = document.querySelector("#rating-item");
    this.parent = document.querySelector("#rating-list");
    this.prizes = [...document.querySelectorAll(".js-prize")];
  }

  init(lang) {
    this.findElements();
    this.getData(this.onSuccess.bind(this), this.onError.bind(this));
    if (lang) {
      this.messages = {
        fail: "Ақпарат алынбады",
      };
    } else {
      this.messages = {
        fail: "Не удалось получить данные",
      };
    }
  }

  createRating(data) {
    const fragment = document.createDocumentFragment();

    data.forEach((item) => {
      let { place1, player_id, phone_number, points } = item;
      if (!place1) return;

      let clone = this.itemTemplate.content.cloneNode(true);
      clone.querySelector(".js-place").textContent = place1;
      clone.querySelector(".js-id").textContent =
        Number(player_id).toLocaleString("ru-RU");
      clone.querySelector(".js-phone").textContent = `+7 ${phone_number.slice(
        1,
        4
      )} ${phone_number.slice(4)}`;
      clone.querySelector(".js-score").textContent =
        Number(points).toLocaleString("ru-RU");

      fragment.appendChild(clone);
    });
    this.parent.classList.replace("loading", "filled");
    this.parent.replaceChildren(fragment);
  }

  populatePrizes(npf) {
    this.prizes.forEach((prize, index) => {
      switch (index) {
        case 0:
          prize.textContent = (1000000 + Math.floor(npf * 0.25)).toLocaleString(
            "ru-RU"
          );
          break;
        case 1:
          prize.textContent = (600000 + Math.floor(npf * 0.2)).toLocaleString(
            "ru-RU"
          );
          break;
        case 2:
          prize.textContent = (350000 + Math.floor(npf * 0.15)).toLocaleString(
            "ru-RU"
          );
          break;
        case 3:
          prize.textContent = (250000 + Math.floor(npf * 0.1)).toLocaleString(
            "ru-RU"
          );
          break;
        case 4:
          prize.textContent = (200000 + Math.floor(npf * 0.05)).toLocaleString(
            "ru-RU"
          );
          break;
        case 5:
          prize.textContent = (
            150000 + Math.floor((npf * 0.05) / 2)
          ).toLocaleString("ru-RU");
          break;
        case 6:
          prize.textContent = (
            100000 + Math.floor((npf * 0.05) / 3)
          ).toLocaleString("ru-RU");
          break;
      }
    });
  }

  onSuccess(data) {
    let arr = data
      .replaceAll(/ /gi, "")
      .split(/\n|\r/)
      .filter((item) => item.length > 1);
    let total = 0;

    const headers = arr[0].split(",");

    const users = arr.slice(1).map((row) => {
      const user = {};
      headers.forEach((header, index) => {
        let title = header.trim();
        if (title == "total_amount") {
          if (total == 0) {
            total = row.split(",")[index].replaceAll(/\W/gi, "");
            new Animator().animateCount(
              this.totalPrizeSelector,
              this.starter,
              total * this.npfPercent
            );
            new Animator().animateCount(
              this.totalCharitySelector,
              0,
              total * this.npfPercent
            );
            this.populatePrizes(total * this.npfPercent);
          }
          return;
        }

        user[title] = row.split(",")[index].replaceAll(/[^\w\*]/gi, "");
      });
      return user;
    });
    this.createRating(users);
  }

  onError(error) {
    this.parent.classList.replace("loading", "filled");
    this.parent.innerHTML = `<p class="rating__filler">${error}</p>`;
  }

  async getData(onSuccess, onFail) {
    if (!this.parent.classList.contains(".loading")) {
      this.parent.classList.add("loading");
    }
    try {
      const response = await fetch(this.source);
      console.log(response);
      if (!response.ok) {
        throw new Error(this.messages.fail);
      }
      onSuccess(await response.text());
    } catch (error) {
      console.log(error);
      onFail(this.messages.fail);
    }
  }
}

// scroller

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

// form

class FormHandler {
  constructor(lang) {
    this.init(lang);
  }

  findElements() {
    this.form = document.querySelector("#check-form");
    this.input = this.form.querySelector("#phone");
    this.inputWrapper = this.form.querySelector(".input-wrapper");
    this.submit = this.form.querySelector("#check-submit");
    this.result = document.querySelector("#result");
    this.positioveOutputTemplate = document.querySelector("#positive-output");
    this.negativeOutputTemplate = document.querySelector("#negative-output");
  }

  init(lang) {
    this.findElements();

    this.submit.setAttribute("disabled", "true");
    this.bindEvents();
    if (lang) {
      this.messages = {
        fail: "Жүйеге қосыла алмады. Байланысты тексеріңіз немесе кейінірек қайталаңыз",
        error: "Қателік болды. Өтінеміз, кейінірек қайталаңыз",
        negative: "Бұл нөмірге тіркелген пайдаланушы анықталмады",
        tooMany: "Сұраныстар саны артып кетті. Ертең қайталап көріңіз",
      };
    } else {
      this.messages = {
        fail: "Не удалось подключиться к серверу. Проверьте соединение или попробуйте позже.",
        error: "Произошла ошибка. Пожалуйста, попробуйте позже.",
        negative: "Пользователь с таким номером не найден.",
        tooMany: "Запросов слишком много. Попробуйте завтра",
      };
    }
  }

  stateClasses = {
    active: "active",
    invalid: "invalid",
    valid: "valid",
    loading: "loading",
    filled: "filled",
    mistake: "vibrate",
  };

  constants = {
    phone_length: 13,
    country_code: "+7",
    operator_code: 700,
    url: "https://driveapp.sz.kz/api/send-phone",
  };

  switchState(remove = null, add = null, element = null) {
    let arr = Array.isArray(remove) ? remove : [remove];
    arr.forEach((item) => {
      element.classList.remove(this.stateClasses[item]);
    });

    if (add) {
      element.classList.add(add);
    }
  }

  initInput() {
    if (this.input.value.length < 3) {
      this.input.value = this.constants.country_code + " ";
    }
  }

  onInputFocus() {
    this.switchState(["invalid", "valid"], "active", this.inputWrapper);

    this.initInput();

    this.input.selectionStart = this.constants.country_code.length + 1;
    this.input.selectionEnd = this.input.value.length;
    this.submit.removeAttribute("disabled");

    if (this.tip) {
      this.tip.remove();
      this.tip = null;
    }
  }

  onInputBlur() {
    if (!this.validate()) {
      this.switchState(["active", "valid"], "invalid", this.inputWrapper);

      this.makeTip("Не корректный номер");
    } else {
      this.switchState(["invalid", "active"], "valid", this.inputWrapper);
    }
  }

  makeTip(text) {
    this.tip = document.createElement("span");
    this.tip.classList.add("tip");
    this.tip.textContent = text;

    this.form.append(this.tip);
  }

  validate() {
    let value = this.input.value;
    return (
      value.length === this.constants.phone_length &&
      parseInt(value.slice(3, 6)) >= this.constants.operator_code &&
      parseInt(value.slice(3, 6)) < this.constants.operator_code + 100
    );
  }

  onInputKeyDown(evt) {
    let key = evt.key;
    if (key) {
      if (
        !key.match(/[\d\.]|escape|enter|tab|arrow.+|delete|backspace/gi) ||
        key == "Dead"
      ) {
        evt.preventDefault();
      }
    }
  }
  makeResult(text, positive) {
    if (positive) {
      let clone = this.positioveOutputTemplate.content.cloneNode(true);
      clone.querySelector(".js-id").textContent = text.player_id;
      clone.querySelector(".js-place").textContent = text.place;
      clone.querySelector(".js-amount").textContent = Number(
        text.amount
      ).toLocaleString("ru-RU");
      return clone;
    }
    let clone = this.negativeOutputTemplate.content.cloneNode(true);
    clone.querySelector(".error-message").textContent = text;
    return clone;
  }

  onFormSubmit(evt) {
    evt.preventDefault();
    if (!this.validate()) {
      this.inputWrapper.classList.add(this.stateClasses.mistake);
      this.inputWrapper.addEventListener(
        "animationend",
        () => this.inputWrapper.classList.remove("vibrate"),
        { once: true }
      );
      return;
    }
    const formattedPhone = `7${this.input.value.slice(
      this.constants.country_code.length + 1
    )}`;
    this.form.classList.add(this.stateClasses.loading);
    fetch(this.constants.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formattedPhone }),
    })
      .then((response) => {
        if (!response.ok) {
          let status = response.status;
          if (status == 404) {
            throw new Error(this.messages.negative);
          } else if (status == 429) {
            throw new Error(this.messages.tooMany);
          } else {
            throw new Error(this.messages.error);
          }
        }
        return response.json();
      })
      .then((json) => {
        this.form.classList.remove(this.stateClasses.loading);
        this.result.innerHTML = "";
        this.result.append(this.makeResult(json, true));
        this.result.classList.add(this.stateClasses.filled);
      })
      .catch((error) => {
        let errorMessage = "";
        if (error instanceof TypeError && error.message == "Failed to fetch") {
          errorMessage = this.messages.fail;
        } else if (
          error instanceof TypeError &&
          error.message != "Failed to fetch"
        ) {
          errorMessage = this.messages.error;
        } else {
          errorMessage = error.message;
        }
        this.form.classList.remove(this.stateClasses.loading);
        this.result.innerHTML = "";
        this.result.append(this.makeResult(errorMessage));
        this.result.classList.add(this.stateClasses.filled);
      });
  }

  bindEvents() {
    this.input.addEventListener("focus", this.onInputFocus.bind(this));
    this.input.addEventListener("click", this.onInputFocus.bind(this));
    this.input.addEventListener("keydown", this.onInputKeyDown.bind(this));
    this.input.addEventListener("input", this.initInput.bind(this));
    this.input.addEventListener("blur", this.onInputBlur.bind(this));
    this.form.addEventListener("submit", this.onFormSubmit.bind(this));
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
    if (!(target.tagName == "SUMMARY")) return;
    if (target == this.active) return;
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

// ================================================= hearts

const heartsTemplate = document.querySelector("#hearts").content;

document.addEventListener("pointerdown", (evt) => {
  let left = evt.clientX;
  let top = evt.clientY;

  let hearts = heartsTemplate.cloneNode(true).querySelector(".hearts-wrapper");
  document.body.append(hearts);
  hearts.style.setProperty("--left", `${left}px`);
  hearts.style.setProperty("--top", `${top}px`);
  let secondHeart = hearts.querySelector(".heart-2");
  secondHeart.addEventListener("animationend", () => hearts.remove());
});
