<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   //can Update own acl
                   $a = $db->accounts->find(array('type' => 'wholesaler'));
                   foreach ($a as $b) {
                        $s = array('TRTO', 'TRLO', 'MFIN', 'ETRX', 'SSLW');
                        $db->accounts->update(array('_id' => $b['_id']), array('$set' => array('permitted_apis' => $s)));
                           echo "Updating : ".$b['account_name'].PHP_EOL;
                    
                   }