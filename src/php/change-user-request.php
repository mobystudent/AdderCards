<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$action = $_POST['action'];
	$nameTable = $_POST['nameTable'];
	$array = $_POST['array'];

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
			$nameDepart = 'add_depart_'.$idDepart;

			// if($mysqli->query("UPDATE `$nameDepart` SET fio = '$newfio', post = '$newpost', newphotofile = '$newphotofile', newphotourl = '$newphotourl' WHERE id = $idUser")) {
			if($mysqli->query("UPDATE `$nameDepart` SET fio = '$newfio', post = '$newpost' WHERE id = $id")) {
				echo('Success update in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, department, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
			} else {
				echo $mysqli->error;
			}
		}
	} else if (($nameTable === 'permission') && ($action === 'edit')) {
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
			$nameDepart = 'add_depart_'.$idDepart;

			if($mysqli->query("DELETE FROM `$nameDepart` WHERE id = $id")) {
				echo('Success delete in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, department, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
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
			$nameDepart = 'add_depart_'.$idDepart;
			$idNewDepart = strtolower($item['newnameid']);
			$nameNewDepart = 'add_depart_'.$idNewDepart;

			if($mysqli->query("DELETE FROM `$nameDepart` WHERE id = $id")) {
				echo('Success delete in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO `$nameNewDepart` (fio, department, nameid, post, photofile, photourl, statusid, statustitle, date) VALUES ('$fio', '$newdepart', '$newnameid', '$post', '$photofile', '$photourl', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$nameNewDepart);
			} else {
				echo $mysqli->error;
			}

			if ($mysqli->query("INSERT INTO request (fio, department, nameid, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$nameid', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD request');
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

			if ($mysqli->query("INSERT INTO `$nameDepart` (fio, department, post, photofile, photourl, nameid, statusid, statustitle, сardvalidto, date) VALUES ('$fio', '$department', '$post', '$photofile', '$photourl', '$nameid', '$statusid', '$statustitle', '$сardvalidto', '$date')")) {
				echo('Success add in BD '.$nameDepart);
			} else {
				echo $mysqli->error;
			}
		}
	}

	$mysqli->close();

?>
