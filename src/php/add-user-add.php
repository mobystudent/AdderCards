<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];
	$nameid = strtolower($_POST['nameid']);
	$nameDepart = 'user_depart_'.$nameid;

	var_dump($array);
	var_dump($nameid);
	var_dump($nameDepart);

	foreach ($array as $item) {
		foreach ($item as $key => $value) {
			if ($key === 'fio') $fio = $value;
			if ($key === 'department') $department = $value;
			if ($key === 'post') $post = $value;
			if ($key === 'photofile') $photofile = $value;
			if ($key === 'nameid') $nameid = $value;
			if ($key === 'statusid') $statusid = $value;
			if ($key === 'statustitle') $statustitle = $value;
			if ($key === 'date') $date = $value;
		}

		if($mysqli->query("INSERT INTO add_user (fio, department, post, photofile, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$photofile', '$nameid', '$statusid', '$statustitle', '$date')")) {
			echo('Success add in BD add_user');
		} else {
			echo 'False add in BD add_user';
		}

		if ($mysqli->query("INSERT INTO `$nameDepart` (fio, department, post, photofile, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$photofile', '$nameid', '$statusid', '$statustitle', '$date')")) {
			echo('Success add in BD '.$nameDepart);
		} else {
			echo 'False add in BD '.$nameDepart;
		}
	}

	$mysqli->close();

?>
