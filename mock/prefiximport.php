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
               $prfx = $data[0];
               $iso = $data[1];
               $op = $data[2];
               if (strpos($op, '-')) {
                   //we have mobile oper line 
                   $oper = explode("-", $op);
                   $qry = $db->provmappings->findOne(array(
                       'iso' => trim(strtolower($iso)),
                       'operator_name' => new MongoRegex('/'.trim($oper[1]).'/i')
                   ));
                   if ($qry !== NULL) {
                        echo "FOUND : ".$iso." ".$oper[1]." ".$qry['operator_name']." ".$qry['trl_id'].PHP_EOL;
                        $rec = array(
                            'prefix' => $prfx,
                            'iso' => trim(strtolower($iso)),
                            'country' => $qry['country'],
                            'operator_name' => $qry['operator_name'],
                            'trt_id' => $qry['trt_id'],
                            'trl_id' => $qry['trl_id'],
                            'active' => true,
                            'time' => new MongoDate()
                        );
                        $db->gloprefixes->insert($rec);
                   } else {
                       echo "NOT FOUND : ".$iso." ".$oper[1].PHP_EOL;
                   }
               } else {
                   continue;
               }
                echo "Processing Line : ".$iit.PHP_EOL;
            }
            fclose($handle);
        }