<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $a = $db->accounts->find();
                   foreach($a as $b) {
                       $newacc = $b['currency'].rand(10000000, 99999999);
                       echo "Migrating Account : ".$b['account_name']." BALANCE : ".$b['balance']." ".$b['currency']." TO WALLET : ".$newacc.PHP_EOL;
                       $wa = array(
                            "_id" => new MongoId(),
                            "wallet_name" => $b['currency']." Wallet",
                            "wallet_id" => $newacc,
                            "currency" => $b['currency'],
                            "balance" => (float)$b['balance'],
                            "primary" => true,
                            "active" => true,
                            "virtual" => false,
                            "parent_wallet" => null
                       );
                       $db->accounts->update(array("_id" => $b['_id']), array('$push' => array('wallets' => $wa)));

                   }