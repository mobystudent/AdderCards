
<main class="main" data-name="edit">
  <div class="container">
    <h1 class="main__title">Редактировать пользователя</h1><span class="main__depart main__depart--permis">Химический факультет</span>
    <form class="form" action="#" method="GET">
      <div class="form__wrap form__wrap--center">
        <div class="form__fields">
          <div class="form__field"><span class="form__name">Пользователь</span>
            <div class="form__select form__item select" data-field="FIO" data-select="fio">
              <header class="select__header"><span class="select__value" data-title="title" data-placeholder="Выберите пользователя">Выберите пользователя</span></header>
              <ul class="select__list"></ul>
            </div>
          </div>
          <div class="form__field"><span class="form__name">Тип изменения</span>
            <div class="form__select form__item select" data-field="TitleID" data-type="StatusID" data-select="change">
              <header class="select__header"><span class="select__value" data-title="title" data-change="type" data-placeholder="Выберите тип изменения">Выберите тип изменения</span></header>
              <ul class="select__list">
                <li class="select__item"><span class="select__name" data-title="Утеря пластиковой карты" data-change="changeCard">Утеря пластиковой карты</span></li>
                <li class="select__item"><span class="select__name" data-title="Утеря QR-кода" data-change="changeQR">Утеря QR-кода</span></li>
                <li class="select__item"><span class="select__name" data-title="Изменение ФИО" data-change="changeFIO">Изменение ФИО</span></li>
                <li class="select__item"><span class="select__name" data-title="Изменение должности" data-change="changePost">Изменение должности</span></li>
                <li class="select__item"><span class="select__name" data-title="Изменение фото" data-change="changeImage">Изменение фото</span></li>
              </ul>
            </div>
          </div>
          <div class="form__field form__field--new-post">
            <label class="form__label"><span class="form__name">Новая должность</span>
              <input class="form__input form__item" data-field="NewPost" name="newPost" type="text" placeholder="Введите новую должность" required="required"/>
            </label>
          </div>
          <div class="form__field form__field--new-fio">
            <label class="form__label"><span class="form__name">Новое ФИО</span>
              <input class="form__input form__item" data-field="NewFIO" name="newName" type="text" placeholder="Введите новое ФИО" required="required"/>
            </label>
          </div>
        </div>
        <div class="form__aside form__aside--hide">
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
      <button class="btn btn--form" id="editUser" type="button" data-type="edit-user">Редактировать</button>
    </form>
    <div class="wrap wrap--content wrap--content-edit-fio">
      <div class="main__cards main__cards--main">
        <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество добавленых пользователей:&nbsp</span><span class="main__count main__count--edit">0</span></p>
      </div>
      <div class="wrap wrap--table">
        <header class="tab tab--edit"></header>
        <div class="table table--edit">
          <header class="table__header">
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--titleid"><span class="table__text table__text--header">Тип изменения</span></div>
            <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Новое Фамилия Имя Отчество</span>
              <button class="btn btn--sort" type="button" data-direction="true"></button>
            </div>
            <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Новая должность</span></div>
            <div class="table__cell table__cell--header table__cell--image"><span class="table__text table__text--header">Новая фотография</span></div>
          </header>
          <div class="table__body" id="tableEdit">
            <p class="table__nothing">Не добавленно ни одного пользователя</p>
          </div>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
    </div>
    <div class="main__btns">
      <button class="btn" id="submitEditUser" type="button">Подтвердить и отправить</button>
    </div>
  </div>
</main>