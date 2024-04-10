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
                $arr = array(
                    'country' => $data[0],
                    'operator_name' => $data[1],
                    'trt_id' => $data[2],
                    'trl_id' => $data[3]
                );
                $db->provmappings->insert($arr);
                echo "IMPORTING : ".$data[1].PHP_EOL;
            }
            fclose($handle);
        }