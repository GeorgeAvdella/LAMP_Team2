<?php
$in_data = json_decode(file_get_contents('php://input'), true);
if( !is_array($in_data) ) {
	header('Content-type: application/json');
	echo json_encode(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"Invalid request"]);
	exit();
}

$first_name = trim($in_data["firstName"] ?? "");
$last_name= trim( $in_data["lastName"] ?? "" );
$login = trim($in_data["login"] ?? "");
$password= $in_data["password"] ?? "";

if($first_name=="" || $last_name=="" || $login=="" || $password=="")
{
	header('Content-type: application/json');
	echo json_encode(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"Missing required fields"]);
	exit();
}

$cfg = require __DIR__ . "/config.php";
$conn = new mysqli( $cfg["db_host"],$cfg["db_user"], $cfg["db_pass"],$cfg["db_name"] );
if( $conn->connect_error )
{
	header('Content-type: application/json');
	echo json_encode(["id"=>0,"firstName"=>"","lastName"=>"","error"=>$conn->connect_error]);
	exit();
}

$stmt=$conn->prepare("SELECT ID FROM Users WHERE Login=? LIMIT 1");
$stmt->bind_param("s",$login );
$stmt->execute();
$result = $stmt->get_result();
if( $result && $result->fetch_assoc() )
{
	$stmt->close(); $conn->close();
	header('Content-type: application/json');
	echo json_encode(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"Login already exists"]);
	exit();
}
$stmt->close();

$stmt = $conn->prepare("INSERT INTO Users (firstName, lastName, Login, Password) VALUES (?,?,?,?)");
$stmt->bind_param("ssss", $first_name , $last_name,$login,$password);
if( $stmt->execute() )
{
	$id = $conn->insert_id;
	$stmt->close(); $conn->close();
	header('Content-type: application/json');
	echo json_encode(["id"=>$id,"firstName"=>$first_name,"lastName"=>$last_name,"error"=>""]);
}
else
{
	$err = $stmt->error;
	$stmt->close(); $conn->close();
	header('Content-type: application/json');
	echo json_encode(["id"=>0,"firstName"=>"","lastName"=>"","error"=>$err]);
}

?>
