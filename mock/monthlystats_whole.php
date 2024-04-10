<?php
/*
$database_url = '';
$database_name = '';
if ($file = fopen("../.env", "r")) {
    while(!feof($file)) {
        $line = fgets($file);
		$strlist = explode('=',$line);
        if($strlist[0] == 'DBHOST')
		{
			$database_url ="mongodb://" . trim($strlist[1]) . ":27017" ;
		}
		if($strlist[0] == 'DBNAME')
		{
			$database_name = trim($strlist[1]);
		}
    }
    fclose($file);
}
$conn  = new MongoClient( $database_url );
*/
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
$a = $db->accounts->find(array('type' => array('$nin' => ['agent', 'system'])));
foreach ($a as $b) {
            $s1 = $db->accounts->find(array('parent' => $b['_id']));
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
    echo "Account : " . $b['account_name'] . " Was Created On : " . date('Y-m-d H:i:s', $b['createdAt']->sec) . PHP_EOL;
    $x = $db->accounts->findOne(array('_id' => $b['_id']));
            array_push($accs, $x['_id']);
    $sec = $x['createdAt']->sec;
    $accstat = [];
    $day_start = strtotime(date('Y-m-d 00:00:00', $x['createdAt']->sec));
    $start_of_month = time() - (86400 * 30);
    $day_created = $day_start;
    $day_end = strtotime(date('Y-m-d 23:59:59', $x['createdAt']->sec));
    $txperday = [];
    $topperday = [];
    $pipe3 = array(
        array('$match' => array(
                    'account' => array('$in' => $accsa),
            'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate())
        )),
        array('$group' => array(
            '_id' => array('country' => '$country' , 'operator_name' => '$operator_name'),
            'amount' => array('$sum' => 1)
                )),
        array('$sort' => array(
            'amount' => -1
        ))
    );
    $res3 = $db->topuplogs->aggregate($pipe3);

    $top5 = [];
    $top5amt = [];
    $resu = [];
    $resu2 = [];
    foreach ($res3['result'] as $r) {

        $top5[$r['_id']['country'] . "-" . $r['_id']['operator_name']] = array($r['_id']['operator_name'], $r['_id']['country']);
        echo "TOP5n" . print_r($r, true) . PHP_EOL;

    }
    $pipe6 = array(
        array('$match' => array(
                    'account' => array('$in' => $accsa),
            'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate())
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
            $pipe7d = array(
                array('$match' => array(
                    'account' => array('$in' => $accs),
                    'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate()),
                    'type' => 'deb'
                )),
                array(
                    '$group' => array(
                        '_id' => '$currency',
                        'amount' => array('$sum' => '$amount')
                    )
                ),
                array('$sort' => array(
                    'amount' => -1
                ))
            );
            $pipe7c = array(
                array('$match' => array(
                    'account' => array('$in' => $accs),
                    'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate()),
                    'type' => 'crd'
                )),
                array(
                    '$group' => array(
                        '_id' => '$currency',
                        'amount' => array('$sum' => '$amount')
                    )
                ),
                array('$sort' => array(
                    'amount' => -1
                ))
            );
            $res7d = $db->transactions->aggregate($pipe7d);
            $res7c = $db->transactions->aggregate($pipe7c);
        $pipe7 = array(
            array('$match' => array(
                'account' => array('$in' => $accsa),
                'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate())
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
            $bals = array();
            foreach ($accs as $aa) {
                $zz = $db->accounts->findOne(array('_id' => $aa));
                foreach ($zz['wallets'] as $z) {
                    if (isset($bals[$z['currency']])) {
                        $bals[$z['currency']] += round($z['balance'], 2);
                    } else {
                        $bals[$z['currency']] = round($z['balance'], 2);
                    }
                }
            }
            
            //dragon added for adding topagents
            $pipeagent = array(//top agent
                array('$match' => array(
                    'account' => array('$in' => $accsa),
                    'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate()),
                )),
                array('$group' => array(
                        '_id' => array('account'=>'$account','paid_currency'=>'$paid_currency'),
                        'paid_amount'=>array('$sum'=>'$paid_amount')
                )),
                array('$sort' => array(
                    'paid_amount' => -1
                ))
            );
            $resagent = $db->topuplogs->aggregate($pipeagent);
            $topagentArray = array();
            $objagent = $resagent['result'];
            for($ii=0;$ii<sizeof($objagent);$ii++){
                if(!in_array($objagent[$ii]['_id']['account'],$topagentArray))
                    array_push($topagentArray,$objagent[$ii]['_id']['account']);
            }
            $count = sizeof($topagentArray);
            ///topagent
            
    $current_time = time() ;
    for ($i = 30; $i > 0; $i--) {

        $dresu = array();
            $start = ($current_time - (86400 * $i));
        $end = ($start + 86400);
            $index = 0;
        foreach ($top5 as $entry) {
            echo "ENTRY TOP5 " . $entry[0] . PHP_EOL;
                    $z = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'operator_name' => $entry[0], 'country' => $entry[1]))->count();
                $resu[$index] = array(
                'country' => $entry[1],
                'operator_name' => $entry[0],
                'count' => $z,
                'date' => date('d.m.Y', $start),
		'ts' => new MongoDate($end)
            );
                $index++;

        }
            $index = 0;
        echo "ENTRY0 " . print_r($resu, true) . PHP_EOL;
        foreach ($top5amt as $entry) {
            echo "ENTRY TOP5 AMT " . $entry[0] . PHP_EOL;
                    $z = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'operator_name' => $entry[0], 'country' => $entry[1]));
            $amt = 0;
            foreach ($z as $l) {
                $amt += (float)$l['paid_amount'];
            }
                $resu2[$index] = array(
                'country' => $entry[1],
                'operator_name' => $entry[0],
                'amount' => $amt,
                'date' => date('d.m.Y', $start),
		'ts' => new MongoDate($end)
            );
                $index++;
        }
                //
                //dragon added 11_28 for topAgent
                $resagentArray = array();
                for($j=0;$j<$count;$j++){
                    $theObjId = new MongoId($topagentArray[$j]);
                    $item = $db->accounts->findOne(array('_id' => $theObjId));
                    $pipeagent1 = array(//top agent
                        array('$match' => array(
                            'account' => $topagentArray[$j],
                            'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)),
                        )),
                        array('$group' => array(
                                '_id' => array('account'=>'$account','paid_currency'=>'$paid_currency','topup_currency'=>'$topup_currency'),
                                'paid_amount'=>array('$sum'=>'$paid_amount'),
                                'paid_count'=>array('$sum'=>1),
                                'topup_amount'=>array('$sum'=>'$topup_amount'),
                                'topup_count'=>array('$sum'=>1)
                        )),
                        array('$sort' => array(
                            'paid_amount' => -1
                        ))
                    );
                    $resagent1 = $db->topuplogs->aggregate($pipeagent1);
                    if(sizeof($resagent1['result'])>=1){
                        for($ii = 0;$ii<sizeof($resagent1['result']);$ii++){
                            array_push($resagentArray,array('_id'=>$resagent1['result'][$ii]['_id'],'account_name' => $item['account_name'],'paid_amount'=>$resagent1['result'][$ii]['paid_amount'],'paid_count'=>$resagent1['result'][$ii]['paid_count'],
                            'topup_amount'=>$resagent1['result'][$ii]['topup_amount'],'topup_count'=>$resagent1['result'][$ii]['topup_count']));
                        }
                    }
                }
                
                //
        //success vs failed
        $pipess = array( ////Dragon Added 2017.11.10 22:00
                                //for making successful count field
            array('$match' => array(
                        'account' => array('$in' => $accsa),
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
                        'account' => array('$in' => $accsa),
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
        $rr = array('sux'=>$ressux['result'],'fail'=>$resfail['result'], 'ts' => new MongoDate($end));
                $suxx = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => true))->count();
                $fail = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => false))->count();
                $ch_web = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'web'))->count();
                $ch_api = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'api'))->count();
                $ch_pinp = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'pinp'))->count();
                $ch_ivr = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'ivr'))->count();
    
                $ov = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => true))->count();
        $dresu[$i]['top5_dest_count'] = $resu;
        $dresu[$i]['top5_dest_amount'] = $resu2;
        $dresu[$i]['suxx_vs_fail'] = array('successful' => $suxx, 'failed' => $fail, 'date' => date('d.m.Y', $start), 'ts' => new MongoDate($end));
        $dresu[$i]['topups_by_channel'] = array('web' => $ch_web, 'api' => $ch_api, 'pinp' => $ch_pinp, 'ivr' => $ch_ivr, 'date' => date('d.m.Y', $start), 'ts' => new MongoDate($end));
                $dresu[$i]['txvolume'] = array('crd' => $res7c['result'], 'deb' => $res7d['result'], 'ts' => new MongoDate($end));
                $dresu[$i]['bals'] = $bals;
        $dresu[$i]['dest_suxx_vs_fail'] = $rr;//dragon added
                $dresu[$i]['top_agent'] = $resagentArray;
        array_push($dstats, $dresu[$i]);
    }
    print_r($dstats);

    //dragon added 2017_11_12_11_30 for Topup/Paid amount
    $pipe8 = array(//paid_amount
        array('$match' => array(
                    'account' => array('$in' => $accsa),
            'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate()),
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
                    'account' => array('$in' => $accsa),
            'time' => array('$gte' => new MongoDate($start_of_month), '$lte' => new MongoDate()),
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
                'count_by_code' => $res6['result'],
                'dest_count_by_code' => $res7['result'],
        'stats' => $dstats,
        'paid_amount' => $res8['result'],
        'topup_amount' => $res9['result']
    );
    $dbw->monthlystats->insert($ins);
}
                
                   
