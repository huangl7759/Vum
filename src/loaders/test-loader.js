// const utils = require("loader-utils");

module.exports = function(source) {
  //   const options = utils.getOptions(this);

  console.log(source, typeof source);
  // Apply some transformations to the source...

  return source;
};
