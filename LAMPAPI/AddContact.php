<?php
$in_data = json_decode(file_get_contents('php://input'), true);
if( !is_array($in_data) ) {
	header('Content-type: application/json');
	echo json_encode(["error"=>"Invalid request"]);
	exit();
}

$user_id = $in_data["userId"] ?? 0;
$first_name = trim($in_data["firstName"] ?? "");
$last_name= trim($in_data["lastName"] ?? "");
$phone = trim( $in_data["phone"] ?? "" );
$email= trim($in_data["email"] ?? "");

if ($user_id <= 0 || ($phone=="" && $email==""))
{
	header('Content-type: application/json');
	echo json_encode(["error"=>"Missing required fields"]);
	exit();
}

$cfg = require __DIR__ . "/config.php";
$conn = new mysqli($cfg["db_host"], $cfg["db_user"], $cfg["db_pass"], $cfg["db_name"]);
if ($conn->connect_error)
{
	header('Content-type: application/json');
	echo json_encode(["error"=>$conn->connect_error]);
	exit();
}

$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $first_name, $last_name, $phone, $email, $user_id);
if ($stmt->execute())
{
	$stmt->close();
	$conn->close();
	header('Content-type: application/json');
	echo json_encode(["error"=>""]);
}
else
{
	$err = $stmt->error;
	$stmt->close();
	$conn->close();
	header('Content-type: application/json');
	echo json_encode(["error"=>$err]);
}

?>
