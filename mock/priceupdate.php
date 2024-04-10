<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $q = $db->accounts->find();
                   foreach ($q as $f => $d) {
                       echo "PROCESSING :".$d['account_name']." Account Type : ".$d['type'].PHP_EOL;
                       $db->products->remove(array('account' => new MongoId($d['_id'])));
                       if ($d['type'] == 'reseller') {
                           $pa = $db->accounts->findOne(array('_id' => new MongoId($d['parent'])));
                           $re = array('profit_pct' => $pa['profit_pct']);
                           $wh = ((float)$d['profit_pct'] + 100) / 100;

                       } else if ($d['type'] == 'agent') {
                           $pa = $db->accounts->findOne(array('_id' => new MongoId($d['parent'])));
                           if ($pa['type'] == 'reseller') {
                               $wh = $db->accounts->findOne(array('_id' => new MongoId($pa['parent'])));
                               $re = $pa;
                           } else if ($pa['type'] == 'wholesaler') {
                               $wh = $pa;
                               $re = array();
                               $re['profit_pct'] = 0;
                           } else {
                               continue;
                           }
                         
                       } else if ($d['type'] == 'wholesaler') {
                           $wh = array('profit_pct' => 0);
                           $re = array('profit_pct' => 0);
                       } else {
                           continue;
                       }

                
$q2 = $db->operators->distinct("country");
               foreach ($q2 as $line) {
                    if ( ($line == 'Bangladesh') || ($line == 'Ghana') || ($line == 'Nigeria')) {
                        echo "Local Rates @ : ".$line.PHP_EOL;
                        switch ($line) {
                            case "Bangladesh":
                                $currency = "BDT";
                                $apid = "SSLW-ALL-OR";
                                break;
                            case "Ghana":
                                $currency = "GHS";
                                $apid = "ETRX-ALL-OR";
                                break;
                            case "Nigeria":
                                $currency = "NGN";
                                $apid = "MFIN-ALL-OR";
                                break;
                            default:
                                continue;
                        }
                        $rate = $db->rates->findOne(array('source' => $d['currency'], 'destination' => $currency));
                        $opr = $db->prefixes->findOne(array('country' => $line));
                        $finrate = (float)$rate['rate'] - ( ((float)$rate['rate'] * (float)$d['profit_pct']) / 100) - ( ((float)$rate['rate'] * (float)$wh['profit_pct']) / 100) - ( ((float)$rate['rate'] * (float)$re['profit_pct']) / 100);
                        $o = array();
                         $o['sku'] = $apid;
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = "ALL";
                            $o['operator_id'] = "ALL";
                            $o['min_denomination'] = $opr['openRangeMin'];
                            $o['max_denomination'] = $opr['openRangeMax'];
                            $o['topup_currency'] = $currency;
                            $o['step'] = "1";
                           $o['country'] = $line;
                           $o['fx_rate'] = round($finrate, 2);
                           $o['price'] = "-";
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $db->products->insert($o);
                    } else {
                        echo "Global Rates @ : ".$line.PHP_EOL;
                    $trt = $db->transfertoprices->find(array("country" => $line, "active" => true));
                    $trl = $db->transfertoprices->find(array("country" => $line, "active" => true))->count();
                     $trl2 = $db->triangloprices->find(array("country" => $line, "active" => true))->count();
			if ($d['currency'] !== "USD") {
				echo "CONVERSION FROM ".$d['currency']." TO USD WILL OCCUR!".PHP_EOL;
				$convert=true;
				$fx = $db->rates->findOne(array('source' => $d['currency'], 'destination' => 'USD'));
				$fxr = $fx['rate'];
			} else {
				$convert=false;
			}
                    echo "TRT Count :".$trl.PHP_EOL;
                    echo "TRL Count :".$trl2.PHP_EOL;
                    $x = array();
                   foreach ($trt as $z => $l) {
                       $oper = str_replace($line, '', $l['operator_name']);
                       $mr = new MongoRegex("/".trim($oper)."/i");
                       $tr = $db->triangloprices->find(array('country' => $line, 'operator_name' => $mr))->count();
                       if ($tr > 0) {
                           //check Tranglo
                           if ($tr == 1) {
                               //Open Range
                               $tr2 = $db->triangloprices->findOne(array('country' => $line, 'operator_name' => $mr));
                               //check denomination
                               if ( ((int)$l['denomination'] > (int)$tr2['min_denomination']) && ( (int)$l['denomination'] < (int)$tr2['max_denomination'] ) ) {
                                   //in range
                                $tprice = (int)$l['denomination'] / (float)$tr2['rate'];   
				if ((float)$l['unit_cost'] > (float)$tprice) {
                                        $o = array();
                            $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($tprice, 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   } else {
                                       //trto it is
                                       $o = array();
                                         $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   }
                               } else {
                                   //fall back to TRTO
                                   $o = array();
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                               }
                           } else {
                               //Fixed

                               $tr2 = $db->triangloprices->findOne(array('country' => $line, 'operator_name' => $mr, 'min_denomination' => $l['denomination']));
                               if ($tr2 !== null) {
                                   //we have match
                                   if ((float)$l['unit_cost'] > (float)$tr2['unit_cost']) {
                                       //trlo
                                           $o = array();
                            $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round((float)$tr2['unit_cost'], 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   } else {
                                       //trto
                                        //fallback to TRTO
                                    $o = array();
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   }
                               } else {
                                   //fallback to TRTO
                                    $o = array();
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                               }
                           }
                       } else {
                           //write line as TRTO
                           //PRICE HAS TO BE SET!!!!!
                           
                            $o = array();
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = round($l['unit_cost'], 2);
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                           // $db->products->insert($o);
                       }
                       //check pricings
                    $p1 = ((float)$wh['profit_pct'] + 100) / 100;
                           $p2 = ((float)$re['profit_pct'] + 100) / 100;
                           $p3 = ((float)$d['profit_pct'] + 100) / 100;
                           $o['price'] = (float)$o['price'] * $p1 * $p2 * $p3;
				$o['price'] = round($o['price'], 2);
			if ($convert) {
			$o['price'] = round((float)$o['price'] / (float)$fxr, 2);
			}
                       $db->products->insert($o);
                       //add a trto line if needed
                 
                   }
                        $qq = $db->triangloprices->find(array('country' => $line, 'unit_cost' => '-'));
                        foreach ($qq as $mm => $vv) {
                            unset($o);
                      echo "ADDING EXTRA TRLO FOR ".$vv['operator_id'].PHP_EOL; 
                       $o = array();
                        $o['sku'] = "TRLO-".$vv['operator_id']."-OR";
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $vv['operator_name'];
                            $o['operator_id'] = $vv['operator_id'];
                            $o['min_denomination'] = $vv['min_denomination'];
                            $o['max_denomination'] = $vv['max_denomination'];
                            $o['topup_currency'] = $vv['currency'];
                            $o['price'] = '-';
                            $o['step'] = '-';
                            $o['fx_rate'] = round($vv['rate'], 2);
                            $o['currency'] = $d['currency'];
                            $o['active'] = true;
                            $o['country'] = $vv['country'];
                           $pa = $db->accounts->findOne(array('_id' => new MongoId($d['parent'])));
                     $p1 = ((float)$wh['profit_pct'] + 100) / 100;
                           $p2 = ((float)$re['profit_pct'] + 100) / 100;
                           $p3 = ((float)$d['profit_pct'] + 100) / 100;
                           $o['fx_rate'] = (float)$vv['rate'] - (((float)$vv['rate'] * (float)$d['profit_pct']) / 100) - (((float)$vv['rate'] * (float)$re['profit_pct']) / 100) - (((float)$vv['rate'] * (float)$re['profit_pct']) / 100);
                       
			$o['fx_rate'] = round($o['fx_rate'], 2);
			if ($convert) {
                        $o['fx_rate'] = round((float)$o['fx_rate'] * (float)$fxr, 2);
                        }
                       $db->products->insert($o);
                        }
                        
                   
                }
                }

                   }
                
           
