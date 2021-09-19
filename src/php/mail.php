<?php
	$sender = $_POST['sender'];
	$recipient = $_POST['recipient'];
	$subject = $_POST['subject'];
	$message = $_POST['message'];

	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\Exception;

	require '../phpmailer/src/Exception.php';
	require '../phpmailer/src/PHPMailer.php';

	$mail = new PHPMailer(true);
	$mail->CharSet = 'UTF-8';
	$mail->setLanguage('ru', '../phpmailer/language/');

	try {
		//Server settings
		// $mail->SMTPDebug = SMTP::DEBUG_SERVER;					  //Enable verbose debug output
		// $mail->isSMTP();											//Send using SMTP
		// $mail->Host	   = 'smtp.example.com';					 //Set the SMTP server to send through
		// $mail->SMTPAuth   = true;								   //Enable SMTP authentication
		// $mail->Username   = 'user@example.com';					 //SMTP username
		// $mail->Password   = 'secret';							   //SMTP password
		// $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;			//Enable implicit TLS encryption
		// $mail->Port	   = 465;									//TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
		
		//Recipients
		$mail->setFrom($sender, 'Управление охраны и безопасности');
		$mail->addAddress($recipient, 'Химический факультет');	 //Add a recipient

		//Content
		$mail->isHTML(true);								  //Set email format to HTML
		$mail->Subject = $subject;
		$mail->Body	= $message;

		$mail->send();
	} catch (Exception $e) {
		echo "Message could not be sent. Mailer Error: { $mail->ErrorInfo }";
	}
