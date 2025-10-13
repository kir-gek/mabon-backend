const Router = require("express");
const router = new Router();;
const userRouter = require("./userRouter");
const authorRouter = require("./authorRouter");
const artTypeRouter = require("./artTypeRouter") 
const productRouter = require("./productRouter");
const orderRouter = require("./orderRouter");
const cartRouter = require("./cartRouter");

router.use("/users", userRouter);
router.use("/author", authorRouter);
router.use("/art-type", artTypeRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);
router.use("/cart", cartRouter);

module.exports = router;
