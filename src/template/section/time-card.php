
<main class="main" data-name="time">
  <div class="container">
    <h1 class="main__title">Добавление временных карт</h1>
    <div class="wrap wrap--content wrap--content-time">
      <div class="main__wrap">
        <div class="main__cards">
          <p class="main__count-wrap"><span class="main__count-text">Количество карт:&nbsp</span><span class="main__count main__count--time">0</span></p>
        </div>
        <button class="main__btn" id="addTimeCard" type="button">
          <svg class="icon icon--plus">
            <use class="icon__item" xlink:href="./images/sprite.svg#plus"></use>
          </svg><span class="main__btn-text">Добавить карту</span>
        </button>
      </div>
      <div class="wrap wrap--table">
        <div class="table table--time">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Название</span></div>
            <div class="table__cell table__cell--header table__cell--cardid"><span class="table__text table__text--header">ID карты</span></div>
            <div class="table__cell table__cell--header table__cell--cardname"><span class="table__text table__text--header">Номер карты</span></div>
            <div class="table__cell table__cell--header table__cell--clear"></div>
            <div class="table__cell table__cell--header table__cell--delete"></div>
          </header>
          <div class="table__body" id="tableTime">
            <div class="table__content table__content--time table__content--active"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не всем картам присвоен идентификатор.</p>
      <p class="info__item info__item--warn info__item--last">Предупреждение! Всегда должна быть одна карта.</p>
      <p class="info__item info__item--error info__item--fields">Ошибка! Не правильно введен тип ID. Должно быть 10 цифр, без букв!</p>
    </div>
    <div class="main__btns">
      <button class="btn" id="submitTimeCard" type="button">Добавить</button>
    </div>
  </div>
</main>