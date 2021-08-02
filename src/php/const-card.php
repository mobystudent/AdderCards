<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	foreach ($array as $item) {
		$index = 0;

		foreach ($item as $key => $value) {
			if ($key === 'fio') $fio = $value;
			if ($key === 'post') $post = $value;
			if ($key === 'department') $department = $value;
			if ($key === 'nameid') $nameid = $value;
			if ($key === 'statusid') $statusid = $value;
			if ($key === 'statustitle') $statustitle = $value;

			$index++;
		}

		if($mysqli->query("INSERT INTO const_card (fio, post, department, nameid, statusid, statustitle) VALUES ('$fio', '$post', '$department', '$nameid', '$statusid', '$statustitle')")) {
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();

?>
