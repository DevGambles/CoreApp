<?php
$cfg = parse_ini_file(__DIR__ . "/../.env");
$conn = new MongoClient("mongodb://" . $cfg['DBSLAVE'] . ":27017 ");
$connw = new MongoClient("mongodb://". $cfg['DBHOST'] . ":27017 ");
MongoCursor::$timeout = -1;
MongoCursor::$slaveOkay = true;
if (!$conn) {
    die('Error Connecting to DB using driver MongoDB');
}
$db = $conn->selectDB("padb");
$dbw = $connw->selectDB("padb");
$a = $db->accounts->find(array('type' => 'agent'));
foreach ($a as $b) {
//    if($b['_id'] == "5859207abb440b23863a90f8")
    {
        echo "Account : " . $b['account_name'] . " Was Created On : " . date('Y-m-d H:i:s', $b['createdAt']->sec) . PHP_EOL;
        $x = $db->accounts->findOne(array('_id' => $b['_id']));
        $sec = $x['createdAt']->sec;
        $accstat = [];
        $day_start = strtotime(date('Y-m-d 00:00:00', $x['createdAt']->sec));
        $start_of_mo = time() - (86400 * 365);
        $day_created = $day_start;
        $day_end = strtotime(date('Y-m-d 23:59:59', $x['createdAt']->sec));

        $current_time = time() ;
        $y = date('Y',$current_time);
        $m = date('m',$current_time);
        $d = date('d',$current_time);
        $h = date('H',$current_time);
        $min = date('i',$current_time);
        $s = date('s',$current_time);
        $w = date('w',$current_time);
        $t = date('t',$current_time);
        
        $timestr = $y.'-01-01 00:00:00';
        $start_of_year = strtotime($timestr);
        $end_of_year = $current_time;

        if($m==1 && $d==1){
            $timestr = ($y-1).'-01-01 00:00:00';
            $start_of_year = strtotime($timestr);
            $timestr = $y.'-01-01 00:00:00';
            $end_of_year = strtotime($timestr);
        }

        $txperday = [];
        $topperday = [];
        $pipe3 = array(
            array('$match' => array(
                'account' => $x['_id'],
                'time' => array('$gte' => new MongoDate($start_of_year), '$lte' => new mongodate($end_of_year))
            )),
            array('$group' => array(
                '_id' => array( 'country' => '$country' , 'operator_name' => '$operator_name'),
                'amount' => array('$sum' => 1)
            )
            ),
            array('$sort' => array(
                'amount' => -1
            ))
        );
        $pipe4 = array(
            array('$match' => array(
                'account' => $x['_id'],
                'time' => array('$gte' => new MongoDate($start_of_year), '$lte' => new mongodate($end_of_year))
            )),
            array('$group' => array(
                '_id' => array( 'country' => '$country' , 'operator_name' => '$operator_name'),
                'amount' => array('$sum' => '$paid_amount')
            )
            ),
            array('$sort' => array(
                'amount' => -1
            ))
        );
        $res3 = $db->topuplogs->aggregate($pipe3);
        $res4 = $db->topuplogs->aggregate($pipe4);
    
        $top5 = [];
        $top5amt = [];
        $resu = [];
        $resu2 = [];
        foreach ($res3['result'] as $r) {
    
            $top5[$r['_id']['country'] . "-" . $r['_id']['operator_name']] = array($r['_id']['operator_name'], $r['_id']['country']);
            echo "TOP5n" . print_r($r, true) . PHP_EOL;
    
        }
        foreach ($res4['result'] as $r) {
            $top5amt[$r['_id']['country'] . "-" . $r['_id']['operator_name']] = array($r['_id']['operator_name'], $r['_id']['country']);
    
        }
        $pipe6 = array(
            array('$match' => array(
                'account' => $x['_id'],
                'time' => array('$gte' => new MongoDate($start_of_year), '$lte' => new mongodate($end_of_year))
            )),
            array(
                '$group' => array(
                    '_id' => array('code' => '$code', 'paid_currency' => '$paid_currency'),
                    'count' => array('$sum' => 1),
                    'amount' => array('$sum' => '$paid_amount')
                )
            ),
            array('$sort' => array(
                'count' => -1
            ))
        );
            $pipe7 = array(
                array('$match' => array(
                    'account' => $x['_id'],
                    'time' => array('$gte' => new MongoDate($start_of_year), '$lte' => new mongodate($end_of_year))
                )),
                array(
                    '$group' => array(
                        '_id' => array('code' => '$code', 'paid_currency' => '$paid_currency' , 'country' => '$country' , 'operator_name' => '$operator_name'),
                        'count' => array('$sum' => 1),
                        'amount' => array('$sum' => '$paid_amount')
                    )
                ),
                array('$sort' => array(
                    'count' => -1
                ))
            );
        $res6 = $db->topuplogs->aggregate($pipe6);
            $res7 = $db->topuplogs->aggregate($pipe7);
        $dstats = array();
        $current_time = time() ;
        for ($i = 12; $i > 0; $i--) {
    
            $dresu = array();
            $timestr = $y.'-'.(12-$i+1).'-01 00:00:00';
            $start = strtotime($timestr);
            $timestr = $y.'-'.(12-$i+2).'-01 00:00:00';
            $end = strtotime($timestr);
                $index = 0;
            foreach ($top5 as $entry) {
                $z = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'operator_name' => $entry[0], 'country' => $entry[1]))->count();
                    $resu[$index] = array(
                    'country' => $entry[1],
                    'operator_name' => $entry[0],
                    'count' => $z,
                    'date' => date('m.Y', $start),
			'ts' => new MongoDate($start)
                );
                    $index++;
    
            }
                $index = 0;
            echo "ENTRY0 " . print_r($resu, true) . PHP_EOL;
            foreach ($top5amt as $entry) {
                $z = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'operator_name' => $entry[0], 'country' => $entry[1]));
                $amt = 0;
                foreach ($z as $l) {
                    $amt += (float)$l['paid_amount'];
                }
                    $resu2[$index] = array(
                    'country' => $entry[1],
                    'operator_name' => $entry[0],
                    'amount' => $amt,
                    'date' => date('m.Y', $start),
			'ts' => new MongoDate($start)
                );
                    $index++;
            }
            //success vs failed
            $pipess = array( ////Dragon Added 2017.11.10 22:00
                                //for making successful count field
                    array('$match' => array(
                        'account' => $x['_id'],
                        'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end) ),
                        'success' => true
                    )),
                    array('$group' => array(
                        '_id' => array( 'country' => '$country' , 'operator_name' => '$operator_name'),
                        'amount' => array('$sum' => 1),
                        
                    )),
                    array('$sort' => array(
                        'amount' => -1
                    ))
                    
                );
                $ressux = $db->topuplogs->aggregate($pipess);
                    
                $pipeff = array( ////Dragon Added 2017.11.10 22:00
                                    //for making successful count field
                    array('$match' => array(
                        'account' => $x['_id'],
                        'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end) ),
                        'success' => false
                    )),
                    array('$group' => array(
                        '_id' => array( 'country' => '$country' , 'operator_name' => '$operator_name'),
                        'amount' => array('$sum' => 1),
            
                    )
                    ),
                    array('$sort' => array(
                        'amount' => -1
                    ))
                    );
                $resfail = $db->topuplogs->aggregate($pipeff);
                $rr = array('ts' => new MongoDate($start), 'sux'=>$ressux['result'],'fail'=>$resfail['result']);
            $suxx = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => true))->count();
            $fail = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => false))->count();
            $ch_web = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'web'))->count();
            $ch_api = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'api'))->count();
            $ch_pinp = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'pinp'))->count();
            $ch_ivr = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'ivr'))->count();
            $ov = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => true))->count();
            $dresu[$i]['top5_dest_count'] = $resu;
            $dresu[$i]['top5_dest_amount'] = $resu2;
            $dresu[$i]['suxx_vs_fail'] = array('ts' => new MongoDate($start), 'successful' => $suxx, 'failed' => $fail, 'date' => date('m.Y', $start));
            $dresu[$i]['topups_by_channel'] = array('ts' => new MongoDate($start), 'web' => $ch_web, 'api' => $ch_api, 'pinp' => $ch_pinp, 'ivr' => $ch_ivr, 'date' => date('m.Y', $start));
            $dresu[$i]['dest_suxx_vs_fail'] = $rr;//dragon added       
            array_push($dstats, $dresu[$i]);
        }
        print_r($dstats);
    
        //dragon added 2017_11_12_11_30 for Topup/Paid amount
        $pipe8 = array(//paid_amount
            array('$match' => array(
                'account' => $x['_id'],
                'time' => array('$gte' => new MongoDate($start_of_year), '$lte' => new mongodate($end_of_year)),
            )),
            array('$group' => array(
                    '_id' => array('country'=>'$country','paid_currency'=>'$paid_currency','operator_name'=>'$operator_name','code'=>'$code'),
                    'paid_amount'=>array('$sum'=>'$paid_amount'),
                    'paid_count'=>array('$sum'=>1)
            )),
            array('$sort' => array(
                'count' => -1
            ))
        );
        $res8 = $db->topuplogs->aggregate($pipe8);

        $pipe9 = array(//topup_amount
            array('$match' => array(
                'account' => $x['_id'],
                'time' => array('$gte' => new MongoDate($start_of_year), '$lte' => new mongodate($end_of_year)),
            )),
            array('$group' => array(
                    '_id' => array('country'=>'$country','topup_currency'=>'$topup_currency','operator_name'=>'$operator_name','code'=>'$code'),
                    'topup_amount'=>array('$sum'=>'$topup_amount'),
                    'topup_count'=>array('$sum'=>1)
            )),
            array('$sort' => array(
                'count' => -1
            ))
        );
        $res9 = $db->topuplogs->aggregate($pipe9);

        ///////////////////////////////////////////////////////////////////


        $ins = array(
            'account' => $x['_id'],
            'time' => new MongoDate(),
            'amounts_by_code' => $res6['result'],
            'dest_amounts_by_code' => $res7['result'],
            'stats' => $dstats,
            'paid_amount' => $res8['result'],
            'topup_amount' => $res9['result']
        );
        $dbw->yearstats->insert($ins);
    }
    
}
                
                   
