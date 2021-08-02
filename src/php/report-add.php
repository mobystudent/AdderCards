<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];
	$action = $_POST['action'];

	var_dump($array);
	var_dump($action);

	foreach ($array as $item) {
		$index = 0;

		foreach ($item as $key => $value) {
			if ($key === 'fio') $fio = $value;
			if ($key === 'cardname') $cardname = $value;
			if ($key === 'date') $date = $value;

			$index++;
		}

		if($mysqli->query("INSERT INTO report (fio, post, department, cardname, statustitle, date) VALUES ('$fio', '', '', '$cardname', 'Новая карта', '$date')")) {
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();

?>
