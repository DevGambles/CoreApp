<?php
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
               //    $a = $db->accounts->find();
                 //  foreach ($a as $b) {
                   //    echo "Account : ".$b['account_name']." Was Created On : ".date('Y-m-d H:i:s', $b['createdAt']->sec).PHP_EOL;
                   //}
                   /*
                        Amount of transactions per day
                   */

                   $x = $db->accounts->findOne(array('_id' => new MongoId("5859207abb440b23863a90f8")));
                   echo "Account : ".$x['account_name']." Was created on : ".date('Y-m-d H:i:s', $x['createdAt']->sec).PHP_EOL;
                   $sec = $x['createdAt']->sec;
                   $day_start = strtotime(date('Y-m-d 00:00:00', $x['createdAt']->sec));
                   $day_created = $day_start;
                   $day_end = strtotime(date('Y-m-d 23:59:59', $x['createdAt']->sec));
                   $txperday = [];
                   $topperday = [];
                   while ($day_end < time()) {
                        $today = date('Ymd', $day_start);
                        $txperday[$today] = 0;
                        $topperday[$today] = 0;
                        $trx1 = $db->transactions->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($day_start), '$lte' => new MongoDate($day_end))));
                   echo "Transactions Made between : ".date('Y-m-d H:i:s', $day_start)." and ".date('Y-m-d H:i:s', $day_end).PHP_EOL;
                   foreach($trx1 as $trx) {
                       echo "Transaction : ".PHP_EOL;
                      $txperday[$today]++;
                   }
                   $top1 = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($day_start), '$lte' => new MongoDate($day_end))));
                    echo "Topups Made between : ".date('Y-m-d H:i:s', $day_start)." and ".date('Y-m-d H:i:s', $day_end).PHP_EOL;
                    foreach($top1 as $top) {
                        echo "Topup".PHP_EOL;
                        $topperday[$today]++;
                    }
                   $day_start += 86400;
                   $day_end += 86400;
                   }
                   print_r($txperday);
                   print_r($topperday);
                   