<?php
$in_data = json_decode(file_get_contents('php://input'), true);
if( !is_array($in_data) ) {
	header('Content-type: application/json');
	echo json_encode(["error"=>"Invalid request"]);
	exit();
}

$user_id = $in_data["userId"] ?? 0;
$contact_id = $in_data["contactId"] ?? 0;
$first_name = trim($in_data["firstName"] ?? "");
$last_name  = trim($in_data["lastName"] ?? "");
$phone = trim($in_data["phone"] ?? "");
$email= trim($in_data["email"] ?? "");

if ($user_id <= 0 || $contact_id <= 0)
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

$stmt = $conn->prepare("UPDATE Contacts SET firstName=?, lastName=?, phone=?, email=? WHERE ID=? AND UserID=?");
$stmt->bind_param("ssssii", $first_name, $last_name, $phone, $email, $contact_id, $user_id);
if ($stmt->execute())
{
	$rows = $stmt->affected_rows;
	$stmt->close();
	$conn->close();
	if ($rows === 0)
	{
		header('Content-type: application/json');
		echo json_encode(["error"=>"No Records Found"]);
	}
	else
	{
		header('Content-type: application/json');
		echo json_encode(["error"=>""]);
	}
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
