<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$nameTable = $_POST['nameTable'];
	$idDepart = $_POST['idDepart'];
	$typeTable = $_POST['typeTable'];
	$id = $_POST['id'];

	$array = array();

	if ($nameTable === 'reject') {
		if($resultSet = $mysqli->query("SELECT * FROM request")) {
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
	} else if ($nameTable === 'permis') {
		if($resultSet = $mysqli->query("SELECT * FROM permission")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'report') {
		if($resultSet = $mysqli->query("SELECT * FROM report")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'request') {
		if($resultSet = $mysqli->query("SELECT * FROM request")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if (($nameTable === 'edit') || ($nameTable === 'remove')) {
		$idDepart = strtolower($_POST['idDepart']);
		$nameDepart = 'add_depart_'.$idDepart;

		if ($id) {
			if($resultSet = $mysqli->query("SELECT id, post, photourl FROM `$nameDepart` WHERE id = '$id'")) {
				$array = $resultSet->fetch_assoc();
			} else {
				echo $mysqli->error;
			}
		} else {
			if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
				while ($result = $resultSet->fetch_assoc()) {
					array_push($array, $result);
				}
			} else {
				echo $mysqli->error;
			}
		}
	} else if ($nameTable === 'department') {
		if($resultSet = $mysqli->query("SELECT * FROM department")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	}

	echo json_encode($array);

	$mysqli->close();

?>
