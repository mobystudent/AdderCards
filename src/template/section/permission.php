
<main class="main" data-name="permis">
  <div class="container">
    <h1 class="main__title">Разрешение на добавление <br/> идентификаторов пользователям</h1><span class="main__depart main__depart--permis"></span>
    <div class="wrap wrap--content wrap--content-permis">
      <div class="main__cards main__cards--main">
        <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество карт:&nbsp</span><span class="main__count main__count--permis">0</span></p>
        <p class="main__count-wrap main__count-wrap--main"><span class="main__count-text">Общее количество карт:&nbsp</span><span class="main__count main__count--all-permis">0</span></p>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--permis"></header>
        <div class="table table--permis">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Статус</span></div>
            <div class="table__cell table__cell--header table__cell--control">
              <button class="btn btn--allow" id="allowAll" type="button" data-type="allow" data-cancel="Отменить" data-allow="Разрешить все">Разрешить все</button>
              <button class="btn btn--disallow" id="disallowAll" type="button" data-type="disallow" data-cancel="Отменить" data-disallow="Запретить все">Запретить все</button>
            </div>
          </header>
          <div class="table__body table__body--empty" id="tablePermis">
            <p class="table__nothing">Новых данных нет</p>
          </div>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все пользователи отмечены.</p>
    </div>
    <div class="main__btns">
      <button class="btn" id="submitPermis" type="button">Подтвердить</button>
    </div>
  </div>
</main>