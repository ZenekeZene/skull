const utils = {
  getRandomInterval: (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  setIntervalX: (
    intervalID,
    callback,
    delay,
    repetitions,
    completedCallback
  ) => {
    let x = 0;
    clearInterval(intervalID);
    intervalID = setInterval(function() {
      console.log("seguimos");
      callback();

      if (++x === repetitions) {
        clearInterval(intervalID);
        completedCallback();
      }
    }, delay);
    return intervalID;
  }
};

module.exports = utils;
