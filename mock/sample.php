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
$conn = new MongoClient("mongodb://" . $cfg['DBHOST'] . ":27017 ");
MongoCursor::$timeout = -1;

if (!$conn) {
    die('Error Connecting to DB using driver MongoDB');
}
$db = $conn->selectDB($cfg['DBNAME']);
$a = $db->accounts->find(array('type' => array('$nin' => ['agent', 'system'])));
foreach ($a as $b) {
        
    if($b['_id']=="5842ec6ab8c649bd5397188f"){
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
        $start_of_mo = time() - (86400 * 365);
        $day_created = $day_start;
        $day_end = strtotime(date('Y-m-d 23:59:59', $x['createdAt']->sec));
        $txperday = [];
        $topperday = [];
        $dstats = array();


         //dragon added for adding topagents
         $pipeagent = array(//top agent
            array('$match' => array(
                'account' => array('$in' => $accsa),
                'time' => array('$gte' => new MongoDate($start_of_mo), '$lte' => new MongoDate()),
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
        print_r($topagentArray);
        $current_time = time() ;


        for ($i = 12; $i > 0; $i--) {
            //dragon added 11_28 for topAgent
            $dresu = array();
            $start = ($current_time - ((86400 * 30) * $i));
            $end = ($start + (86400 * 30));
            $index = 0;
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
                            '_id' => array('account'=>'$account','paid_currency'=>'$paid_currency'),
                            'paid_amount'=>array('$sum'=>'$paid_amount'),
                            'paid_count'=>array('$sum'=>1)
                    )),
                    array('$sort' => array(
                        'paid_amount' => -1
                    ))
                );
                $resagent1 = $db->topuplogs->aggregate($pipeagent1);
                
                if(sizeof($resagent1['result'])==1)
                    array_push($resagentArray,array('_id'=>$resagent1['result']['0']['_id'],'account_name' => $item['account_name'],'paid_amount'=>$resagent1['result']['0']['paid_amount'],'paid_count'=>$resagent1['result']['0']['paid_count']));

            }
            $dresu[$i]['top_agent'] = $resagentArray;
            array_push($dstats, $dresu[$i]);

        }
        $ins = array(
            'stats' => $dstats,
        );
        //print_r($ins);

        $db->yearlystats->insert($ins);
    }
 //   print_r($dstats);
}