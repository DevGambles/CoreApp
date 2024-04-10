<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $a = $db->topuplogs->find();
                   foreach ($a as $k => $v) {
                       $v['topup_amount'] = (float)$v['topup_amount'];
                       $v['paid_amount'] = (float)$v['paid_amount'];
                       $db->topuplogs->update(array('_id' => new MongoId((string)$v['_id'])), array('$set' => array('topup_amount' => $v['topup_amount'], 'paid_amount' => $v['paid_amount'])));
                       echo "Updating ... ".(string)$v['_id'].PHP_EOL;
                   }