<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	// var_dump($array);
	$sumKeys;
	// $sumValues;

	foreach ($array as $item) {
		$index = 0;

		foreach ($item as $key => $value) {
			$index == 0 ? $sumKeys = $key : $sumKeys = $sumKeys.', '.$key;
			// $index == 0 ? $sumValues = $value : $sumValues = $sumValues.', '.$value;
			if ($key === 'FIO') $fio = $value;
			if ($key === 'CardName') $cardname = $value;
			if ($key === 'CardID') $cardid = $value;

			$index++;
		}

		if($mysqli->query("INSERT INTO time_cards (".$sumKeys.") VALUES ('$fio', '', '', '', '$cardname', '$cardid', '', '', 1, 0, 0, 0, 0, 0, '', 1, '')")) {
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();//закрываем соединение с БД

?>
