<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$action = $_POST['action'];
	$nameTable = $_POST['nameTable'];
	$array = $_POST['array'];
	$typeTable = $_POST['typeTable'];

	var_dump($array);

	if (($nameTable === 'add') && ($action === 'edit')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
				if ($key === 'id') $id = $value;
				if ($key === 'newfio') {
					$newfio = $item['newfio'] ? $value : $item['fio'];
				}
				if ($key === 'newpost') {
					$newpost = $item['newpost'] ? $value : $item['post'];
				}
				// if ($key === 'newphotofile') {
				// 	$newpost = $item['newphotofile'] ? $value : $item['photofile'];
				// }
				// if ($key === 'newphotourl') {
				// 	$newpost = $item['newphotourl'] ? $value : $item['photourl'];
				// }
			}

			$idDepart = strtolower($item['nameid']);
			$addDepart = 'add_depart_'.$idDepart;
			$reportDepart = 'report_depart_'.$idDepart;

			// if($mysqli->query("UPDATE `$nameDepart` SET fio = '$newfio', post = '$newpost', newphotofile = '$newphotofile', newphotourl = '$newphotourl' WHERE id = $idUser")) {
			if($mysqli->query("UPDATE `$addDepart` SET fio = '$newfio', post = '$newpost' WHERE id = $id")) {
				echo('Success update in BD '.$addDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, department, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$reportDepart` (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, department, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$statusid', '$statustitle', '$date')")) {
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
				if ($key === 'department') $department = $value;
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

			if ($mysqli->query("INSERT INTO request (fio, department, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$reportDepart` (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, department, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'add') && ($action === 'transfer')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
				if ($key === 'id') $id = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'photourl') $photourl = $value;
				if ($key === 'newnameid') $newnameid = $value;
				if ($key === 'newdepart') $newdepart = $value;
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

			if ($mysqli->query("INSERT INTO `$newDepart` (fio, department, nameid, post, photofile, photourl, statusid, statustitle, date) VALUES ('$fio', '$newdepart', '$newnameid', '$post', '$photofile', '$photourl', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$newDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, department, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO `$reportDepart` (fio, post, statusid, statustitle, date) VALUES ('$fio', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$reportDepart);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, department, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$statusid', '$statustitle', '$date')")) {
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
				if ($key === 'photourl') $photourl = $value;
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

			if ($mysqli->query("INSERT INTO `$nameDepart` (fio, department, post, photofile, photourl, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$photofile', '$photourl', '$nameid', '$statusid', '$statustitle', '$date')")) {
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
				if ($key === 'date') $date = $value;
			}

			if($mysqli->query("INSERT INTO report (fio, cardname, statustitle, date) VALUES ('$fio', '$cardname', 'Новая карта', '$date')")) {
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
				if ($key === 'department') $department = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'cardid') $cardid = $value;
				if ($key === 'cardname') $cardname = $value;
				if ($key === 'date') $date = $value;

				if ($key === 'nameid') $nameid = $value; // - заменить на id
			}

			$typeBDTable = 'const_'.$typeTable;

			echo $nameid;

			// if($mysqli->query("DELETE FROM `$typeBDTable` WHERE id = $id")) {
			if($mysqli->query("DELETE FROM `$typeBDTable` WHERE nameid = '$nameid'")) {
				echo('Success delete in BD '.$typeBDTable);
			} else {
				echo $mysqli->error;
			}

			if($mysqli->query("INSERT INTO report (fio, post, department, statusid, statustitle, cardid, cardname, date) VALUES ('$fio', '$post', '$department', '$statusid', '$statustitle', '$cardid', '$cardname', '$date')")) {
				echo('Success add in BD report');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'permis') && ($action === 'remove')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				// if ($key === 'id') $id = $value; - заменить на id
				if ($key === 'nameid') $nameid = $value;
			}

			if($mysqli->query("DELETE FROM permission WHERE nameid = '$nameid'")) {
				echo('Success remove in BD permission');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'reject') && ($action === 'add')) {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				// if ($key === 'id') $id = $value; - заменить на id
				if ($key === 'id') $id = $value;
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'photofile') $photofile = $value;
				if ($key === 'photourl') $photourl = $value;
				if ($key === 'nameid') $nameid = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
			}

			$idDepart = strtolower($item['nameid']);
			$nameDepart = 'reject_depart_'.$idDepart;

			if($mysqli->query("DELETE FROM permission WHERE nameid = '$nameid'")) {
				echo('Success remove in BD permission');
			} else {
				echo $mysqli->error;
			}

			// Общая таблица отклоненных
			// if($mysqli->query("INSERT INTO reject (fio, department, post, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$nameid', '$statusid', '$statustitle', '$date')")) {
			// 	echo('Success add in BD reject');
			// } else {
			// 	echo $mysqli->error;
			// }


			if ($mysqli->query("INSERT INTO `$nameDepart` (fio, department, post, photofile, photourl, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$photofile', '$photourl', '$nameid', '$statusid', '$statustitle', '$date')")) {
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
				if ($key === 'nameid') $nameid = $value; // - заменить на id
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
			}

			$typeBDTable = 'const_'.$typeTable;

			if($mysqli->query("DELETE FROM permission WHERE nameid = '$nameid'")) {
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
	} else if (($nameTable === 'settings') && ($action === 'add')) {
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
	}

	$mysqli->close();

?>
