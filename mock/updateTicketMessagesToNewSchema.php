<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   //can Update own acl
                   $a = $db->ticketmsgs->find();
                   foreach ($a as $b) {
                       $x = $db->users->findOne(array('_id' => $b['author']));
                       if ($x !== null) {
                           $newname = $x['first_name'].' '.$x['last_name'];
                           echo "Updating : ".$newname.PHP_EOL;
                           $db->ticketmsgs->update(array('_id' => $b['_id']), array('$set' => array( 'author_name' => $newname )));
                       } else {
                           echo "Could not find user with ID : ".(string)$b['author'].PHP_EOL;
                       }
                   }