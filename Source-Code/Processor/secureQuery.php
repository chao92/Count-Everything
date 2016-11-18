<?php 
# for debug
#set_time_limit(10);
ini_set('max_execution_time', 10);
ini_set ("display_errors", "1");
error_reporting(E_ALL);
require_once("../java/Java.inc");
if(file_get_contents("./working.txt") == "1")
{
	exit(1);
}
else
{
	file_put_contents("./working.txt", "1");
}
$time_start = microtime(true);
ob_start();
function parseURL(){
	$queryString = $_SERVER['QUERY_STRING'];
	return $queryString;
}
$queryString = parseURL();
echo $queryString."<br/>";
$test = substr(urldecode($queryString),1,-1);
//-------------------------PIC-SURE--------------------------------------
echo "<br>"."Query PIC-SURE:"."<br>";
ob_flush();
flush();
# find the first position of md2k
$startwithMD2K = 'md2k';
$pos = strpos($test,$startwithMD2K);
$subPICSURE = substr($test,0,$pos);
$arrs = preg_split("/AND/",$subPICSURE);
array_pop($arrs);
$PICSUREQueryString = join('AND',$arrs);
$PICSUREURL="http://169.228.52.150:8080/JavaBridge/evalWithCache.php?";
$passToPICSURE = $PICSUREURL.$queryString;
echo $passToPICSURE."<br>";
ob_flush();
flush();
//-------------------------MD2K--------------------------------------
echo "<br>"."Query MD2K:"."<br>";
ob_flush();
flush();
preg_match_all("/[\(]+md2k.*/",$test,$queryMD2K);
$inputMD2K = reset($queryMD2K[0]);
$startwithGA4GH = 'ga4gh';
$pos = strpos($inputMD2K,$startwithGA4GH);
$subMD2K = substr($inputMD2K,0,$pos);
$MD2Karrs = preg_split("/AND/",$subMD2K);
array_pop($MD2Karrs);
$md2kQueryString = join('AND',$MD2Karrs);
$MD2KURL="http://169.228.52.143:8080/JavaBridge/parseQuery.php?";
$passToMD2K = $MD2KURL.urlencode($md2kQueryString);
echo $passToMD2K."<br>";
//-------------------------GA4GH--------------------------------------
echo "<br>"."Query GA4GH:"."<br>";
ob_flush();
flush();
preg_match_all("/[\(]+ga4gh.*/",$test,$queryGA4GH);
$GA4GH = reset($queryGA4GH[0]);
$GA4GHURL="http://169.228.52.151:8080/JavaBridge/GA4GHQuery.php?";
$passToGA4GH = $GA4GHURL.urlencode($GA4GH);
echo urldecode($passToGA4GH)."<br>";
flush();
// build the individual requests, but do not execute them
$ch_1 = curl_init('http://csp.ucsd-dbmi.org:8080/JavaBridge/beta2/T_CSP.php');
$ch_2 = curl_init('http://counteverything.ucsd-dbmi.org:8080/JavaBridge/beta2/T_PRO.php');
$ch_3 = curl_init($passToPICSURE);
$ch_4 = curl_init($passToMD2K);
$ch_5 = curl_init($passToGA4GH);
curl_setopt($ch_1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch_2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch_3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch_4, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch_5, CURLOPT_RETURNTRANSFER, true);
// build the multi-curl handle, adding both $ch
$mh = curl_multi_init();
curl_multi_add_handle($mh, $ch_1);
curl_multi_add_handle($mh, $ch_2);
curl_multi_add_handle($mh, $ch_3);
curl_multi_add_handle($mh, $ch_4);
curl_multi_add_handle($mh, $ch_5);
// execute all queries simultaneously, and continue when all are complete
$running = 0;
//execute the handles
do {
	curl_multi_exec($mh, $running);
	curl_multi_select($mh);
} while ($running > 0);
//close the handles
curl_multi_remove_handle($mh, $ch_1);
curl_multi_remove_handle($mh, $ch_2);
curl_multi_remove_handle($mh, $ch_3);
curl_multi_remove_handle($mh, $ch_4);
curl_multi_remove_handle($mh, $ch_5);
curl_multi_close($mh);
// all of our requests are done, we can now access the results
$response_1 = curl_multi_getcontent($ch_1);
$time_end = microtime(true);
$time = $time_end - $time_start;
echo "<br>Total time is $time seconds<br>";
echo "<br>result<br>";
echo substr_count($response_1,'1');
file_put_contents("./working.txt", "0");
?>
