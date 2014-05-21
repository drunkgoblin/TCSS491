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

$query = "SELECT points FROM users WHERE username = '$user'";
$qry_result = mysqli_query($con,$query) or die(mysql_error());
$res = mysqli_fetch_row($qry_result);
$count = mysqli_num_rows($qry_result);
if ($count < 1) {
    $res = "false";
	echo $res;
} else {
    echo $res[0];
}
mysqli_free_result($qry_result);
mysqli_close($con);
?>
