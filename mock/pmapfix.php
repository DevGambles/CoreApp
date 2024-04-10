<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $a = $db->provmappings->find();
                   foreach ($a as $b) {
                       $co = $db->operators->findOne(array('country' => new MongoRegex('/'.trim($b['country'].'/i') ) ) );
                       if ($co) {
                           $db->provmappings->update(array('_id' => new MongoId( (string)$b['_id'] )), array('$set' => array('iso' => $co['iso']) ) );
                       } else {
                           continue;
                       }
                   }