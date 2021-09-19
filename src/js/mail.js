'use strict';

export default (params) => {
	const { department = '', count = '' , title = '', users = [] } = params;
	const styleHead = `color: #ffffff;
		font-family: Roboto, Arial, sans-serif;
		font-size: 14px;
		font-weight: 400;
		padding-top: 10px;
		padding-left: 15px;
		padding-right: 15px;
		padding-bottom: 10px;`;
	const styleBody = `color: #ffffff;
		font-family: Roboto, Arial, sans-serif;
		font-size: 14px;
		font-weight: 300;
		padding-top: 10px;
		padding-left: 15px;
		padding-right: 15px;
		padding-bottom: 10px;`;
	const bodyUsers = users.reduce((body, user) => {
		body += `
			<tr>
				<td style="
					${styleBody}
					width: 50%;
				">${user.fio}</td>
				<td style="
					${styleBody}
					width: 40%;
				">${user.post}</td>
			</tr>
		`;

		return body;
	}, '');

	function showTitleAction() {
		const lastChar = String(count).substr(-1, 1);

		if (lastChar === '1') {
			return `${title} ${count} пользователь`;
		} else if (lastChar === '2' || lastChar === '3' || lastChar === '4') {
			return `${title} ${count} пользователя`;
		} else {
			return `${title} ${count} пользователей`;
		}
	}

	return `
		<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
				<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap" rel="stylesheet">
				<title></title>
			</head>
			<body style="margin: 0;padding: 0;">
				<table
					bgcolor="#1f1f1f"
					border="0"
					cellpadding="0"
					cellspacing="0"
					style="margin:0;
					max-width: 1400px;
					width: 100%;">
					<tbody>
						<tr>
							<td>
								<table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0; width: 100%;">
									<tbody>
										<tr>
											<td align="center" style="padding-bottom: 10px; height: 160px;">
												<img width="76" height="80" src="https://www.univer.kharkov.ua/images/etalon-big2019.png" alt="logo" style="display: block;">
											</td>
										</tr>
										<tr>
											<td align="center" style="
												color: #ffffff;
												font-family: Roboto, Arial, sans-serif;
												font-size: 18px;
												font-weight: 300;
												text-transform: uppercase;
												padding-top: 0;
												padding-left: 0;
												padding-right: 0;
												padding-bottom: 15px;
											">Управление службы охраны и безопасности</td>
										</tr>
										<tr>
											<td align="center" style="
												color: #ffffff;
												font-family: Roboto, Arial, sans-serif;
												font-size: 30px;
												font-weight: 400;
												text-transform: uppercase;
												padding-top: 0;
												padding-left: 0;
												padding-right: 0;
												padding-bottom: 15px;
											">${department}</td>
										</tr>
										<tr>
											<td align="center" style="
												color: #ffffff;
												font-family: Roboto, Arial, sans-serif;
												font-size: 22px;
												font-weight: 400;
												padding-top: 0;
												padding-left: 0;
												padding-right: 0;
												padding-bottom: 20px;
											">${showTitleAction()}</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
						<tr>
							<td>
								<table border="0" cellpadding="0" cellspacing="0" style="margin:0 0 45px; padding:0; width: 100%;">
									<tbody>
										<tr>
											<td style="width: 5%;"></td>
											<td>
												<table border="1" bordercolor="#ffffff" cellpadding="0" cellspacing="0" style="margin:0; padding:0; width: 100%;">
													<tbody>
														<tr>
															<td align="center" style="
																${styleHead}
																width: 50%;
															">ФИО</td>
															<td align="center" style="
																${styleHead}
																width: 40%;
															">Должность</td>
														</tr>
														${bodyUsers}
													</tbody>
												</table>
											</td>
											<td style="width: 5%;"></td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
						<tr>
							<td>
								<table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0; width: 100%;">
									<tbody>
										<tr>
											<td align="center" style="
												color: #ffffff;
												font-family: Roboto, Arial, sans-serif;
												font-size: 12px;
												font-weight: 400;
												padding-top: 0;
												padding-left: 40px;
												padding-right: 40px;
												padding-bottom: 60px;
											">Обратитесь, пожалуйста, к представителю выдачи пропусков Управления службы охраны и безопасности.<br> Северный корпус, 1 этаж, комната слева, напротив 'ключницы'.</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>
	`;
};
