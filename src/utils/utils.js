const { throwError } = require("../helpers/errorUtil");
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

exports.passwordValidation = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  return passwordRegex.test(password);
};

exports.validateRequestFields = (payload, fields) => {
  for (const field of fields) {
    if (!payload[field]) {
      return throwError(`${field} is required.`);
    }
  }
  return;
};

exports.forgotPasswordEmailTemplate = (link) => {
  const html = `
  <html>
    <head>
      <style>
        /* Styles for the email template */
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4caf50;
          color: white;
          text-align: center;
          padding: 10px;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 20px;
        }
        .button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Password</h1>
        </div>
        <div class="content">
          <p>We received a request to verify your email. Click the button below to reset it:</p>
          <a class="button" href="${link}">Reset Password</a>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br>Your Company Name</p>
        </div>
      </div>
    </body>
  </html>`;
  return html;
};

exports.invitationEmail = (link, name) => {
  return `<html>
  <head>
    <style>
      /* Styles for the email template */
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #4caf50;
        color: white;
        text-align: center;
        padding: 10px;
        border-radius: 10px 10px 0 0;
      }
      .content {
        padding: 20px;
      }
      .button {
        background-color: #4caf50;
        color: white;
        border: none;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Invitation to the SyncUpp</h1>
      </div>
      <div class="content">
      <p>hi, ${name}.</p>
        <p>Click the button below to join SyncUpp:</p>
        <a class="button" href="${link}">Join SyncUpp</a>
        <p>Best regards,<br>SyncUpp</p>
      </div>
    </div>
  </body>
</html>`;
};

exports.agrementEmail = (data) => {
  return `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agreement Information</title>
</head>
<body>
  <h2>Agreement Information</h2>
  <table border="1" cellpadding="5">
    <tr>
      <td><strong>Title:</strong></td>
      <td>${data.title}</td>
    </tr>
    <tr>
      <td><strong>Receiver:</strong></td>
      <td>${data.receiver}</td>
    </tr>
    <tr>
      <td><strong>Due Date:</strong></td>
      <td>${data.due_date}</td>
    </tr>
    <tr>
      <td><strong>Status:</strong></td>
      <td>${data.status}</td>
    </tr>
    <tr>
      <td><strong>Agreement Content:</strong></td>
      <td>${data.agreement_content}</td>
    </tr>
  </table>
  <p>Created At: ${data.createdAt}</p>
  <p>Updated At: ${data.updatedAt}</p>
</body>
</html>`;
};
exports.paginationObject = (paginationObject) => {
  const page = paginationObject.page || 1;
  const result_per_page = paginationObject.items_per_page || 10;
  const skip = result_per_page * (page - 1);
  const sort_order = paginationObject.sort_order === "asc" ? 1 : -1;
  const sortField =
    paginationObject.sort_field && paginationObject.sort_field !== ""
      ? paginationObject.sort_field
      : "createdAt";
  const sort = {};
  sort[sortField] = sort_order;

  return { page, skip, result_per_page, sort };
};

exports.getKeywordType = (keyword) => {
  if (!isNaN(keyword)) {
    return "number";
  } else if (Date.parse(keyword)) {
    return "date";
  } else {
    return "string";
  }
};
