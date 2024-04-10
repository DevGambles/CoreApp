<?php
//db stuff
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
			$a = $db->accounts->find();
			foreach ($a as $acc) {
			if (isset($acc['whitelabel_opts']['portal_url'])) {
				$nl = str_replace('com', 'org', $acc['whitelabel_opts']['portal_url']);
#				$db->accounts->update(array('_id' => $acc['_id']), array('$set' => array('whitelabel_opts.portal_url' => $nl)));
				echo "WL : ".$acc['whitelabel_opts']['portal_url'].PHP_EOL;
			}
			}
