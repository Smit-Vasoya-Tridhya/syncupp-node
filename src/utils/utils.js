const engMessage = require("../messages/english.json");

exports.returnMessage = (module, key, language = "en") => {
  return engMessage[module][key];
};

exports.validateEmail = (email) => {
  // email validator from https://github.com/manishsaraan/email-validator/blob/master/index.js
  const regex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;
  const email_parts = email.split("@");

  if (email_parts.length !== 2) return false;

  const account = email_parts[0];
  const address = email_parts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  const domainParts = address.split(".");

  if (
    domainParts.some((part) => {
      return part.length > 63;
    })
  )
    return false;

  return regex.test(email);
};
