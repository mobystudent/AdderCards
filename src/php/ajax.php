<?php

$ftp_host = 'ftp:192.168.56.101';
$ftp_port = 22;
$ftp_timeout = 300;

$ftp_connection = ftp_connect($ftp_host, $ftp_port, $ftp_timeout);

?>
