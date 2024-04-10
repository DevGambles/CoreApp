<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   //can Update own acl
                   $db->accounts->update(array(), array('$set' => array('canEditOwnAcl' => true)));
				   $db->rates->update(array(), array('$set' => array('dynamic' => false)));
                   