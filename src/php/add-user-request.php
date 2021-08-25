<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$nameTable = $_POST['nameTable'];
	$array = $_POST['array'];

	var_dump($array);

	if ($nameTable === 'request') {
		foreach ($array as $item) {
			foreach ($item as $key => $value) {
				if ($key === 'fio') $fio = $value;
				if ($key === 'department') $department = $value;
				if ($key === 'post') $post = $value;
				if ($key === 'statusid') $statusid = $value;
				if ($key === 'statustitle') $statustitle = $value;
				if ($key === 'date') $date = $value;
			}

			if($mysqli->query("INSERT INTO `$nameTable` (fio, department, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$statusid', '$statustitle', '$date')")) {
				echo('Success add in BD '.$nameTable);
			} else {
				echo $mysqli->error;
			}

			// if ($mysqli->query("INSERT INTO `$nameDepart` (fio, department, post, statusid, statustitle, date) VALUES ('$fio', '$department', '$post', '$photourl', '$statusid', '$statustitle', '$date')")) {
			// 	echo('Success add in BD '.$nameDepart);
			// } else {
			// 	echo $mysqli->error;
			// }
		}
	}

	$mysqli->close();

?>
