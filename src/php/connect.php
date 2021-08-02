<?php

	$mysqli = new mysqli("localhost", "root", "root", "security-system");
	$mysqli->query ("SET NAMES 'utf8'");

	echo('Hello');

	$mysqli->close();//закрываем соединение с БД

?>
