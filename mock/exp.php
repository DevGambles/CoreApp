<?php

function get_ub4_little($buf, $pos) {
    return ($buf[$pos + 2] << 16) + ($buf[$pos + 1] << 8) + $buf[$pos] + ($buf[$pos + 3] << 24);
}

$alphabet = array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
print_r(get_ub4_little($alphabet, 8));