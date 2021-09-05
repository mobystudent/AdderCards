<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$nameTable = $_POST['nameTable'];
	$idDepart = $_POST['idDepart'];

	$array = array();

	if ($nameTable === 'reject') {
		$nameDepart = 'reject_depart_'.$idDepart;

		if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}

		echo json_encode($array);
	}

	$mysqli->close();

?>
