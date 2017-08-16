<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RTCMultiConnection

require('write-json.php');
require('get-param.php');
require('enableCORS.php');

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

// "me" stands for "Current User Unique ID"
$me = getParam('me');

$json = file_get_contents('./rooms/' . $me . '.json');
$json = json_decode($json, true);

echo 'data: ' . json_encode($json) . "\n\n";

foreach ($json as $receiver => $val) {
    // skip duplicate entries for future requests
    // todo: find a better solution to clear only entries; NOT the entire JSON.
    removeJSON($me, $receiver);
}

ob_flush();
flush();
?>
