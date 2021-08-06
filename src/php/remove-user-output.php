<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$nameid = strtolower($_POST['nameid']);
	$id = $_POST['id'];
	$nameDepart = 'user_depart_'.$nameid;

	if ($id) {
		if($resultSet = $mysqli->query("SELECT photourl, post FROM `$nameDepart` WHERE id = '$id'")) {
			$data = $resultSet->fetch_assoc();
		} else {
			echo 'False get in BD '.$nameDepart;
		}
	} else {
		$data = array();

		if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($data, $result);
			}
		} else {
			echo 'False get in BD '.$nameDepart;
		}
	}

	echo json_encode($data);

	$mysqli->close();

?>
