<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	// var_dump($array);
	// $sumKeys;
	// $sumValues;

	foreach ($array as $item) {
		$index = 0;

		foreach ($item as $key => $value) {
			// $index == 0 ? $sumKeys = $key : $sumKeys = $sumKeys.', '.$key;
			// $index == 0 ? $sumValues = $value : $sumValues = $sumValues.', '.$value;
			if ($key === 'fio') $fio = $value;
			if ($key === 'cardname') $cardname = $value;
			if ($key === 'date') $date = $value;
			// if ($key === 'CardID') $cardid = $value;

			$index++;
		}

		// if($mysqli->query("INSERT INTO time_cards (".$sumKeys.") VALUES ('$fio', '', '', '', '$cardname', '$cardid', '', '', 1, 0, 0, 0, 0, 0, '', 1, '')")) {
		// 	echo('Success add in BD');
		// } else {
		// 	echo 'False add in BD';
		// }

		if($mysqli->query("INSERT INTO report (fio, post, department, cardname, statustitle, date) VALUES ('$fio', '', '', '$cardname', 'Новая карта', '$date')")) {
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();

?>
