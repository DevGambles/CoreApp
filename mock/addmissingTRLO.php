<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
                   $db = $conn->selectDB("padb");
        $q = $argv[1];
        $trl = $db->triangloprices->find(array('country' => $q));
        foreach ($trl as $l) {
            $chelp = $db->countryhelpers->findOne(array('country' => $q));
            $map = $db->provmappings->findOne(array('trl_id' => $l['operator_id']));
               $o = array();
                                        $o['apid'] = 'TRLO';
                                        $o['iso'] = strtoupper($chelp['iso']);
                                        $o['acloperId'] = $l['operator_id'];
                            $o['sku'] = "TRLO-".$l['operator_id']."-".$l['min_denomination'];
                            $o['name'] = $map['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = (float)$l['step'];
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $q;
                            $db->baseprods->insert($o);
                            print_r($o);
        }