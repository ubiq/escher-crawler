var BigNumber = require('bignumber.js');

function baseBlockReward(height) {
  if ( height > 2508545 ) {
    return new BigNumber(1000000000000000000);
  } else if ( height > 2150181 ) {
    return new BigNumber(2000000000000000000);
  } else if ( height > 1791818 ) {
    return new BigNumber(3000000000000000000);
  } else if ( height > 1433454 ) {
    return new BigNumber(4000000000000000000);
  } else if ( height > 1075090 ) {
    return new BigNumber(5000000000000000000);
  } else if ( height > 716727 ) {
    return new BigNumber(6000000000000000000);
  } else if ( height > 358363 ) {
    return new BigNumber(7000000000000000000);
  } else if ( height > 0 ) {
    return new BigNumber(8000000000000000000);
  } else {
    // genesis
    return new BigNumber(0);
  }
};

module.exports = {
  // synchonous loop
  syncLoop: function(iterations, process, exit){
    var index = 0,
      done = false,
      shouldExit = false;
    var loop = {
      next:function(){
        if(done){
          if(shouldExit && exit){
            exit(); // Exit if we're done
          } else {
            return; // Stop the loop if we're done
          }
        } else {
          // If we're not finished
          if(index < iterations){
            index++; // Increment our index
            process(loop);
          } else {
            done = true; // Make sure we say we're done
            if(exit) exit(); // Call the callback on exit
          }
        }
      },
      iteration:function(){
        return index - 1; // Return the loop number we're on
      },
      break:function(end){
        done = true; // End the loop
        shouldExit = end; // Passing end as true means we still call the exit callback
      },
      redo:function(){
        process(loop);
      }
    };
    loop.next();
    return loop;
  },

  // returns total minted coins for a specific block
  calculateBlockReward(block) {
    var baseReward = baseBlockReward(block.number);
    var uncles = new BigNumber(baseReward.dividedBy(32).times(block.uncles.length));
    return baseReward.plus(uncles).toString();
  }
};
