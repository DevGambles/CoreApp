<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $a = $db->transfertoprices->distinct("operator_id");
                   foreach($a as $b) {
                       $c = $db->transfertoprices->findOne(array('operator_id' => $b));
                       $oper = str_replace($c['country'], '', $c['operator_name']);
                       $mr = new MongoRegex("/".trim($oper)."/i");
                       $tr = $db->triangloprices->findOne(array('country' => trim($c['country']), 'operator_name' => $mr));
                       if ($tr) {
                           //echo "FOUND MATCH : ".$c['operator_id']." ".$tr['operator_id'].PHP_EOL;
                           $rec = array(
                               'country' => $c['country'],
                               'operator_name' => $oper,
                               'trt_id' => $c['operator_id'],
                               'trl_id' => $tr['operator_id']
                           );
                           $db->provmappings->insert($rec);
                       } else {
                           //echo "NO MATCH FOUND FOR : ".$c['operator_id']." ".$c['country']." ".$c['operator_name']." SEARCH-STRING :".$mr.PHP_EOL;
                         echo   $c['country'].",".$oper.",".$c['operator_id'].PHP_EOL;
                       }

                   }