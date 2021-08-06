<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query("SET NAMES 'utf8'");

	$data = array();
	$nameid = strtolower($_POST['nameid']);
	$nameDepart = 'user_depart_'.$nameid;

	if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
		while ($result = $resultSet->fetch_assoc()) {
			array_push($data, $result);
		}
	} else {
		echo 'False get in BD '.$nameDepart;
	}

	echo json_encode($data);

	$mysqli->close();

?>
