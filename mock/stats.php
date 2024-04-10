<?php
//db stuff
//$conn  = new MongoClient( "mongodb://localhost:27017 ");
$cfg = parse_ini_file(__DIR__ . "/../.env");
$conn = new MongoClient("mongodb://" . $cfg['DBHOST'] . ":27017 ");
MongoCursor::$timeout = -1;
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $obj = [];
                   /*
                   1. getting Sum of all balances from the system ok
                   2. getting provider balances 
                   3. getting top 5 countries used for topups (count) ok 
                   4. getting top 5 countries used for topups (amount) ok 
                   4. getting top 5 most spending accounts
                        getting top 5 most active accounts (by topup count)
                   5. getting all transactions for past 24 hours (success / fail)
                   */
 
                  $walletarray = array();
                  $accs = $db->accounts->find();
                  echo "accs:" . print_r($accs) . PHP_EOL;
                  foreach($accs as $acc){
                       $warray = $acc['wallets'];
                       foreach($warray as $w){
                           array_push($walletarray,array('_id'=>$w['currency'],'totalAmmount'=>$w['balance'],
                                'account'=>$acc['_id'],'account_name'=>$acc['account_name']));
                       }
                  }
                  echo "walletarray:" . print_r($walletarray) . PHP_EOL;
                  $obj['balances'] = $walletarray;

                  

/*
                   $pipe1 = array(
                    array(
                        '$group' => array(
                            '_id' => '$paid_currency',
                            'totalAmmount' => array('$sum' => '$paid_amount')
                        )
                    )
                   );
                   $res = $db->accounts->aggregate($pipe1);
                   $obj['balances'] = $res['result'];
*/
                 $pipe2 = array(
                    array(
                        '$group' => array(
                            '_id' => '$currency',
                            'count' => array('$sum' => 1)
                        )
                    ),
                    array('$sort' => array(
                        'count' => -1
                    )),
                    array('$limit' => 5)
                   );
                   $res2 = $db->topuplogs->aggregate($pipe2);

                   $obj['top5_countries_topup_count'] = $res2['result'];

                   $pipe3 = array(
                    array(
                        '$group' => array(
                            '_id' => '$country',
                            'amount' => array('$sum' => '$paid_amount')
                        )
                    ),
                    array('$sort' => array(
                        'amount' => -1
                    )),
                    array('$limit' => 5)
                   );
                   $res3 = $db->topuplogs->aggregate($pipe3);

                   $obj['top5_countries_topup_amount'] = $res3['result'];

                    $pipe4 = array(
                    array(
                        '$group' => array(
                            '_id' => '$account',
                            'amount' => array('$sum' => '$paid_amount')
                        )
                    ),
                    array('$sort' => array(
                        'amount' => -1
                    )),
                    array('$limit' => 5)
                   );
                   $res4 = $db->topuplogs->aggregate($pipe4);

                   $obj['top5_accounts_topup_amount'] = $res4['result'];

                   $pipe5 = array(
                    array(
                        '$group' => array(
                            '_id' => '$account',
                            'count' => array('$sum' => 1)
                        )
                    ),
                    array('$sort' => array(
                        'count' => -1
                    )),
                    array('$limit' => 5)
                   );

                   $res5 = $db->topuplogs->aggregate($pipe5);

                   $obj['top5_accounts_topup_count'] = $res5['result'];


                   $pipe6 = array(
                    array(
                        '$group' => array(
                            '_id' => '$code',
                            'count' => array('$sum' => 1)
                        )
                    ),
                    array('$sort' => array(
                        'count' => -1
                    )),
                    array('$limit' => 5)
                   );

                   $res6 = $db->topuplogs->aggregate($pipe6);

                   $obj['top5_operations_bycode'] = $res6['result'];
                   $obj['total_operations_count'] = $db->topuplogs->find()->count();

                   $obj['time'] = new MongoDate();
                   $db->corestats->insert($obj);
                   