<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	var_dump($array);

	foreach ($array as $item) {
		foreach ($item as $key => $value) {
			if ($key === 'fio') $fio = $value;
			if ($key === 'cardname') $cardname = $value;
			if ($key === 'date') $date = $value;
		}

		if($mysqli->query("INSERT INTO report (fio, cardname, statustitle, date) VALUES ('$fio', '$cardname', 'Новая карта', '$date')")) {
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();

?>
