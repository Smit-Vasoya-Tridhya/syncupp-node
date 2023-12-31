const express = require("express");
require("./config/connection");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const errorHandler = require("./helpers/error");
const cors = require("cors");
const rootRoutes = require("./routes/index");
const logger = require("./logger");
const { insertData } = require("./seeder/seeder");
const morgan = require("morgan");
const path = require("path");
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(rootRoutes);

// handling error from all of the route
app.use(errorHandler);

app.listen(port, async () => {
  //   await insertData();
  logger.info(`Server started at port:${port}`);
});

// const axios = require("axios");

// app.get("/", (req, res) => {
//   res.send(`
//     <html>
//       <body>
//         <a href="https://www.facebook.com/v6.0/dialog/oauth?client_id=1123503825483323&redirect_uri=${encodeURIComponent(
//           "http://localhost:3000/oauth-redirect"
//         )}">
//           Log In With Facebook
//         </a>
//       </body>
//     </html>
//   `);
// });

// app.get("/oauth-redirect", async (req, res) => {
//   try {
//     console.log(req.query, 47);
//     const authCode = req.query.code;

//     // Build up the URL for the API request. `client_id`, `client_secret`,
//     // `code`, **and** `redirect_uri` are all required. And `redirect_uri`
//     // must match the `redirect_uri` in the dialog URL from Route 1.
//     const accessTokenUrl =
//       "https://graph.facebook.com/v6.0/oauth/access_token?" +
//       `client_id=1123503825483323&` +
//       `client_secret=22878eb48b3eb5d0c5d696b1cf18fbe2&` +
//       `redirect_uri=${encodeURIComponent(
//         "http://localhost:3000/oauth-redirect"
//       )}&` +
//       `code=${encodeURIComponent(authCode)}`;

//     // Make an API request to exchange `authCode` for an access token
//     const accessToken = await axios
//       .get(accessTokenUrl)
//       .then((res) => res.data["access_token"]);
//     // Store the token in memory for now. Later we'll store it in the database.
//     console.log("Access token is", accessToken);
//     const data = await axios
//       .get(
//         `https://graph.facebook.com/me?access_token=${encodeURIComponent(
//           accessToken
//         )}&fields=id,name,email,first_name,last_name`
//       )
//       .then((res) => res.data);
//     res.json({ accessToken, data });
//   } catch (err) {
//     console.log("error", err.message);
//     return res.status(500).json({ message: err.message });
//   }
// });
// https://developers.facebook.com/docs/graph-api/reference/user/
