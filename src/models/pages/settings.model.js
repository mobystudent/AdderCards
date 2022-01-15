'use strict';

import { changeName } from '../../components/settings/change-name.tpl.js';
import { addDepart } from '../../components/settings/add-depart.tpl.js';
import { removeDepart } from '../../components/settings/remove-depart.tpl.js';
import { autoUpload } from '../../components/settings/auto-upload.tpl.js';
import { changeEmail } from '../../components/settings/change-email.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class SettingsModel {
	constructor(props) {
		({
			object: this.object = {},
			info: this.info = [],
			errors: this.errors = {}
		} = props);
	}

	renderSections() {
		const { statuschangename, nameid, shortname, longname, statusadddepart, statusremovedepart, statustimeautoupdate, autoupdatetitle, autoupdatevalue, statuschangeemail, email } = this.object;
		const { changename, adddepart, removedepart, changeemail } = this.errors;
		const changeNameBtnValue = statuschangename ? 'Отменить' : 'Изменить';
		const changeNameBtnClass = statuschangename ? 'btn--settings-disabled' : '';
		const addDepartBtnValue = statusadddepart ? 'Отменить' : 'Добавить';
		const addDepartBtnClass = statusadddepart ? 'btn--settings-disabled' : '';
		const removeDepartBtnValue = statusremovedepart ? 'Отменить' : 'Удалить';
		const removeDepartBtnClass = statusremovedepart ? 'btn--settings-disabled' : '';
		const timeAutoUploadBtnValue = statustimeautoupdate ? 'Отменить' : 'Изменить';
		const timeAutoUploadBtnClass = statustimeautoupdate ? 'btn--settings-disabled' : '';
		const changeEmailBtnValue = statuschangeemail ? 'Отменить' : 'Изменить';
		const changeEmailBtnClass = statuschangeemail ? 'btn--settings-disabled' : '';
		const emailValue = email ? email : 'Введите почту';

		return `
			<div class="settings__section" data-block="changename">
				<div class="settings__wrap">
					<h3 class="settings__title">Название подразделения</h3>
					<div class="settings__department" data-nameid="${nameid}" data-shortname="${shortname}" data-longname="${longname}">
						<span class="settings__longname">${longname}</span>
						<small class="settings__separ">/</small>
						<span class="settings__shortname">${shortname}</span>
					</div>
				</div>
				<div class="settings__btn-wrap">
					<button class="btn btn--settings ${changeNameBtnClass}" data-name="changename" type="button">${changeNameBtnValue}</button>
				</div>
				${changeName(this.object)}
				<div class="info info--settings">${this.renderInfo(changename)}</div>
			</div>

			<div class="settings__section" data-block="adddepart">
				<div class="settings__wrap">
					<h3 class="settings__title">Добавить подразделение</h3>
				</div>
				<div class="settings__btn-wrap">
					<button class="btn btn--settings ${addDepartBtnClass}" data-name="adddepart" type="button">${addDepartBtnValue}</button>
				</div>
				${addDepart(this.object)}
				<div class="info info--settings">${this.renderInfo(adddepart)}</div>
			</div>

			<div class="settings__section" data-block="removedepart">
				<div class="settings__wrap">
					<h3 class="settings__title">Удалить подразделение</h3>
				</div>
				<div class="settings__btn-wrap">
					<button class="btn btn--settings ${removeDepartBtnClass}" data-name="removedepart" type="button">${removeDepartBtnValue}</button>
				</div>
				${removeDepart(this.object)}
				<div class="info info--settings">${this.renderInfo(removedepart)}</div>
			</div>

			<div class="settings__section" data-block="timeautoupdate">
				<div class="settings__wrap">
					<h3 class="settings__title">Период автообновления данных в таблицах</h3>
					<span class="settings__value settings__value--autoupdate" data-value="${autoupdatevalue}">${autoupdatetitle}</span>
				</div>
				<div class="settings__btn-wrap">
					<button class="btn btn--settings ${timeAutoUploadBtnClass}" type="button" data-name="timeautoupdate">${timeAutoUploadBtnValue}</button>
				</div>
				${autoUpload(this.object)}
			</div>

			<div class="settings__section" data-block="changeemail">
				<div class="settings__wrap">
					<h3 class="settings__title">Email</h3>
					<span class="settings__value">${emailValue}</span>
				</div>
				<div class="settings__btn-wrap">
					<button class="btn btn--settings ${changeEmailBtnClass}" type="button" data-name="changeemail">${changeEmailBtnValue}</button>
				</div>
				${changeEmail(this.object)}
				<div class="info info--settings">${this.renderInfo(changeemail)}</div>
			</div>
		`;
	}

	renderInfo(array) {
		return this.info.reduce((content, item) => {
			const { type, title, message } = item;

			for (const error of array) {
				if (error === title) {
					content += `<p class="info__item info__item--${type}">${message}</p>`;
				}
			}

			return content;
		}, '');
	}

	render() {
		return `
			${pageTitle(this.object)}
			<section class="settings" id="settingsSection">
				<div class="settings__content-wrap">
					<div class="settings__content">
						${this.renderSections()}
					</div>
				</div>
			</section>
		`;
	}
}

export default SettingsModel;
