<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   //can Update own acl
                   $db->accounts->update(array('type' => 'wholesaler'), array('$set' => array('epin_enabled' => false)));
                   