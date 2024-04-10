<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $a = $db->transactions->find();
                   foreach ($a as $k => $v) {
                       $v['amount'] = (float)$v['amount'];
                       $db->transactions->update(array('_id' => new MongoId((string)$v['_id'])), array('$set' => array('amount' => $v['amount'] ) ) );
                       echo "Updating ... ".(string)$v['_id'].PHP_EOL;
                   }