<?php

	$mysqli = new mysqli('localhost', 'root', 'root', 'security-system', 3306);
	$mysqli->query("SET NAMES 'utf8'");

	$nameTable = $_POST['nameTable'];
	$idDepart = $_POST['idDepart'];
	$typeTable = $_POST['typeTable'];
	$id = $_POST['id'];

	$array = array();

	if ($nameTable === 'reject') {
		$idDepart = strtolower($_POST['idDepart']);
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
	} else if ($nameTable === 'permis') {
		if($resultSet = $mysqli->query("SELECT * FROM permission")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'report') {
		$idDepart = strtolower($_POST['idDepart']);
		$nameDepart = 'report_depart_'.$idDepart;

		if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
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
			if($resultSet = $mysqli->query("SELECT id, post, photofile FROM `$nameDepart` WHERE id = '$id'")) {
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
	} else if ($nameTable === 'settings') {
		$idDepart = strtolower($_POST['idDepart']);
		$nameDepart = 'settings_depart_'.$idDepart;

		if($resultSet = $mysqli->query("SELECT * FROM `$nameDepart`")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'download') {
		if($resultSet = $mysqli->query("SELECT * FROM download_qr")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'contains-card') {
		if($resultSet = $mysqli->query("SELECT * FROM report WHERE statusid = 'newCard' OR statusid = 'changeCard' OR statusid = 'timeCard'")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'contains-qr') {
		if($resultSet = $mysqli->query("SELECT * FROM report WHERE statusid = 'newQR' OR statusid = 'changeQR'")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'names') {
		$nameDepart = strtolower($_POST['nameDepart']);
		$addDepart = 'add_depart_'.$nameDepart;

		if($resultSet = $mysqli->query("SELECT * FROM `$addDepart`")) {
			while ($result = $resultSet->fetch_assoc()) {
				array_push($array, $result);
			}
		} else {
			echo $mysqli->error;
		}
	} else if ($nameTable === 'filter') {
		$nameDepart = strtolower($_POST['nameDepart']);
		$reportDepart = 'report_depart_'.$nameDepart;
		$options = $_POST['options'];

		if ($options) {
			$filterContent = '';

			foreach ($options as $key => $value) {
				if ($filterContent === '') {
					if ($key === 'date') {
						$filterContent .= $key.' LIKE "%'.$value.'%"';
					} else {
						$filterContent .= $key.' = "'.$value.'"';
					}
				} else {
					if ($key === 'date') {
						$filterContent .= ' AND '.$key.' LIKE "%'.$value.'%"';
					} else {
						$filterContent .= ' AND '.$key.' = "'.$value.'"';
					}
				}
			}

			if($resultSet = $mysqli->query("SELECT * FROM `$reportDepart` WHERE ".$filterContent."")) {
				while ($result = $resultSet->fetch_assoc()) {
					array_push($array, $result);
				}
			} else {
				echo $mysqli->error;
			}
		} else {
			if($resultSet = $mysqli->query("SELECT * FROM `$reportDepart`")) {
				while ($result = $resultSet->fetch_assoc()) {
					array_push($array, $result);
				}
			} else {
				echo $mysqli->error;
			}
		}
	}

	echo json_encode($array);

	$mysqli->close();

?>
