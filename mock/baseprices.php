<?php
//db stuff
$cfg = parse_ini_file(__DIR__ . "/../.env");
$conn  = new MongoClient( "mongodb://".$cfg['DBHOST'].":27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB($cfg['DBNAME']);
                 //  $db->baseprods->remove();
                //	$db->baseprods->update(array(), array('$set' => array('active' => false))); 
		  $q2 = $db->operators->distinct("country");
               foreach ($q2 as $line) {
			$db->baseprods->remove(array('country' => $line));
			if ($line == 'United Kingdom') {
                            //write out UKBL values
                            $qq = $db->ukblprices->find();
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array('trt_id' => $l['operator_id']));
                                $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => 'GBP'));
                                $price = round((float)$l['unit_cost'] / (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'UKBL';
                                            $o['iso'] = strtoupper('UK');
                                        $o['acloperId'] = $map['trl_id'];
                            $o['sku'] = "UKBL-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = (float)$l['unit_cost'];
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'GBP';
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }
				continue;
                        }
                        if ($line == 'Kenya') {
                            //write out TRTL values
                            $qq = $db->trtlprices->find(array('currency' => 'KES'));
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true));
                                $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => 'KES'));
                                $price = round((float)$l['min_denomination'] / (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'TRTL';
                                            $o['iso'] = strtoupper('KE');
                                        $o['acloperId'] = $map['trl_id'];
                                        $o['skuid'] = $l['skuid'];
                                        if ($l['min_denomination'] == $l['max_denomination']) {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-".$l['min_denomination'];
                                            $o['price'] = $price;
                                            $o['step'] = 0;
                                            $o['fx_rate'] = '-';
                                        } else {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-OR";
                                            $o['price'] = '-';
                                            $o['step'] = 1;
                                            $o['fx_rate'] = 1;
                                        }
                            
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];
                           
                            $o['currency'] = $l['currency'];
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }
//				continue;
                        }
			if ($line == 'South Africa') {
                            //write out TRTL values
                            $qq = $db->trtlprices->find(array('currency' => 'ZAR'));
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true));
                                $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => 'ZAR'));
                                $price = round((float)$l['min_denomination'] / (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'TRTL';
                                            $o['iso'] = strtoupper('ZA');
                                        $o['acloperId'] = $map['trl_id'];
                                        $o['skuid'] = $l['skuid'];
                                        if ($l['min_denomination'] == $l['max_denomination']) {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-".$l['min_denomination'];
                                            $o['price'] = $price;
                                            $o['step'] = 0;
                                            $o['fx_rate'] = '-';
                                        } else {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-OR";
                                            $o['price'] = '-';
                                            $o['step'] = 1;
                                            $o['fx_rate'] = 1;
                                        }

                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];

                            $o['currency'] = $l['currency'];
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }
//                              continue;
                        }
			 if ($line == 'Benin') {
                            //write out TRTL values
                            $qq = $db->trtlprices->find(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true));
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array('trt_id' => $l['operator_id']));
                                $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => 'XOF'));
                                $price = round((float)$l['min_denomination'] / (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'TRTL';
                                            $o['iso'] = strtoupper('BJ');
                                        $o['acloperId'] = $map['trl_id'];
                                        $o['skuid'] = $l['skuid'];
                                        if ($l['min_denomination'] == $l['max_denomination']) {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-".$l['min_denomination'];
                                           $o['price'] = (float)$l['min_denomination'];
                                            $o['step'] = 0;
                                            $o['fx_rate'] = '-';
                                        } else {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-OR";
                                            $o['price'] = '-';
                                            $o['step'] = 1;
                                            $o['fx_rate'] = 1;
                                        }

                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];

                            $o['currency'] = $l['currency'];
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }
//                              continue;
                        }
		   if ($line == 'Tanzania') {
                            //write out TRTL values
                            $qq = $db->trtlprices->find(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true));
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array('trt_id' => $l['operator_id']));
                                $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => 'TZS'));
                                $price = round((float)$l['min_denomination'] / (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'TRTL';
                                            $o['iso'] = strtoupper('TZ');
                                        $o['acloperId'] = $map['trl_id'];
                                        $o['skuid'] = $l['skuid'];
                                        if ($l['min_denomination'] == $l['max_denomination']) {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-".$l['min_denomination'];
                                            $o['price'] = (float)$l['min_denomination'];
                                            $o['step'] = 0;
                                            $o['fx_rate'] = '-';
                                        } else {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-OR";
                                            $o['price'] = '-';
                                            $o['step'] = 1;
                                            $o['fx_rate'] = 1;
                                        }

                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];

                            $o['currency'] = $l['currency'];
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }
//                              continue;
                        }
		   if ($line == 'Uganda') {
                            //write out TRTL values
	echo "Uganda".PHP_EOL;
                            $qq = $db->trtlprices->find(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true));
	echo "Found : ".count($qq).PHP_EOL;
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array('trt_id' => $l['operator_id']));
                                $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => 'UGX'));
                                $price = round((float)$l['min_denomination'] / (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'TRTL';
                                            $o['iso'] = strtoupper('UG');
                                        $o['acloperId'] = $map['trl_id'];
                                        $o['skuid'] = $l['skuid'];
                                        if ($l['min_denomination'] == $l['max_denomination']) {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-".$l['min_denomination'];
                                            $o['price'] = $price;
                                            $o['step'] = 0;
                                            $o['fx_rate'] = '-';
                                        } else {
                                            $o['sku'] = "TRTL-".$l['operator_id']."-OR";
                                            $o['price'] = '-';
                                            $o['step'] = 1;
                                            $o['fx_rate'] = 1;
                                        }

                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];

                            $o['currency'] = $l['currency'];
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }
//                              continue;
                        }

                    if ( ($line == 'Bangladesh') || ($line == 'Ghana') || ($line == 'Nigeria')) {
                        echo "Local Rates @ : ".$line.PHP_EOL;
                        switch ($line) {
                            case "Bangladesh":
                                $currency = "BDT";
                                $apid = "SSLW";
                                break;
                            case "Ghana":
                                $currency = "GHS";
                                $apid = "ETRX";
                                break;
                            case "Nigeria":
                                $currency = "NGN";
                                $apid = "MFIN";
                                break;
                            default:
                                continue;
                        }
                        $rate = $db->rates->findOne(array('source' => 'USD', 'destination' => $currency));
                        $op = $db->prefixes->distinct('operatorId', array('country' => $line));
                        foreach ($op as $opa) {
                            $o = array();
                            $o['apid'] = $apid;
                            $opr = $db->prefixes->findOne(array('country' => $line, 'operatorId' => $opa));
                            $o['iso'] = strtoupper($opr['iso']);
                            $o['acloperId'] = $opr['operatorId'];
                         $o['sku'] = $apid."-".$opr['operatorId']."-OR";
                            $o['name'] = $opr['operatorName'];
                            $o['operator_id'] = $opr['operatorId'];
                            $o['min_denomination'] = $opr['openRangeMin'];
                            $o['max_denomination'] = $opr['openRangeMax'];
                            $o['topup_currency'] = $currency;
                            $o['step'] = 1;
                           $o['country'] = $line;
                           $o['fx_rate'] = $rate['rate'];
                           $o['price'] = "-";
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $db->baseprods->insert($o);
                        }
                        
                        
                    } else {

                        echo "Global Rates @ : ".$line.PHP_EOL;
                        $exceptions = ['Niger', 'Netherlands', 'Congo', 'Dominica'];
                        if (in_array($line, $exceptions)) {
                            $trt = $db->transfertoprices->find(array("country" => $line, "active" => true));
                    $trl = $db->transfertoprices->find(array("country" => $line, "active" => true))->count();
                     $trl2 = $db->triangloprices->find(array("country" => $line, "active" => true))->count();
                        } else {
                              $trt = $db->transfertoprices->find(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true));
                    $trl = $db->transfertoprices->find(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true))->count();
                     $trl2 = $db->triangloprices->find(array("country" => new MongoRegex('/'.$line.'/i'), "active" => true))->count();
                        }
                  
		                $convert = false;
                   // echo "TRT Count :".$trl.PHP_EOL;
                   // echo "TRL Count :".$trl2.PHP_EOL;
                    $x = array();
                   foreach ($trt as $z => $l) {
                       //echo "COMPARING : ".$l['operator_id']." DENOMINATION : ".$l['denomination'].PHP_EOL;
                       $map = $db->provmappings->findOne(array('trt_id' => $l['operator_id']));
                       if ($map !== null) {
                            $tr = $db->triangloprices->find(array('operator_id' => $map['trl_id']))->count();
                                if ($tr > 0) {
                           //check Tranglo
                           if ($tr == 1) {
                               //Open Range
                               $tr2 = $db->triangloprices->findOne(array('operator_id' => $map['trl_id']));
                               //check denomination
                         //      echo "STEP IS : ".(float)$tr2['step'].PHP_EOL;
                               if ( ($tr2['step'] == '-') || ($tr2['step'] == 0) || ( (float)$tr2['step'] == 0.1  )  || ( (float)$tr2['step'] == 0.01  )  ) {
                                   $tr2['step'] = 1;
                               }
                               if ( ((int)$l['denomination'] >= (int)$tr2['min_denomination']) && ( (int)$l['denomination'] <= (int)$tr2['max_denomination'] ) && (((int)$l['denomination'] % (float)$tr2['step']) == 0  ) ) {
                                   //in range
                                $tprice = (int)$l['denomination'] / (float)$tr2['rate'];
				echo "Tprice : ".round($tprice,2).PHP_EOL;
				if (round($tprice,2) == 0) {
					echo ">>>>>>>>>>>>>>>>>>>ALEEERT<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<".PHP_EOL;
					print_r($l, true).PHP_EOL;
					echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<".PHP_EOL;
				} 
				//if ((float)$l['unit_cost'] > (float)$tprice) {
                   		if (false) {
                                        $o = array();
                                        $o['apid'] = 'TRLO';
                                        $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                            $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($tprice, 2);
                            $o['step'] = (float)$tr2['step'];
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   } else {
                                       //trto it is
                                       $o = array();
                                       $o['apid'] = 'TRTO';
                                        $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                                         $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   }
                               } else {
                                   //fall back to TRTO
                                   $o = array();
                                   $o['apid'] = 'TRTO';
                                    $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                               }
                           } else {
                               //Fixed

                               $tr2 = $db->triangloprices->findOne(array('operator_id' => $map['trl_id'], 'min_denomination' => $l['denomination']));
                               //if ($tr2 !== null) {
					if (false) {
                                   //we have match
                                   if ((float)$l['unit_cost'] > (float)$tr2['unit_cost']) {
                                       //trlo
                                           $o = array();
                                           $o['apid'] = 'TRLO';
                                            $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                            $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round((float)$tr2['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   } else {
                                       //trto
                                        //fallback to TRTO
                                    $o = array();
                                    $o['apid'] = 'TRTO';
                                     $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   }
                               } else {
                                   //fallback to TRTO
                                    $o = array();
                                    $o['apid'] = 'TRTO';
                                     $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                               }
                           }
                       } else {
                           //write line as TRTO
                           //PRICE HAS TO BE SET!!!!!
                           
                            $o = array();
                            $o['apid'] = 'TRTO';
                             $o['iso'] = strtoupper($map['iso']);
                                        $o['acloperId'] = strtoupper($map['trl_id']);
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                           // $db->products->insert($o);
                       }
                       } else {
                           //null only trto
                           $chelp = $db->countryhelpers->findOne(array('country' => new MongoRegex('/'.$line.'/i')));
                           
                            $o = array();
                            $o['apid'] = 'TRTO';
                            if ($chelp !== null) {
                                $o['iso'] = strtoupper($chelp['iso']);
                                $o['acloperId'] = 'ALL';
                            } else {
                                $o['iso'] = null;
                                $o['acloperId'] = null;
                            }
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = 0;
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                       }
                    //   echo "WRITING : ".$o['sku']." DENOMIN (MIN) : ".$o['min_denomination'].PHP_EOL;
                       $db->baseprods->insert($o);
                       //add a trto line if needed
                 
                   }
                        $qq = $db->triangloprices->find(array('country' => $line, 'unit_cost' => '-'));
                        $cli = $db->countryhelpers->findOne(array('country' => new MongoRegex('/'.$line.'/i')));
                        /*
			foreach ($qq as $mm => $vv) {
                            unset($o);
                      echo "ADDING EXTRA TRLO FOR ".$vv['operator_id'].PHP_EOL; 
                       $o = array();
                       $o['apid'] = 'TRLO';
                       $o['iso'] = strtoupper($cli['iso']);
                       $o['acloperId'] = strtoupper($vv['operator_id']);
                        $o['sku'] = "TRLO-".$vv['operator_id']."-OR";
                            $o['name'] = $vv['operator_name'];
                            $o['operator_id'] = $vv['operator_id'];
                            $o['min_denomination'] = $vv['min_denomination'];
                            $o['max_denomination'] = $vv['max_denomination'];
                            $o['topup_currency'] = $vv['currency'];
                            $o['price'] = '-';
                            $o['step'] = (float)$vv['step'];
                            $o['fx_rate'] = round($vv['rate'], 2);
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $vv['country'];
                         
                       $db->baseprods->insert($o);
                        }
				*/
			/*
                         if ($line == 'Burkina Faso') {
                            $qq = $db->triangloprices->find(array('country' => $line));
				foreach($qq as $l) {
                            unset($o);
                            $o = array();
                                           $o['apid'] = 'TRLO';
                                            $o['iso'] = strtoupper('BF');
                                        $o['acloperId'] = strtoupper('BF_OR');
                            $o['sku'] = "TRLO-".$l['operator_id']."-".$l['min_denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['min_denomination'];
                            $o['max_denomination'] = $l['max_denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round((float)$l['unit_cost'], 2);
                            $o['step'] = (float)$l['step'];
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
			}
				continue;
                        }
*/
/*                        
if ($line == 'United Kingdom') {
                            //write out UKBL values
                            $qq = $db->ukblprices->find();
                            foreach ($qq as $l) {
                                $map = $db->provmappings->findOne(array('trt_id' => $l['operator_id']));
                                $rate = $db->rates->findOne(array('source' => 'GBP', 'destination' => 'USD'));
                                $price = round((float)$l['unit_cost'] * (float)$rate['rate'], 2);
                                unset($o);
                            $o = array();
                                           $o['apid'] = 'UKBL';
                                            $o['iso'] = strtoupper('UK');
                                        $o['acloperId'] = $map['trl_id'];
                            $o['sku'] = "UKBL-".$l['operator_id']."-".$l['denomination'];
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = $price;
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $line;
                            $db->baseprods->insert($o);
                            }

                        }
                        */
                   
                }
                }
                
           //$db->baseprods->remove(array('active' => false));
