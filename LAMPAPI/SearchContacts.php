<?php
    $in_data = json_decode(file_get_contents('php://input'), true);

    $user_id = $in_data["userId"] ?? 0;
    $search  = $in_data["search"] ?? ""; 

    if ($user_id <= 0) {
        echo json_encode(["error" => "Invalid User ID", "results" => []]);
        exit();
    }

    $cfg = require __DIR__ . "/config.php";
    $conn = new mysqli($cfg["db_host"], $cfg["db_user"], $cfg["db_pass"], $cfg["db_name"]);

    // if string has space then it might be first and last name
    if (strpos($search, " ") !== false) {
        $names = explode(" ", $search, 2); 
        
        $sql = "SELECT ID, firstName, lastName, Phone, Email FROM Contacts 
                WHERE UserID = ? AND (firstName LIKE ? AND lastName LIKE ?)";
        
        $stmt = $conn->prepare($sql);
        
        $firstParam = "%" . $names[0] . "%";
        $lastParam  = "%" . $names[1] . "%";
        
        $stmt->bind_param("iss", $user_id, $firstParam, $lastParam);

    } else {
        // or just search by single term, first/last/email/phone
    
        $sql = "SELECT ID, firstName, lastName, Phone, Email FROM Contacts 
                WHERE UserID = ? AND (firstName LIKE ? OR lastName LIKE ? OR Email LIKE ? OR Phone LIKE ?)";
        
        $stmt = $conn->prepare($sql);
        $search_param = "%" . $search . "%";
        
        $stmt->bind_param("issss", $user_id, $search_param, $search_param, $search_param, $search_param);
    }

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
