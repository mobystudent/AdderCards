<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$idDepart = strtolower($_POST['idDepart']);
	$id = $_POST['id'];
	$nameDepart = 'add_depart_'.$idDepart;

	if ($id) {
		if($resultSet = $mysqli->query("SELECT id, post, photourl FROM `$nameDepart` WHERE id = '$id'")) {
			$array = $resultSet->fetch_assoc();
		} else {
			echo $mysqli->error;
		}
	} else {
		$array = array();

		if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
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
