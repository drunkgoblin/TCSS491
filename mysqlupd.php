<?php
header('Access-Control-Allow-Origin: *');
$dbhost = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "Fatcat";
	//Connect to MySQL Server
$con=mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);
	//Select Database
//mysql_select_db($dbname) or die(mysql_error());
	// Retrieve data from Query String
$user = $_POST['user_name'];
$points = $_POST['points'];
	// Escape User Input to help prevent SQL Injection
//$user = mysql_real_escape_string($age);
	//build query
$query = "UPDATE users SET points= '$points' WHERE username = '$user'";
$qry_result = mysqli_query($con,$query) or die(mysql_error());

echo $qry_result;
mysqli_close($con);
?>