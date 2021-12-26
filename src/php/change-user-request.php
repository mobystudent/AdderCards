<?php

	$mysqli = new mysqli('localhost', 'root', 'root', 'security-system', 3306);
	$mysqli->query("SET NAMES 'utf8'");

	$action = $_POST['action'];
	$nameTable = $_POST['nameTable'];
	$array = $_POST['array'];
	$typeTable = $_POST['typeTable'];

	var_dump($array);

	if (($nameTable === 'add') && ($action === 'edit')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'id') $id = $value;
				if ($key === 'fio') $fio = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
				if ($key === 'newfio') {
					$newfio = $value ? $value : $item['fio'];
				}
				if ($key === 'newpost') {
					$newpost = $value ? $value : $item['post'];
				}
				if ($key === 'newphotofile') {
					$newphotofile = $value ? $value : $item['photofile'];
				}
			}

			$idDepart = strtolower($item['nameid']);
			$addDepart = 'add_depart_'.$idDepart;
			$reportDepart = 'report_depart_'.$idDepart;

			if($mysqli->query("UPDATE `$addDepart` SET fio = '$newfio', post = '$newpost', photofile = '$newphotofile' WHERE id = $id")) {
				echo('Success update in BD '.$addDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, post, nameid, statusid, statustitle, date) VALUES ('$fio', '$post', '$nameid', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$reportDepart` (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, post, nameid, statusid, statustitle, date) VALUES ('$fio', '$post', '$nameid', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'permis') && ($action === 'edit')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
			}

			if ($mysqli->query("INSERT INTO permission (fio, department, photofile, nameid, post, statusid, statustitle) VALUES ('$fio', '$department', '$photofile', '$nameid', '$post', '$statusid', '$statustitle')")) {
				echo('Success add in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'add') && ($action === 'remove')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
				if ($key === 'id') $id = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$addDepart = 'add_depart_'.$idDepart;
			$reportDepart = 'report_depart_'.$idDepart;

			if($mysqli->query("DELETE FROM `$addDepart` WHERE id = $id")) {
				echo('Success delete in BD '.$addDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$reportDepart` (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'add') && ($action === 'transfer')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
				if ($key === 'id') $id = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'newnameid') $newnameid = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$addDepart = 'add_depart_'.$idDepart;
			$idNewDepart = strtolower($item['newnameid']);
			$newDepart = 'add_depart_'.$idNewDepart;
			$reportDepart = 'report_depart_'.$idDepart;

			if($mysqli->query("DELETE FROM `$addDepart` WHERE id = $id")) {
				echo('Success delete in BD '.$addDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO `$newDepart` (fio, post, photofile, statusid, statustitle, date) VALUES ('$fio', '$post', '$photofile', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$newDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$reportDepart` (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'add') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'сardvalidto') $сardvalidto = $value;
				if ($key === 'date') $date = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$nameDepart = 'add_depart_'.$idDepart;

			if($mysqli->query("INSERT INTO permission (fio, department, post, photofile, nameid, statusid, statustitle, сardvalidto) VALUES ('$fio', '$department', '$post', '$photofile', '$nameid', '$statusid', '$statustitle', '$сardvalidto')")) {
				echo('Success add in BD permission');
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO `$nameDepart` (fio, post, photofile, statusid, statustitle, date) VALUES ('$fio', '$post', '$photofile', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'time') && ($action === 'report')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'cardname') $cardname = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
			}

			if($mysqli->query("INSERT INTO report (fio, cardname, statusid, statustitle, date) VALUES ('$fio', '$cardname', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'const') && ($action === 'report')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'id') $id = $value;
				if ($key === 'fio') $fio = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'codeid') $codeid = $value;
				if ($key === 'cardid') $cardid = $value;
				if ($key === 'cardname') $cardname = $value;
				if ($key === 'date') $date = $value;
			}

			$typeBDTable = 'const_'.$typeTable;

			if($mysqli->query("DELETE FROM `$typeBDTable` WHERE id = $id")) {
				echo('Success delete in BD '.$typeBDTable);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("DELETE FROM download_qr WHERE id = $codeid")) {
				echo('Success delete in BD download_qr');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, post, department, statusid, statustitle, cardid, cardname, date) VALUES ('$fio', '$post', '$department', '$statusid', '$statustitle', '$cardid', '$cardname', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'reject') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'id') $id = $value;
				if ($key === 'fio') $fio = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'photourl') $photourl = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
			}

			$idDepart = strtolower($nameid);
			$nameDepart = 'reject_depart_'.$idDepart;

			if ($typeTable === 'permis') {
				if($mysqli->query("DELETE FROM permission WHERE id = '$id'")) {
					echo('Success remove in BD permission');
				} else {
					echo $mysqli->error;
				}

				// Общая таблица отклоненных
				// if($mysqli->query("INSERT INTO reject (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				// 	echo('Success add in BD reject');
				// } else {
				// 	echo $mysqli->error;
				// }
			} else {
				if($mysqli->query("DELETE FROM request WHERE id = '$id'")) {
					echo('Success remove in BD request');
				} else {
					echo $mysqli->error;
				}
			}

			if ($mysqli->query("INSERT INTO `$nameDepart` (fio, post, photofile, photourl, statusid, statustitle, date) VALUES ('$fio', '$post', '$photofile', '$photourl', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'const') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'id') $id = $value;
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'photourl') $photourl = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
			}

			$typeBDTable = 'const_'.$typeTable;

			if($mysqli->query("DELETE FROM permission WHERE id = '$id'")) {
				echo('Success remove in BD permission');
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO `$typeBDTable` (fio, department, post, photofile, photourl, nameid, statusid, statustitle) VALUES ('$fio', '$department', '$post', '$photofile', '$photourl', '$nameid', '$statusid', '$statustitle')")) {
				echo('Success add in BD '.$typeBDTable);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'settings') && ($action === 'change')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'changelongname') $changelongname = $value;
				if ($key === 'changeshortname') $changeshortname = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$nameDepart = 'settings_depart_'.$idDepart;

			if($mysqli->query("UPDATE `$nameDepart` SET longname = '$changelongname', shortname = '$changeshortname' WHERE nameid = '$nameid'")) {
				echo('Success update in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("UPDATE department SET longname = '$changelongname', shortname = '$changeshortname' WHERE nameid = '$nameid'")) {
				echo('Success update in BD department');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'settings') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'addnameid') $addnameid = $value;
				if ($key === 'addlongname') $addlongname = $value;
				if ($key === 'addshortname') $addshortname = $value;
			}

			$idDepart = strtolower($item['addnameid']);
			$settingsDepart = 'settings_depart_'.$idDepart;
			$reportDepart = 'report_depart_'.$idDepart;
			$rejectDepart = 'reject_depart_'.$idDepart;
			$addDepart = 'add_depart_'.$idDepart;

			if($mysqli->query("CREATE TABLE `$settingsDepart` (
				id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
				nameid VARCHAR(20) NOT NULL,
				shortname VARCHAR(20) NOT NULL,
				longname VARCHAR(200) NOT NULL
			)")) {
				echo('Success create table '.$settingsDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("CREATE TABLE `$reportDepart` (
				id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
				fio VARCHAR(255) NOT NULL,
				post VARCHAR(255) NOT NULL,
				statusid VARCHAR(255) NOT NULL,
				statustitle VARCHAR(255) NOT NULL,
				date VARCHAR(20) NOT NULL
			)")) {
				echo('Success create table '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("CREATE TABLE `$rejectDepart` (
				id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
				fio VARCHAR(255) NOT NULL,
				post VARCHAR(255) NOT NULL,
				photofile VARCHAR(255) NOT NULL,
				photourl VARCHAR(255) NOT NULL,
				date VARCHAR(20) NOT NULL,
				statusid VARCHAR(255) NOT NULL,
				statustitle VARCHAR(255) NOT NULL
			)")) {
				echo('Success create table '.$rejectDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("CREATE TABLE `$addDepart` (
				id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
				fio VARCHAR(255) NOT NULL,
				post VARCHAR(255) NOT NULL,
				photofile VARCHAR(255) NOT NULL,
				photourl VARCHAR(255) NOT NULL,
				date VARCHAR(20) NOT NULL,
				statusid VARCHAR(255) NOT NULL,
				statustitle VARCHAR(255) NOT NULL
			)")) {
				echo('Success create table '.$addDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$settingsDepart` (nameid, longname, shortname) VALUES ('$addnameid', '$addlongname', '$addshortname')")) {
				echo('Success add in BD '.$settingsDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO department (nameid, longname, shortname) VALUES ('$addnameid', '$addlongname', '$addshortname')")) {
				echo('Success update in BD department');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'settings') && ($action === 'remove')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'removenameid') $removenameid = $value;
			}

			$idDepart = strtolower($item['removenameid']);
			$settingsDepart = 'settings_depart_'.$idDepart;
			$reportDepart = 'report_depart_'.$idDepart;
			$rejectDepart = 'reject_depart_'.$idDepart;
			$addDepart = 'add_depart_'.$idDepart;

			if($mysqli->query("DROP TABLE `$settingsDepart`, `$reportDepart`, `$rejectDepart`, `$addDepart`")) {
				echo('Success remove in BD '.$settingsDepart.', '.$reportDepart.', '.$rejectDepart.', '.$addDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("DELETE FROM department WHERE nameid = '$removenameid'")) {
				echo('Success remove in BD department');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'settings') && ($action === 'autoupdate')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'autoupdatevalue') $autoupdatevalue = $value;
				if ($key === 'autoupdatetitle') $autoupdatetitle = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$nameDepart = 'settings_depart_'.$idDepart;

			if($mysqli->query("UPDATE `$nameDepart` SET autoupdatevalue = '$autoupdatevalue', autoupdatetitle = '$autoupdatetitle'")) {
				echo('Success update in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'settings') && ($action === 'email')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'changeemail') $email = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$nameDepart = 'settings_depart_'.$idDepart;

			if($mysqli->query("UPDATE `$nameDepart` SET email = '$email'")) {
				echo('Success update in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'permis') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'id') $id = $value;
				if ($key === 'fio') $fio = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'photourl') $photourl = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'сardvalidto') $сardvalidto = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$nameDepart = 'reject_depart_'.$idDepart;

			if($mysqli->query("INSERT INTO permission (fio, department, post, photofile, photourl, nameid, statusid, statustitle, сardvalidto) VALUES ('$fio', '$department', '$post', '$photofile', '$photourl', '$nameid', '$statusid', '$statustitle', '$сardvalidto')")) {
				echo('Success add in BD permission');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("DELETE FROM `$nameDepart` WHERE id = '$id'")) {
				echo('Success remove in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'download') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'codepicture') $codepicture = $value;
				if ($key === 'cardid') $cardid = $value;
				if ($key === 'cardname') $cardname = $value;
			}

			if($mysqli->query("INSERT INTO download_qr (codepicture, cardid, cardname) VALUES ('$codepicture', '$cardid', '$cardname')")) {
				echo('Success add in BD download_qr');
			} else {
				echo $mysqli->error;
			}
		}
	}

	// echo $array;

	$mysqli->close();

?>
