<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
                   
       			$db = $conn->selectDB("padb");
                   $a = $db->provmappings->distinct('country');
                   foreach ($a as $line) {
                       $l = $db->provmappings->findOne(array('country' => $line));
                       $arr = array(
                           'iso' => $l['iso'],
                           'country' => $line,
                           'code' => strtoupper($l['iso']).":ALL"
                       );
                       $db->countryhelpers->insert($arr);
                   }
                   $b = $db->countryhelpers->distinct('iso');
                   foreach ($b as $i) {
                       $ll = $db->provmappings->find(array('iso' => $i));
                       foreach ($ll as $z => $prv) {
                           $brr = array(
                               'iso' => $i,
                               'country' => $prv['country'],
                               'operator_name' => $prv['operator_name'],
                               'operator_id' => $prv['trl_id'],
                               'code' => strtoupper($i).":".$prv['trl_id']
                           );
                           $db->provhelpers->insert($brr);
                       }
                   }
                   $db->provhelpers->remove(array('iso' => array('$in' => array('bd', 'ng', 'gh'))));
