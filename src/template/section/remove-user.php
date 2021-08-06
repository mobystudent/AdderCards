
<main class="main" data-name="remove">
  <div class="container">
    <h1 class="main__title">Удалить пользователя</h1><span class="main__depart main__depart--permis">Химический факультет</span>
    <form class="form" id="removeForm" action="#" method="GET">
      <div class="form__wrap">
        <div class="form__fields">
          <div class="form__field"><span class="form__name">Пользователь</span>
            <div class="form__select form__item select" data-field="FIO" data-select="fio">
              <header class="select__header"><span class="select__value" data-title="title" data-placeholder="Выберите пользователя">Выберите пользователя</span></header>
              <ul class="select__list"></ul>
            </div>
          </div>
          <div class="form__field"><span class="form__name">Причина удаления</span>
            <div class="form__select form__item select" data-field="TitleID" data-type="StatusID" data-select="reason">
              <header class="select__header"><span class="select__value" data-title="title" data-reason="type" data-placeholder="Выберите причину удаления">Выберите причину удаления</span></header>
              <ul class="select__list">
                <li class="select__item"><span class="select__name" data-title="Перевод в другое подразделение" data-reason="changeDepart">Перевод в другое подразделение</span></li>
                <li class="select__item"><span class="select__name" data-title="Увольнение" data-reason="remove">Увольнение</span></li>
              </ul>
            </div>
          </div>
          <div class="form__field form__field--hide" data-name="depart"><span class="form__name">Новое подразделение</span>
            <div class="form__select form__item select" data-field="NewDepart" data-type="NewNameID" data-select="new-name-id">
              <header class="select__header"><span class="select__value" data-title="title" data-new-name-id="new-name-id" data-placeholder="Выберите подразделение">Выберите подразделение</span></header>
              <ul class="select__list"></ul>
            </div>
          </div>
          <div class="form__field form__field--hide" data-name="date">
            <label class="form__label"><span class="form__name">Дата завершения действия пропуска</span>
              <input class="form__input form__item" id="removeDateField" data-field="date" name="date" type="text" placeholder="Введите дату завершения действия пропуска" required="required"/>
            </label>
          </div>
        </div>
        <div class="form__aside">
          <div class="form__img"><img class="img img--form" src="./images/avatar.svg" alt="user avatar"/></div>
          <div class="form__field">
            <input class="form__input form__input--file form__item" id="viewFile" data-field="photofile" name="photofile" type="file"/>
          </div>
        </div>
      </div>
      <button class="btn btn--form" id="removeUser" type="button" data-type="remove-user">Удалить</button>
    </form>
    <div class="wrap wrap--content wrap--content-remove-item">
      <div class="main__cards main__cards--main">
        <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество удаленных пользователей:&nbsp</span><span class="main__count main__count--remove">0</span></p>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--remove"></header>
        <div class="table table--remove">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span></div>
            <div class="table__cell table__cell--header table__cell--titleid"><span class="table__text table__text--header">Причина удаления</span></div>
            <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
            <div class="table__cell table__cell--header table__cell--edit"></div>
            <div class="table__cell table__cell--header table__cell--delete"></div>
          </header>
          <div class="table__body" id="tableRemove">
            <p class="table__nothing">Не добавленно ни одного пользователя</p>
          </div>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
      <p class="info__item info__item--warn info__item--table">Предупреждение! Ни одного пользователя не выбрано.</p>
    </div>
    <div class="main__btns">
      <button class="btn" id="submitRemoveUser" type="button">Подтвердить и отправить</button>
    </div>
  </div>
</main>