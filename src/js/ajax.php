<?php

$ftp_host = 'ftp_user@192.168.56.101';
$ftp_port = 21;
$ftp_timeout = 300;

$ftp_connection = ftp_connect($ftp_host, $ftp_port, $ftp_timeout) or die("Не удалось установить соединение с $ftp_host");



?>
