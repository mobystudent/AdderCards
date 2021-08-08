<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];
	$nameid = $_POST['nameid'];
	$nameDepart = 'reject_depart_'.$nameid;

	var_dump($array);
	var_dump($nameid);

	foreach ($array as $item) {
		foreach ($item as $key => $value) {
			if ($key === 'fio') $fio = $value;
			if ($key === 'department') $department = $value;
			if ($key === 'post') $post = $value;
			if ($key === 'nameid') $nameid = $value;
			if ($key === 'statusid') $statusid = $value;
			if ($key === 'statustitle') $statustitle = $value;
			if ($key === 'date') $date = $value;
		}

		if($mysqli->query("INSERT INTO reject (fio, department, post, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$nameid', '$statusid', '$statustitle', '$date')")) {
			echo('Success add in BD reject');
		} else {
			echo $mysqli->error;
		}

		if ($mysqli->query("INSERT INTO `$nameDepart` (fio, department, post, photofile, photourl, nameid, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$photofile', '$photourl', '$nameid', '$statusid', '$statustitle', '$date')")) {
			echo('Success add in BD '.$nameDepart);
		} else {
			echo $mysqli->error;
		}
	}

	$mysqli->close();

?>
