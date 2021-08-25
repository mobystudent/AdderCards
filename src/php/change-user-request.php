<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$action = $_POST['action'];
	$nameTable = $_POST['nameTable'];
	$array = $_POST['array'];
	$nameid = strtolower($_POST['nameid']);
	$nameDepart = 'add_depart_'.$nameid;

	var_dump($array);
	// echo($nameid);
	// echo($nameDepart);

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
	}

	$mysqli->close();

?>
