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
$query = "INSERT INTO users VALUES('$user','$points');";
$qry_result = mysqli_query($con,$query) or die(mysql_error());

	//Build Result String


// Insert a new row in the table for each person returned
//$res = mysqli_fetch_row($qry_result);

echo $qry_result;//$res[0];
mysqli_close($con);
?>