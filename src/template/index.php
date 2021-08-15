<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Cache-control" content="max-age=31536000, public">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
    <title>Служба безопасности</title>
    <link rel="favicon" href="favicon/favicon.ico">
    <link rel="stylesheet" href="./css/jquery-ui.min.css">
    <link rel="stylesheet" href="./css/jquery-ui.theme.min.css">
    <link rel="stylesheet" href="style.css">
    <script defer type="module" src="js/script.js"></script>
  </head>
  <body>
    <div class="wrapper">
      <header class="header"></header>
      <aside class="control">
        <button class="control__item control__item--active" type="button" data-name="const">Добавить постоянную карту</button>
        <button class="control__item" type="button" data-name="time">Добавить временную карту</button>
        <button class="control__item" type="button" data-name="qr">Добавить QR-код</button>
        <button class="control__item" type="button" data-name="download">Загрузить QR-код</button>
        <button class="control__item" type="button" data-name="permis">Разрешение на добавление</button>
        <button class="control__item" type="button" data-name="add">Добавить пользователя</button>
        <button class="control__item" type="button" data-name="remove">Удалить пользователя</button>
        <button class="control__item" type="button" data-name="edit">Редактировать пользователя</button>
        <button class="control__item" type="button" data-name="reject">Отклоненные пользователи</button>
        <button class="control__item" type="button" data-name="request">Запрос на изменение</button>
        <button class="control__item" type="button" data-name="report">Отчёт по изменения</button>
      </aside>
      <main class="main" data-name="const">
        <div class="container">
          <h1 class="main__title">Добавление карт пользователям</h1><span class="main__depart main__depart--const" data-depart=""></span>
          <div class="wrap wrap--content wrap--content-const">
            <div class="main__cards main__cards--main">
              <p class="main__count-wrap main__count-wrap--depart"><span class="main__count-text">Количество карт:&nbsp</span><span class="main__count main__count--const">0</span></p>
              <p class="main__count-wrap main__count-wrap--main"><span class="main__count-text">Общее количество карт:&nbsp</span><span class="main__count main__count--all-const">0</span></p>
            </div>
            <div class="wrap wrap--table">
              <header class="tab tab--const"></header>
              <div class="table table--const">
                <header class="table__header">
                  <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--cardid"><span class="table__text table__text--header">ID карты</span></div>
                  <div class="table__cell table__cell--header table__cell--cardname"><span class="table__text table__text--header">Номер карты</span></div>
                  <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Статус</span></div>
                  <div class="table__cell table__cell--header table__cell--clear"></div>
                  <div class="table__cell table__cell--header table__cell--signature"><span class="table__text table__text--header">Подпись</span></div>
                </header>
                <div class="table__body" id="tableConst">
                  <p class="table__nothing">Новых данных нет</p>
                </div>
              </div>
            </div>
          </div>
          <div class="info">
            <p class="info__item info__item--warn info__item--fields">Предупреждение! Не всем картам присвоен идентификатор.</p>
            <p class="info__item info__item--error info__item--fields">Ошибка! Не правильно введен тип ID. Должно быть 10 цифр, без букв!</p>
          </div>
          <div class="main__btns">
            <button class="btn btn--add" id="submitConstCard" type="button">Добавить</button>
            <button class="btn btn--print" type="button">Распечатать отчет</button>
          </div>
        </div>
      </main>
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
      <main class="main" data-name="permis">
        <div class="container">
          <h1 class="main__title">Разрешение на добавление <br> идентификаторов пользователям</h1><span class="main__depart main__depart--permis"></span>
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
      <main class="main" data-name="add">
        <div class="container">
          <h1 class="main__title">Добавить нового пользователя</h1><span class="main__depart main__depart--add" data-depart="Химический факультет" data-id="ChemDep">Химический факультет</span>
          <form class="form" id="addForm" action="#" method="GET">
            <div class="form__wrap">
              <div class="form__fields">
                <div class="form__field">
                  <label class="form__label"><span class="form__name">ФИО</span>
                    <input class="form__input form__item" data-field="fio" name="name" type="text" placeholder="Введите ФИО" required>
                  </label>
                </div>
                <div class="form__field">
                  <label class="form__label"><span class="form__name">Должность</span>
                    <input class="form__input form__item" data-field="post" name="post" type="text" placeholder="Введите должность" required>
                  </label>
                </div>
                <div class="form__field"><span class="form__name">Тип идентификатора</span>
                  <div class="form__select form__item select" data-field="statustitle" data-type="statusid" data-select="type">
                    <header class="select__header"><span class="select__value" data-title="title" data-type="type" data-placeholder="Выберите тип идентификатора">Выберите тип идентификатора</span></header>
                    <ul class="select__list">
                      <li class="select__item"><span class="select__name" data-title="Пластиковая карта" data-type="newCard">Пластиковая карта</span></li>
                      <li class="select__item"><span class="select__name" data-title="QR-код" data-type="newQR">QR-код</span></li>
                    </ul>
                  </div>
                </div>
                <div class="form__field"><span class="form__name">Окончание действия пропуска</span>
                  <div class="form__select form__item select" data-field="datetitle" data-type="datestatus" data-select="date">
                    <header class="select__header"><span class="select__value" data-title="title" data-date="date" data-placeholder="Выберите окончание действия пропуска">Выберите окончание действия пропуска</span></header>
                    <ul class="select__list">
                      <li class="select__item"><span class="select__name" data-title="Ввести дату" data-date="date">Ввести дату</span></li>
                      <li class="select__item"><span class="select__name" data-title="Безвременно" data-date="infinite">Безвременно</span></li>
                    </ul>
                  </div>
                </div>
                <div class="form__field form__field--hide" data-name="date">
                  <label class="form__label"><span class="form__name">Дата окончания</span>
                    <input class="form__input form__item" id="addDatepicker" data-field="date" name="date" type="text" placeholder="Введите дату" required>
                  </label>
                </div>
              </div>
              <div class="form__aside">
                <div class="form__img"><img class="img img--form" src="./images/avatar.svg" alt="user avatar"></div>
                <div class="form__field">
                  <input class="form__input form__input--file form__item" id="addFile" data-field="photofile" data-url="photourl" name="photofile" type="file" required>
                  <label class="form__download" for="addFile">
                    <svg class="icon icon--download">
                      <use xlink:href="./images/sprite.svg#download"></use>
                    </svg><span class="form__title">Загрузить фото</span>
                  </label>
                </div>
              </div>
            </div>
            <button class="btn btn--form" id="addUser" type="button" data-type="add-user">Добавить</button>
          </form>
          <div class="info">
            <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
            <p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, точка, апостроф.</p>
            <p class="info__item info__item--error info__item--image">Ошибка! Не правильный формат изображение. Допустимы: giff, png, jpg, jpeg.</p>
            <p class="info__item info__item--error info__item--short">Ошибка! ФИО должно состоять хотя бы из двух слов.</p>
          </div>
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
                  <div class="table__cell table__cell--header table__cell--photofile"><span class="table__text table__text--header">Фотография</span></div>
                  <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Идентификатор</span></div>
                  <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
                  <div class="table__cell table__cell--header table__cell--edit">
                    <svg class="icon icon--edit icon--edit-white">
                      <use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
                    </svg>
                  </div>
                  <div class="table__cell table__cell--header table__cell--delete">
                    <svg class="icon icon--delete icon--delete-white">
                      <use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
                    </svg>
                  </div>
                </header>
                <div class="table__body" id="tableAdd">
                  <p class="table__nothing">Не добавленно ни одного пользователя</p>
                </div>
              </div>
            </div>
          </div>
          <div class="main__btns">
            <button class="btn" id="submitAddUser" type="button">Подтвердить и отправить</button>
          </div>
        </div>
      </main>
      <main class="main" data-name="remove">
        <div class="container">
          <h1 class="main__title">Удалить пользователя</h1><span class="main__depart main__depart--remove" data-depart="Химический факультет" data-id="ChemDep">Химический факультет</span>
          <form class="form" id="removeForm" action="#" method="GET">
            <div class="form__wrap" data-post="">
              <div class="form__fields">
                <div class="form__field"><span class="form__name">Пользователь</span>
                  <div class="form__select form__item select" data-field="fio" data-select="fio">
                    <header class="select__header"><span class="select__value" data-title="title" data-fio="fio" data-placeholder="Выберите пользователя">Выберите пользователя</span></header>
                    <ul class="select__list"></ul>
                  </div>
                </div>
                <div class="form__field"><span class="form__name">Причина удаления</span>
                  <div class="form__select form__item select" data-field="titleid" data-type="statusid" data-select="reason">
                    <header class="select__header"><span class="select__value" data-title="title" data-reason="reason" data-placeholder="Выберите причину удаления">Выберите причину удаления</span></header>
                    <ul class="select__list">
                      <li class="select__item"><span class="select__name" data-title="Перевод в другое подразделение" data-reason="changeDepart">Перевод в другое подразделение</span></li>
                      <li class="select__item"><span class="select__name" data-title="Увольнение" data-reason="remove">Увольнение</span></li>
                    </ul>
                  </div>
                </div>
                <div class="form__field form__field--hide" data-name="depart"><span class="form__name">Новое подразделение</span>
                  <div class="form__select form__item select" data-field="newdepart" data-type="newnameid" data-select="new-name-id">
                    <header class="select__header"><span class="select__value" data-title="title" data-new-name-id="new-name-id" data-placeholder="Выберите подразделение">Выберите подразделение</span></header>
                    <ul class="select__list"></ul>
                  </div>
                </div>
                <div class="form__field form__field--hide" data-name="date">
                  <label class="form__label"><span class="form__name">Дата завершения действия пропуска</span>
                    <input class="form__input form__item" id="removeDatepicker" data-field="date" name="date" type="text" placeholder="Введите дату завершения действия пропуска" required>
                  </label>
                </div>
              </div>
              <div class="form__aside">
                <div class="form__img"><img class="img img--form img--form-remove" src="./images/avatar.svg" alt="user avatar"></div>
              </div>
            </div>
            <button class="btn btn--form" id="removeUser" type="button" data-type="remove-user">Удалить</button>
          </form>
          <div class="info">
            <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
          </div>
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
                  <div class="table__cell table__cell--header table__cell--newdepart table__cell--hide"><span class="table__text table__text--header">Новое подразделение</span></div>
                  <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
                  <div class="table__cell table__cell--header table__cell--edit">
                    <svg class="icon icon--edit icon--edit-white">
                      <use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
                    </svg>
                  </div>
                  <div class="table__cell table__cell--header table__cell--delete">
                    <svg class="icon icon--delete icon--delete-white">
                      <use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
                    </svg>
                  </div>
                </header>
                <div class="table__body" id="tableRemove">
                  <p class="table__nothing">Не добавленно ни одного пользователя</p>
                </div>
              </div>
            </div>
          </div>
          <div class="main__btns">
            <button class="btn" id="submitRemoveUser" type="button">Подтвердить и отправить</button>
          </div>
        </div>
      </main>
      <main class="main" data-name="edit">
        <div class="container">
          <h1 class="main__title">Редактировать пользователя</h1><span class="main__depart main__depart--edit" data-depart="Химический факультет" data-id="ChemDep">Химический факультет</span>
          <form class="form" id="editForm" action="#" method="GET">
            <div class="form__wrap" data-post="">
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
                    <input class="form__input form__item" data-field="NewPost" name="newPost" type="text" placeholder="Введите новую должность" required>
                  </label>
                </div>
                <div class="form__field form__field--new-fio">
                  <label class="form__label"><span class="form__name">Новое ФИО</span>
                    <input class="form__input form__item" data-field="NewFIO" name="newName" type="text" placeholder="Введите новое ФИО" required>
                  </label>
                </div>
              </div>
              <div class="form__aside">
                <div class="form__img"><img class="img img--form img--form-remove" src="./images/avatar.svg" alt="user avatar"></div>
              </div>
            </div>
            <button class="btn btn--form" id="editUser" type="button" data-type="edit-user">Редактировать</button>
          </form>
          <div class="info">
            <p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
          </div>
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
      <main class="main" data-name="reject">
        <div class="container">
          <h1 class="main__title">Отклоненные пользователи</h1>
          <div class="wrap wrap--content wrap--content-reject">
            <div class="main__cards main__cards--main">
              <p class="main__count-wrap main__count-wrap--main"><span class="main__count-text">Количество пользователей:&nbsp</span><span class="main__count main__count--reject">0</span></p>
            </div>
            <div class="wrap wrap--table">
              <header class="tab tab--reject"></header>
              <div class="table table--reject">
                <header class="table__header">
                  <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--department"><span class="table__text table__text--header">Подразделение/факультет</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Статус</span></div>
                  <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
                </header>
                <div class="table__body" id="tableReject">
                  <p class="table__nothing">Новых данных нет</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
      <main class="main" data-name="report">
        <div class="container">
          <h1 class="main__title">Отчёт по изменениям</h1>
          <div class="wrap wrap--content wrap--content-report">
            <div class="main__cards main__cards--main">
              <p class="main__count-wrap main__count-wrap--main"><span class="main__count-text">Количество qr-кодов и карт:&nbsp</span><span class="main__count main__count--all-qr">0</span></p>
            </div>
            <div class="wrap wrap--table">
              <header class="tab tab--report"></header>
              <div class="table table--report">
                <header class="table__header">
                  <div class="table__cell table__cell--header table__cell--fio"><span class="table__text table__text--header">Фамилия Имя Отчество</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--post"><span class="table__text table__text--header">Должность</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--department"><span class="table__text table__text--header">Подразделение/факультет</span>
                    <button class="btn btn--sort" type="button" data-direction="true"></button>
                  </div>
                  <div class="table__cell table__cell--header table__cell--cardname"><span class="table__text table__text--header">Номер иден-тора</span></div>
                  <div class="table__cell table__cell--header table__cell--statustitle"><span class="table__text table__text--header">Статус</span></div>
                  <div class="table__cell table__cell--header table__cell--date"><span class="table__text table__text--header">Дата</span></div>
                </header>
                <div class="table__body" id="tableReport">
                  <p class="table__nothing">Новых данных нет</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer class="footer">
        <div class="container">
          <div class="footer__wrap"><small class="footer__version">v2.2.3</small></div>
        </div>
      </footer>
    </div>
  </body>
</html>