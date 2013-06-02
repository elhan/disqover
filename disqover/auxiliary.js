exports.calculateCalls = function(limit) {
  var calls = 0;
  while(limit-100 > 100){
    calls++;
    limit -= 100;
  }
  return calls++;
};