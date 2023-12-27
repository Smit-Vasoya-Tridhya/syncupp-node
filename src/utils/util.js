const engMessage = require("../messages/en.json");

exports.returnMessage = (msg, language = "en") => {
  return engMessage[msg];
};
