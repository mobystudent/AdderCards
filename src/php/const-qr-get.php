<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$data = array();

	if($resultSet = $mysqli->query("SELECT * FROM const_qr")) {
		while ($result = $resultSet->fetch_assoc()) {
			array_push($data, $result);
		}
	} else {
		echo 'False get in BD';
	}

	echo json_encode($data);

	$mysqli->close();

?>
