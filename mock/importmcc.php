<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
    $row = 1;
        if (($handle = fopen($argv[1], "r")) !== FALSE) {
            $iit = 1;
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $iit++;
                echo "MCC :".$data[0]."/ MNC : ".$data[1]."/ISO :".$data[2]."/COUNTRY: ".$data[3]."/CALLCODE :".$data[4]."/OPNAME : ".$data[5].PHP_EOL;
                $rec = array();
                $rec['mcc'] = $data[0];
                $rec['mnc'] = $data[1];
                $rec['iso'] = $data[2];
                $rec['country'] = $data[3];
                $rec['country_code'] = $data[4];
                $rec['operator_name'] = $data[5];
                $db->operators->insert($rec);
            }
            fclose($handle);
        }