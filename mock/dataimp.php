<?php
//db stuff
$conn  = new MongoClient( "mongodb://10.127.8.10:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
    $row = 1;
    $db->dataprods->remove();
        if (($handle = fopen($argv[1], "r")) !== FALSE) {
            $iit = 1;
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $iit++;
                //echo "DIAL :".$data[0]." COUNTRY :".$data[1]."/MINL :".$data[5]." MAXL :".$data[9].PHP_EOL;
                
                $a = array(
                    'apid' => $data[0],
                    'iso' => $data[1],
                    'acloperid' => $data[2],
                    'sku' => $data[3],
                    'psku' => $data[4],
                    'use_psku' => (bool)$data[5],
                    'name' => $data[6],
                    'operator_id' => $data[7],
                    'data_amount' => $data[8],
                    'topup_price' => (int)$data[9],
                    'topup_currency' => $data[10],
                    'price' => $data[11],
                    'step' => $data[12],
                    'fx_rate' => (float)$data[13],
                    'currency' => $data[14],
                    'active' => (bool)$data[15],
                    'country' => $data[16]
                );
                $db->dataprods->insert($a);
                
            }
            fclose($handle);
        }