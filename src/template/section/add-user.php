
<main class="main" data-name="add">
  <div class="container">
    <h1 class="main__title">Добавить нового пользователя</h1><span class="main__depart main__depart--permis">Химический факультет</span>
    <form class="form" action="#" method="GET">
      <div class="form__wrap">
        <div class="form__fields">
          <div class="form__field">
            <label class="form__label"><span class="form__name">ФИО</span>
              <input class="form__input form__item" data-field="FIO" name="name" type="text" placeholder="Введите ФИО" required="required"/>
            </label>
          </div>
          <div class="form__field">
            <label class="form__label"><span class="form__name">Должность</span>
              <input class="form__input form__item" data-field="Post" name="post" type="text" placeholder="Введите должность" required="required"/>
            </label>
          </div>
          <div class="form__field"><span class="form__name">Тип идентификатора</span>
            <div class="form__select form__item select" data-field="TitleID" data-type="StatusID" data-select="type">
              <header class="select__header"><span class="select__value" data-title="title" data-type="type" data-placeholder="Выберите тип идентификатора">Выберите тип идентификатора</span></header>
              <ul class="select__list">
                <li class="select__item"><span class="select__name" data-title="Пластиковая карта" data-type="newCard">Пластиковая карта</span></li>
                <li class="select__item"><span class="select__name" data-title="QR-код" data-type="newQR">QR-код</span></li>
              </ul>
            </div>
          </div>
          <div class="form__field">
            <label class="form__label"><span class="form__name">Дата окончания действия пропуска</span>
              <input class="form__input form__item" data-field="Post" name="post" type="text" placeholder="Введите дату окончания пропуска" required="required"/>
            </label>
          </div>
        </div>
        <div class="form__aside">
          <div class="form__img"><img class="img img--form" src="./images/avatar.svg" alt="user avatar"/></div>
          <div class="form__field">
            <input class="form__input form__input--file" id="addFile" data-field="Image" name="image" type="file" required="required"/>
            <label class="form__download" for="addFile">
              <svg class="icon icon--download">
                <use xlink:href="../images/sprite.svg#download"></use>
              </svg><span class="form__title">Загрузить фото</span>
            </label>
          </div>
        </div>
      </div>
      <button class="btn btn--form" id="addUser" type="button" data-type="add-user">Добавить</button>
    </form>
    <div class="wrap wrap--content wrap--content-add">
      <div class="main__cards main__cards--main">
        <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество добавленых пользователей:&nbsp</span><span class="main__count main__count--add">0</span></p>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--add"></header>
        <div class="table table--add">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span></div>
            <div class="table__cell table__cell--header table__cell--image"><span class="table__text table__text--header">Фотография</span></div>
            <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Идентификатор</span></div>
            <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
          </header>
          <div class="table__body" id="tableAdd">
            <p class="table__nothing">Не добавленно ни одного пользователя</p>
          </div>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
    </div>
    <div class="main__btns">
      <button class="btn" id="submitAddUser" type="button">Подтвердить и отправить</button>
    </div>
  </div>
</main>