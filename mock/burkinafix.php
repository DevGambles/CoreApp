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
               // echo "DIAL :".$data[0]." COUNTRY :".$data[1]."/MINL :".$data[5]." MAXL :".$data[9].PHP_EOL;
               $rec = array(
                'prefix' => $data[0],
                'iso' => 'bf',
                'country' => 'Burkina Faso',
                'operator_name' => 'Orange',
                'trt_id' => '99999',
                'trl_id' => 'BF_OR',
                'active' => true,
                'time' => new MongoDate()
               );
                $db->gloprefixes->insert($rec);
                
            }
            fclose($handle);
        }