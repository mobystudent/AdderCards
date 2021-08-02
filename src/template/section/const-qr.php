
<main class="main" data-name="qr">
  <div class="container">
    <h1 class="main__title">Добавление QR-кодов пользователям</h1><span class="main__depart main__depart--qr" data-depart=""></span>
    <div class="wrap wrap--content wrap--content-const">
      <div class="main__cards main__cards--main">
        <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество qr-кодов:&nbsp</span><span class="main__count main__count--qr">0</span></p>
        <p class="main__count-wrap main__count-wrap--main"><span class="main__count-text">Общее количество qr-кодов:&nbsp</span><span class="main__count main__count--all-qr">0</span></p>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--qr"></header>
        <div class="table table--qr">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--cardid"><span class="table__text table__text--header">ID qr-кода</span></div>
            <div class="table__cell table__cell--header table__cell--cardname"><span class="table__text table__text--header">Номер qr-кода</span></div>
            <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Статус</span></div>
            <div class="table__cell table__cell--header table__cell--signature"><span class="table__text table__text--header">Подпись</span></div>
          </header>
          <div class="table__body" id="tableQR">
            <p class="table__nothing">Новых данных нет</p>
          </div>
        </div>
      </div>
    </div>
    <section class="document"></section>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не всем картам присвоен идентификатор.</p>
      <p class="info__item info__item--error info__item--fields">Ошибка! Не правильно введен тип ID. Должно быть 10 цифр, без букв!</p>
    </div>
    <div class="main__btns">
      <button class="btn btn--add" id="submitConstQR" type="button">Добавить</button>
      <button class="btn btn--print" type="button">Распечатать отчет</button>
      <button class="btn btn--print-codes" type="button">Распечатать QR-кода</button>
    </div>
  </div>
</main>