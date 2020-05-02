import AbstractSmartComponent from "./abstract-smart-component.js";
import {COLORS, DAYS, MONTH_NAMES} from "../const.js";
import {formatTime} from "../utils/common.js";

const isRepeating = (repeatingDays) => Object.values(repeatingDays).some(Boolean);

const createColorsMarkup = (colors, currentColor) => {
  return colors.map((color, index) => {
    return (
      `<input
        type="radio"
        id="color-${color}-${index}"
        class="card__color-input card__color-input--${color} visually-hidden"
        name="color"
        value="${color}"
        ${currentColor === color ? `checked` : ``}
      />
      <label
        for="color-${color}-${index}"
        class="card__color card__color--${color}"
        >${color}</label
      >`
    );
  }).join(`\n`);
};

const createRepeatingDaysMarkup = (days, repeatingDays) => {
  return days.map((day, index) => {
    const isChecked = repeatingDays[day];

    return (
      `<input
        class="visually-hidden card__repeat-day-input"
        type="checkbox"
        id="repeat-${day}-${index}"
        name="repeat"
        value="${day}"
        ${isChecked ? `checked` : ``}
      />
      <label class="card__repeat-day" for="repeat-${day}-${index}"
        >${day}</label
      >`
    );
  }).join(`\n`);
};

const createCardEditTemplate = (card, options = {}) => {
  const {description, dueDate} = card;
  const {color, isDateShowing, isRepeatingCard, activeRepeatingDays} = options;

  const date = (isDateShowing && dueDate) ? `${dueDate.getDate()} ${MONTH_NAMES[dueDate.getMonth()]}` : ``;
  const time = (isDateShowing && dueDate) ? formatTime(dueDate) : ``;

  const isExpired = dueDate instanceof Date && dueDate < Date.now();
  const isBlockSaveButton = (isDateShowing && isRepeatingCard) ||
  (isDateShowing && !dueDate) ||
  (isRepeatingCard && !isRepeating(activeRepeatingDays));

  const repeatClass = isRepeatingCard ? `card--repeat` : ``;
  const deadlineClass = isExpired ? `card--deadline` : ``;

  const colorsMarkup = createColorsMarkup(COLORS, color);
  const repeatingDaysMarkup = createRepeatingDaysMarkup(DAYS, activeRepeatingDays);

  return (
    `<article class="card card--edit card--${color} ${repeatClass} ${deadlineClass}">
      <form class="card__form" method="get">
        <div class="card__inner">
          <div class="card__color-bar">
            <svg class="card__color-bar-wave" width="100%" height="10">
              <use xlink:href="#wave"></use>
            </svg>
          </div>

          <div class="card__textarea-wrap">
            <label>
              <textarea
                class="card__text"
                placeholder="Start typing your text here..."
                name="text"
              >${description}</textarea>
            </label>
          </div>

          <div class="card__settings">
            <div class="card__details">
              <div class="card__dates">
                <button class="card__date-deadline-toggle" type="button">
                  date: <span class="card__date-status">${isDateShowing ? `yes` : `no`}</span>
                </button>

    ${isDateShowing ?
      `<fieldset class="card__date-deadline">
                  <label class="card__input-deadline-wrap">
                    <input
                      class="card__date"
                      type="text"
                      placeholder=""
                      name="date"
                      value="${date} ${time}"
                    />
                  </label>
                </fieldset>` : ``}

                <button class="card__repeat-toggle" type="button">
                  repeat:<span class="card__repeat-status">${isRepeatingCard ? `yes` : `no`}</span>
                </button>

    ${isRepeatingCard ?
      `<fieldset class="card__repeat-days">
                  <div class="card__repeat-days-inner">
                    ${repeatingDaysMarkup}
                  </div>
                </fieldset>` : ``}
              </div>
            </div>

            <div class="card__colors-inner">
              <h3 class="card__colors-title">Color</h3>
              <div class="card__colors-wrap">
                ${colorsMarkup}
              </div>
            </div>
          </div>

          <div class="card__status-btns">
            <button class="card__save" type="submit" ${isBlockSaveButton ? `disabled` : ``}>save</button>
            <button class="card__delete" type="button">delete</button>
          </div>
        </div>
      </form>
    </article>`
  );
};

export default class CardEdit extends AbstractSmartComponent {
  constructor(card) {
    super();

    this._card = card;
    this._color = card.color;
    this._isDateShowing = !!card.dueDate;
    this._isRepeatingCard = Object.values(card.repeatingDays).some(Boolean);
    this._activeRepeatingDays = Object.assign({}, card.repeatingDays);
    this._submitHandler = null;
    this._subscribeOnEvents();
  }

  getTemplate() {
    return createCardEditTemplate(this._card, {
      color: this._color,
      isDateShowing: this._isDateShowing,
      isRepeatingCard: this._isRepeatingCard,
      activeRepeatingDays: this._activeRepeatingDays,
    });
  }

  setSubmitHandler(handler) {
    this.getElement().querySelector(`form`)
      .addEventListener(`submit`, handler);
    this._submitHandler = handler;
  }

  recoveryListeners() {
    this.setSubmitHandler(this._submitHandler);
    this._subscribeOnEvents();
  }

  rerender() {
    super.rerender();
  }

  reset() {
    const card = this._card;

    this._isDateShowing = !!card.dueDate;
    this._isRepeatingCard = Object.values(card.repeatingDays).some(Boolean);
    this._activeRepeatingDays = Object.assign({}, card.repeatingDays);

    this.rerender();
  }

  _subscribeOnEvents() {
    const element = this.getElement();

    element.querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, () => {
        this._isDateShowing = !this._isDateShowing;

        this.rerender();
      });

    element.querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, () => {
        this._isRepeatingCard = !this._isRepeatingCard;

        this.rerender();
      });

    const repeatDays = element.querySelector(`.card__repeat-days`);
    if (repeatDays) {
      repeatDays.addEventListener(`change`, (evt) => {
        this._activeRepeatingDays[evt.target.value] = evt.target.checked;

        this.rerender();
      });
    }

    const cardColors = element.querySelector(`.card__colors-inner`);
    const colorInput = element.querySelector(`.card__color-input`);
    if (colorInput) {
      cardColors.addEventListener(`change`, (evt) => {
        this._color = evt.target.value;

        this.rerender();
      });
    }
  }
}
