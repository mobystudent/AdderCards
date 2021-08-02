
<main class="main" data-name="request">
  <div class="container">
    <h1 class="main__title">Запрос на изменение данных</h1><span class="main__depart main__depart--request"></span>
    <div class="wrap wrap--content wrap--content-request">
      <div class="main__cards main__cards--main">
        <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество карт:&nbsp</span><span class="main__count main__count--request">0</span></p>
        <p class="main__count-wrap main__count-wrap--main"><span class="main__count-text">Общее количество карт:&nbsp</span><span class="main__count main__count--all-request">0</span></p>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--request"></header>
        <div class="table table--request">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span></div>
            <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Статус</span></div>
            <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
          </header>
          <div class="table__body" id="tableRequest">
            <p class="table__nothing">Новых данных нет</p>
          </div>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
    </div>
    <div class="main__btns">
      <button class="btn btn--confirm" type="button">Пременить</button>
    </div>
  </div>
</main>