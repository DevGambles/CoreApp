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
                //echo "DIAL :".$data[0]." COUNTRY :".$data[1]."/MINL :".$data[5]." MAXL :".$data[9].PHP_EOL;
                echo "CurSymbol : ".$data[2]." Name : ".$data[1].PHP_EOL;
                $a = array(
                    'symbol' => $data[2],
                    'name' => $data[1]
                );
                $db->currencies->insert($a);
                
            }
            fclose($handle);
        }