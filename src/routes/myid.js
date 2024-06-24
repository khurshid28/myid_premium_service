const { Router } = require("express");
const myIdController = require("../controllers/myid.js");
let myIdMiddleware = require("../middlewares/check-myid.js");
const router = Router();

router.post("/me/",myIdMiddleware, myIdController.me);
router.get("/base64/:passport", myIdController.base64);

router.post("/data/", myIdController.postdata);


module.exports = router;
