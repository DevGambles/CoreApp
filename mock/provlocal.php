<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
                   
       			$db = $conn->selectDB("padb");
                   $a = $db->prefixes->distinct('iso');
                   foreach ($a as $line) {
                       $b = $db->prefixes->distinct('operatorName', array('iso' => $line));
                       foreach ($b as $op) {
                           $x = $db->prefixes->findOne(array('iso' => $line, 'operatorName' => $op));
                           echo $x['iso']." ".$x['operatorName']." ".$x['operatorId'].PHP_EOL;
                           $rec = array(
                               'iso' => strtolower($x['iso']),
                               'country' => $x['country'],
                               'operator_name' => $x['operatorName'],
                               'operator_id' => $x['operatorId'],
                               'code' => strtoupper($x['iso']).":".$x['operatorId']
                           );
                           $db->provhelpers->insert($rec);
                       }
                   }