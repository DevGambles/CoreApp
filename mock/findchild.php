<?php
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                  $me =  $db->accounts->findOne(array('_id' => new MongoId("5842ec6ab8c649bd5397188f")));
                  //step1 
                  $s1 = $db->accounts->find(array('parent' => $me['_id']));
                  $accs = array();
                  $accsa = array();
                  foreach ($s1 as $s) {
                    array_push($accs, $s['_id']);
                    if ($s['type'] == 'agent') {
                        array_push($accsa, $s['_id']);
                    }
                    $ss = $db->accounts->find(array('parent' => $s['_id']));
                    foreach ($ss as $as) {
                        array_push($accs, $as['_id']);
                        if ($as['type'] == 'agent') {
                        array_push($accsa, $as['_id']);
                    }
                    }
                  }
                  print_r($accs);
                  echo " +======AGENTS=====".PHP_EOL;
                  print_r($accsa);