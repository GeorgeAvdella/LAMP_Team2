<?php
$in_data = json_decode(file_get_contents('php://input'), true);

$user_id = $in_data["userId"] ?? 0;
$search  = $in_data["search"] ?? ""; // empty for show all

if ($user_id <= 0) {
    echo json_encode(["error" => "Invalid User ID", "results" => []]);
    exit();
}

$cfg = require __DIR__ . "/config.php";
$conn = new mysqli($cfg["db_host"], $cfg["db_user"], $cfg["db_pass"], $cfg["db_name"]);

//  query must include id for the delete buttons to work
$sql = "SELECT ID, firstName, lastName, Phone, Email FROM Contacts 
        WHERE UserID = ? AND (firstName LIKE ? OR lastName LIKE ? OR Email LIKE ?)";

$stmt = $conn->prepare($sql);
$search_param = "%" . $search . "%";
$stmt->bind_param("isss", $user_id, $search_param, $search_param, $search_param);
$stmt->execute();
$result = $stmt->get_result();

$search_results = [];
while ($row = $result->fetch_assoc()) {
    $search_results[] = $row;
}

echo json_encode(["results" => $search_results, "error" => ""]);

$stmt->close();
$conn->close();
?>