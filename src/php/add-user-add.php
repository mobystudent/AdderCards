<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	var_dump($array);

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
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();

?>
