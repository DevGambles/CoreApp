Array.prototype.contains = function ( needle ) {
   for (i in this) {
      if (this[i] == needle) return true;
   }
   return false;
}