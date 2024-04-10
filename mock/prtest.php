<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                   $c = "Malaysia";
                   $a = $db->transfertoprices->find(array('country' => $c));
                   foreach ($a as $z => $l) {
                       $oper = str_replace($c, '', $l['operator_name']);
                       echo "OPER IS : ".$oper.PHP_EOL;
                       $mr = new MongoRegex("/".trim($oper)."/i");
                       print_r($mr);
                       $tr = $db->triangloprices->find(array('country' => $c, 'operator_name' => $mr))->count();
                       echo "COUNT IS : ".$tr.PHP_EOL;
                       echo $l['operator_name'].PHP_EOL;
                       if ($tr > 0) {
                           //check Tranglo
                           if ($tr == 1) {
                               //Open Range
                               $tr2 = $db->triangloprices->findOne(array('country' => $c, 'operator_name' => $mr));
                               //check denomination
                               if ( ((int)$l['denomination'] > (int)$tr2['min_denomination']) && ( (int)$l['denomination'] < (int)$tr2['max_denomination'] ) ) {
                                   //in range
                                   $tprice = (int)$l['denomination'] * (float)$tr2['rate'];
                                   if ((float)$l['unit_cost'] > (float)$tprice) {
                                        $o = array();
                            $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $tr2['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = $tprice;
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                                   } else {
                                       //trto it is
                                         $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = $l['unit_cost'];
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
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
                            $o['price'] = $l['unit_cost'];
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                               }
                           } else {
                               //Fixed

                               $tr2 = $db->triangloprices->findOne(array('country' => $c, 'operator_name' => $mr, 'min_denomination' => $l['denomination']));
                               if ($tr2 !== null) {
                                   //we have match
                                   if ((float)$l['unit_cost'] > (float)$tr2['unit_cost']) {
                                       //trlo
                                           $o = array();
                            $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $tr2['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = (float)$tr2['unit_cost'];
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
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
                            $o['price'] = $l['unit_cost'];
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
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
                            $o['price'] = $l['unit_cost'];
                            $o['step'] = '-';
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
                            $o['sku'] = "TRTO-".$l['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $l['operator_name'];
                            $o['operator_id'] = $l['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = $l['unit_cost'];
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                           // $db->products->insert($o);
                       }
                       //check pricings
                        if ($d['type'] == 'reseller') {
                           $prof = ((float)$d['profit_pct'] + 100) / 100;
                           $o['price'] = (float)$o['price'] * $prof;
                       } else if ($d['type'] == 'agent') {
                           $pa = $db->accounts->findOne(array('_id' => new MongoId($d['parent'])));
                           $p1 = ((float)$pa['profit_pct'] + 100) / 100;
                           $p2 = ((float)$d['profit_pct'] + 100) / 100;
                           $o['price'] = (float)$o['price'] * $p1 * $p2;
                       }
                       $db->transfertoprices->insert($o);
                       //add a trto line if needed

                   }
                    $o['sku'] = "TRLO-".$tr2['operator_id']."-".$l['denomination'];
                            $o['account'] = new MongoId($d['_id']);
                            $o['name'] = $tr2['operator_name'];
                            $o['operator_id'] = $tr2['operator_id'];
                            $o['min_denomination'] = $l['denomination'];
                            $o['max_denomination'] = $l['denomination'];
                            $o['topup_currency'] = $l['currency'];
                            $o['price'] = $tprice;
                            $o['step'] = '-';
                            $o['fx_rate'] = '-';
                            $o['currency'] = 'USD';
                            $o['active'] = true;
                            $o['country'] = $l['country'];
                             if ($d['type'] == 'reseller') {
                           $prof = ((float)$d['profit_pct'] + 100) / 100;
                           $o['price'] = (float)$o['price'] * $prof;
                       } else if ($d['type'] == 'agent') {
                           $pa = $db->accounts->findOne(array('_id' => new MongoId($d['parent'])));
                           $p1 = ((float)$pa['profit_pct'] + 100) / 100;
                           $p2 = ((float)$d['profit_pct'] + 100) / 100;
                           $o['price'] = (float)$o['price'] * $p1 * $p2;
                       }
                       $db->transfertoprices->insert($o);