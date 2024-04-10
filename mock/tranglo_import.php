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
                if ($data[1] == 'Country')
                    continue;
                $rec = array();
                $rec['operator_id'] = $data[0];
                $rec['country'] = $data[1];
                $rec['operator_name'] = trim(str_replace($rec['country'], "", $data[2]));
                $rec['currency'] = $data[3];
                $rec['min_denomination'] = $data[4];
                $rec['max_denomination'] = $data[5];
                $rec['step'] = $data[6];
                $rec['unit_cost'] = $data[7];
                $rec['rate'] = $data[8];
                print_r($rec);
           $db->triangloprices->insert($rec);
            }
            fclose($handle);
        }