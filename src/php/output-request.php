<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$nameTable = $_POST['nameTable'];
	$idDepart = $_POST['idDepart'];
	$typeTable = $_POST['typeTable'];

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
	} else if ($nameTable === 'const') {
		$typeBDTable = 'const_'.$typeTable;

		if($resultSet = $mysqli->query("SELECT * FROM `$typeBDTable`")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'permission') {
		if($resultSet = $mysqli->query("SELECT * FROM permission")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($data, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'report') {
		if($resultSet = $mysqli->query("SELECT * FROM report")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($data, $result);
			}
		} else {
			echo $mysqli->error;
		}
	}

	echo json_encode($array);

	$mysqli->close();

?>
