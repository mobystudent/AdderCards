<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$data = array();

	if($resultSet = $mysqli->query("SELECT * FROM reject")) {
		while ($result = $resultSet->fetch_assoc()) {
			array_push($data, $result);
		}
	} else {
		echo $mysqli->error;
	}

	echo json_encode($data);

	$mysqli->close();

?>
