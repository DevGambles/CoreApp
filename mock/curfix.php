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
                echo "DIAL :".$data[0]." COUNTRY :".$data[1]."/MINL :".$data[5]." MAXL :".$data[9].PHP_EOL;
                $curs = $db->operators->find(array("country_code" => $data[0]));
                foreach ($curs as $k => $v) {
                    $db->operators->update(array("_id" => new MongoId((string)$v['_id'])), array('$set' => array("min_length" => $data[5], "max_length" => $data[9])));
                }
                
            }
            fclose($handle);
        }