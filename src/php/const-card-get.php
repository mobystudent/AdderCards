<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$array = array();

	if($resultSet = $mysqli->query("SELECT * FROM const_card")) {
		while ($result = $resultSet->fetch_assoc()) {
			array_push($array, $result);
		}
	} else {
		echo 'False get in BD';
	}

	echo json_encode($array);


	$mysqli->close();

?>
