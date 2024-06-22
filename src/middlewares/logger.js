const path = require("path");
const fs = require("fs");

module.exports = (error, req, res, next) => {
  let text = `${req.url}___${req.method}___${Date.now()}___${error.name}`;
  fs.appendFileSync(
    path.join(process.cwd(), "error.log"),
    text +
      (text.includes("myid")
        ? `${error.message}`
        : `___${JSON.stringify(error)}`) +
      `\n`
  );

  return res.status(500).json({
    status: 500,
    name: "InternalServerError",
    message: error.message,
  });
};
