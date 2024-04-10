<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   //can Update own acl
                   $db->users->update(array(), array('$set' => array('pos_access' => true, 'sms_access' => true, 'account_access' => true, 'transactions_access' => true, 'pins_access' => true, 'jobs_access' => true, 'price_access' => true, 'price_access' => true, 'topuplog_access' => true, 'support_access' => true, 'balance_access' => true)));
                   
