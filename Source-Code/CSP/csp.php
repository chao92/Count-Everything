<?php
ini_set('max_execution_time', 10);
ini_set ("display_errors", "1");
error_reporting(E_ALL);
require_once("../java/Java.inc");
session_start();
$_SESSION['status'] = 'busy'; 
$CSP_addr = "csp.ucsd-dbmi.org";
$PRO_addr = "counteverything.ucsd-dbmi.org";
$CSP_port = 9000;
$PRO_port = 9010;
$Bit_num = 1024;
$Thr_num = 6;
$Party_num = 3;
//CSP(CSP_port, numOfParties, numOfThreads, numOfBits)
$CSP = new java("Parties.CSP",$CSP_port,$Party_num,$Thr_num,$Bit_num);
$CSP->run();
echo $CSP->getResults();
$_SESSION['status'] = 'free'; 
?>
