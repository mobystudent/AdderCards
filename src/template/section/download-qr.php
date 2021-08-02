
<main class="main" data-name="download">
  <div class="container">
    <h1 class="main__title">Загрузка QR-кодов</h1>
    <div class="wrap wrap--content wrap--content-download">
      <div class="main__wrap main__wrap--download">
        <div class="main__cards">
          <p class="main__count-wrap"><span class="main__count-text">Количество загруженых qr-кодов:&nbsp</span><span class="main__count main__count--download">0</span></p>
        </div>
      </div>
      <div class="field">
        <textarea class="field__textarea" placeholder="Загрузите текстовые коды для конвертирования"></textarea>
      </div>
      <button class="btn btn--download" id="addQRCodes" type="button">Добавить</button>
      <div class="main__wrap main__wrap--download">
        <div class="main__cards">
          <p class="main__count-wrap"><span class="main__count-text">Количество сформированных qr-кодов:&nbsp</span><span class="main__count main__count--all-download">0</span></p>
        </div>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--download"></header>
        <div class="table table--download">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--codepicture" data-name="codepicture"><span class="table__text table__text--header">Код для изображения</span></div>
            <div class="table__cell table__cell--header table__cell--cardid" data-name="cardid"><span class="table__text table__text--header">ID qr-кода</span></div>
            <div class="table__cell table__cell--header table__cell--cardname" data-name="cardname"><span class="table__text table__text--header">Номер qr-кода</span></div>
            <div class="table__cell table__cell--header table__cell--delete"></div>
          </header>
          <div class="table__body" id="tableDownload">
            <p class="table__nothing">Новых данных нет</p>
          </div>
        </div>
      </div>
      <div class="info">
        <p class="info__item info__item--warn info__item--fields">Предупреждение! Не верно введена строка с кодом.</p>
        <p class="info__item info__item--warn info__item--missed">Предупреждение! Пропущена одна из трех обязательных частей qr-кода, для конвертирования.</p>
        <p class="info__item info__item--warn info__item--deficit">Предупреждение! Недостаточно кодов для присвоения пользователям.</p>
        <p class="info__item info__item--warn info__item--users">Предупреждение! Нет новых пользователей для присвоения qr-кода.</p>
      </div>
      <div class="main__btns">
        <button class="btn btn--assign" id="submitDownloadQR" type="button">Присвоить</button>
      </div>
    </div>
  </div>
</main>