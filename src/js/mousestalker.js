import { lerp } from "./utils.js";

export class MouseStalker {
  constructor() {
    this.stalker = document.querySelector('.js-stalker');
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.stalkerPosition = { x: this.viewport.width / 2, y: this.viewport.height / 2 };
    this.cursor = { x: 0, y: 0 };

    this._addEvent();
  }

  _init() {
    if (this.stalker) {
      this.stalker.classList.add('is-active');
    }
  }


  update() {
    this.stalkerPosition.x = lerp(this.stalkerPosition.x, this.viewport.width * (this.cursor.x + 0.5), 0.06);
    this.stalkerPosition.y = lerp(this.stalkerPosition.y, this.viewport.height * (this.cursor.y + 0.5), 0.06);

    if (this.stalker) {
      this.stalker.style.transform = `translate(${this.stalkerPosition.x}px, ${this.stalkerPosition.y}px)`;
    }
  }

  _onMousemove(e) {
    this.cursor.x = e.clientX / this.viewport.width - 0.5;
    this.cursor.y = e.clientY / this.viewport.height - 0.5;
  }

  _addEvent() {
    window.addEventListener("mousemove", this._init.bind(this));
    window.addEventListener("mousemove", this._onMousemove.bind(this));
  }
}