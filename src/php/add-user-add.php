<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];
	$nameid = strtolower($_POST['nameid']);
	$nameDepart = 'add_depart_'.$nameid;

	var_dump($array);
	echo($nameid);
	echo($nameDepart);

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
			if ($key === 'date') $date = $value;
		}

		if($mysqli->query("INSERT INTO permission (fio, department, post, photofile, nameid, statusid, statustitle) VALUES ('$fio', '$department', '$post', '$photofile', '$nameid', '$statusid', '$statustitle')")) {
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

	$mysqli->close();

?>
