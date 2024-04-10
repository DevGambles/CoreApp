<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
                   
       			$db = $conn->selectDB("padb");
                  $a = $db->accounts->find();
                    foreach ($a as $acc) {
                        $myid = new MongoId();
                        $w = array(
                            '_id' => $myid,
                            'active' => true,
                            'time' => new MongoDate(),
                            'maps' => array(
                                array(
                                    '_id' => new MongoId(),
                                    'code' => 'ALL:ALL',
                                    'profit_pct' => (float)$acc['profit_pct'],
                                    'active' => true,
                                    'time' => new MongoDate()
                                )
                            )
                        );
                        $db->profitmaps->insert($w);
                        $db->accounts->update(array('_id' => $acc['_id']), array('$set' => array('profit_map' => $myid)));
                        echo "MIGRATING : ".$acc['account_name']." NEW PROFIT MAP :".(string)$myid.PHP_EOL;
                    }