import AbstractComponent from "./abstract-component.js";
import {formatTime} from "../utils/common.js";
import {MONTH_NAMES} from "../const.js";

const createButtonMarkup = (name, isActive = true) => {
  return (
    `<button type="button" class="card__btn card__btn--${name} ${isActive ? `` : `card__btn--disabled`}">
      ${name}
    </button>`
  );
};

const createCardTemplate = (card) => {
  const {color, description, dueDate, repeatingDays, isArchive, isFavorite} = card;

  const isExpired = dueDate instanceof Date && dueDate < Date.now();
  const isDateShowing = !!dueDate;
  const isRepeatingCard = Object.values(repeatingDays).some(Boolean);

  const date = isDateShowing ? `${dueDate.getDate()} ${MONTH_NAMES[dueDate.getMonth()]}` : ``;
  const time = isDateShowing ? formatTime(dueDate) : ``;

  const repeatClass = isRepeatingCard ? `card--repeat` : ``;
  const deadlineClass = isExpired ? `card--deadline` : ``;

  const editButton = createButtonMarkup(`edit`);
  const archiveButton = createButtonMarkup(`archive`, isArchive);
  const favoritesButton = createButtonMarkup(`favorites`, isFavorite);

  return (
    `<article class="card card--${color} ${repeatClass} ${deadlineClass}">
      <div class="card__form">
        <div class="card__inner">
          <div class="card__control">
            ${editButton}
            ${archiveButton}
            ${favoritesButton}
          </div>

          <div class="card__color-bar">
            <svg class="card__color-bar-wave" width="100%" height="10">
              <use xlink:href="#wave"></use>
            </svg>
          </div>

          <div class="card__textarea-wrap">
            <p class="card__text">${description}</p>
          </div>

          <div class="card__settings">
            <div class="card__details">
              <div class="card__dates">
                <div class="card__date-deadline">
                  <p class="card__input-deadline-wrap">
                    <span class="card__date">${date}</span>
                    <span class="card__time">${time}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>`
  );
};

export default class Card extends AbstractComponent {
  constructor(card) {
    super();

    this._card = card;
  }

  getTemplate() {
    return createCardTemplate(this._card);
  }

  setEditButtonClickHandler(handler) {
    this.getElement().querySelector(`.card__btn--edit`)
      .addEventListener(`click`, handler);
  }

  setFavoritesButtonClickHandler(handler) {
    this.getElement().querySelector(`.card__btn--favorites`)
      .addEventListener(`click`, handler);
  }

  setArchiveButtonClickHandler(handler) {
    this.getElement().querySelector(`.card__btn--archive`)
      .addEventListener(`click`, handler);
  }
}
