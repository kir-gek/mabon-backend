const Router = require("express");
const router = new Router();;
const userRouter = require("./userRouter");
const authorRouter = require("./authorRouter");

router.use("/users", userRouter);
router.use("/author", authorRouter);


module.exports = router;
