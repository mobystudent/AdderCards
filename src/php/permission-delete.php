<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	var_dump($array);

	foreach ($array as $item) {
		$index = 0;

		foreach ($item as $key => $value) {
			if ($key === 'nameid') $nameid = $value;

			$index++;
		}

		if($mysqli->query("DELETE FROM permission WHERE nameid = '$nameid'")) {
			echo('Success add in BD');
		} else {
			echo 'False add in BD';
		}
	}

	$mysqli->close();

?>
