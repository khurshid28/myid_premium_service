const {
  InternalServerError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} = require("../utils/errors.js");
let axios = require("axios");
let path = require("path");
let fs = require("fs");

let db = require("../config/db");
class Myid {
  async me(req, res, next) {
    try {
      let { id, base64, passport, birthDate } = req.body;

      if (base64) {
        var filePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "myid",
          `${req.body.passport}.png`
        );
        console.log(filePath);
        console.log(process.env.FACE_URL);
        base64_decode(base64, filePath);
        let url1 = process.env.FACE_URL + "oauth2/access-token";
        let url2 =
          process.env.FACE_URL +
          "authentication/simple-inplace-authentication-request-task";

        const response1 = await axios
          .post(
            url1,
            {
              grant_type: "password",
              client_id: process.env.FACE_CLIENT_ID_2,
              username: process.env.FACE_USERNAME,
              password: process.env.FACE_PASSWORD,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });

        // console.log(response1);
        let access_token = response1.data["access_token"];
        let response2 = await axios
          .post(
            url2,
            {
              pass_data: req.body.passport,
              birth_date: req.body.birthDate,
              threshold: 0.5,
              photo_from_camera: {
                front: base64,
              },
              agreed_on_terms: true,
              client_id: process.env.FACE_CLIENT_ID_2,
              // liveness: true
            },

            {
              headers: {
                Authorization: "Bearer " + access_token,
              },
            }
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });

        let url3 = `${process.env.FACE_URL}authentication/simple-inplace-authentication-request-status?job_id=${response2.data["job_id"]}`;
        console.log(JSON.stringify(url3));
        let response3 = await axios
          .post(
            url3,
            "",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                // 'Content-Type': 'application/json',
                "Content-Type": "text/plain",

                // "responseType": 'blob',
                // "Accept":"*/*",
                responseType: "json",
                responseEncoding: "utf8",
              },
            },
            {}
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });
        while (response3.status != 200) {
          response3 = await axios
            .post(
              url3,
              "",
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  // 'Content-Type': 'application/json',
                  "Content-Type": "text/plain",

                  // "responseType": 'blob',
                  // "Accept":"*/*",
                  responseType: "json",
                  responseEncoding: "utf8",
                },
              },
              {}
            )
            .then((r) => r)
            .catch((err) => {
              return err.response;
            });
        }
        console.log(response3.data);
        if (response3.data.profile != null && response3.data.result_code != 3) {
          let userMyIdData = await new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO MyId (response_id,pass_seriya,comparison_value,profile) VALUES ('${
                response3.data.response_id
              }', '${passport}','${
                response3.data.comparison_value
              }','${JSON.stringify(response3.data.profile).replaceAll(`\^`,"").replaceAll(`\\`,"")}')`,
              function (err, results, fields) {
                if (err) {
                  resolve(null);
                  // return null;
                }
                console.log("", results);
                if (results) {
                  resolve("success");
                } else {
                  resolve(null);
                  // return null;
                }
              }
            );
          });

          return res.status(response3.status).json(response3.data);
        } else {
          return next(
            new InternalServerError(500, response3.data.result_note ?? "error")
          );
        }
      }

      return next(new InternalServerError(500, "error"));
    } catch (error) {
      console.log(" catch >>> ");
      return next(new InternalServerError(500, error));
    }
  }

  async base64(req, res, next) {
    try {
      console.log(">>>", req.params);

      var filePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "myid",
        `${req.params.passport}.png`
      );
      if (fs.existsSync(filePath)) {
        var bitmap = fs.readFileSync(filePath);
        const encoded = Buffer(bitmap).toString("base64");
        return res.status(200).json({
          data: "data:image/jpeg;base64," + encoded,
        });
      } else {
        return next(new NotFoundError(404, "This client not found"));
        
        
      }
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
}

Date.daysBetween = function (date1, date2) {
  //Get 1 day in milliseconds
  var one_day = 1000 * 60 * 60 * 24;

  // Calculate the difference in milliseconds
  var difference = date2 - date1;

  // Convert back to days and return
  return Math.round(difference / one_day);
};

function base64_decode(base64str, filePath) {
  let base64Image = base64str.split(";base64,")[1];
  var bitmap = Buffer.from(base64Image.toString(), "base64");

  fs.writeFileSync(filePath, bitmap);
  console.log("******** File created from base64 encoded string ********");
}

module.exports = new Myid();
