<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = $_POST['array'];

	var_dump($array);

	foreach ($array as $item) {
		foreach ($item as $key => $value) {
			if ($key === 'nameid') $nameid = $value;
		}

		if($mysqli->query("DELETE FROM permission WHERE nameid = '$nameid'")) {
			echo('Success remove in BD permission');
		} else {
			echo $mysqli->error;
		}
	}

	$mysqli->close();

?>
