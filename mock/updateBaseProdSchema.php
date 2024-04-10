<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   //can Update own acl
                   $a = $db->baseprods->find();
                   foreach ($a as $b) {
                        $s = explode('-', $b['sku']);
                        $db->baseprods->update(array('_id' => $b['_id']), array('$set' => array('apid' => $s[0])));
                           echo "Updating : ".$b['sku'].PHP_EOL;
                    
                   }