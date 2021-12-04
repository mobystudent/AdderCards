<?php
	$sender = $_POST['sender'];
	$recipient = $_POST['recipient'];
	$subject = $_POST['subject'];
	$message = $_POST['message'];

	use PHPMailer\PHPMailer\Exception;
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;

	require './phpmailer/src/Exception.php';
	require './phpmailer/src/PHPMailer.php';
	require './phpmailer/src/SMTP.php';

	$mail = new PHPMailer();
	$mail->CharSet = 'UTF-8';
	$mail->setLanguage('ru', './phpmailer/language/');

	try {
		//Server settings
		//$mail->SMTPDebug = SMTP::DEBUG_SERVER; //Enable verbose debug output
		$mail->SMTPDebug = 1;
		$mail->IsSMTP(); //Send using SMTP
		$mail->Host = 'ssl://smtp.ukr.net'; //Set the SMTP server to send through
		$mail->SMTPAuth = true; //Enable SMTP authentication
		$mail->Username = $sender; //SMTP username
		$mail->Password = 'UgOLFBiVTvWZ5Cru'; //SMTP password /UgOLFBiVTvWZ5Cru
		// $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;			//Enable implicit TLS encryption
		$mail->SMTPSecure = 'ssl';
		$mail->Port = 465; //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
		$mail->Mailer = "smtp";

		//Recipients
		$mail->setFrom($sender);
		$mail->addAddress($recipient, 'Recipient'); //Add a recipient

		//Content
		$mail->IsHTML(); //Set email format to HTML
		$mail->Subject = $subject;
		$mail->Body = $message;

		$mail->send();
	} catch (Exception $e) {
		echo "Message could not be sent. Mailer Error: { $mail->ErrorInfo }";
	}
?>
