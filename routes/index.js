const Router = require("express");
const router = new Router();;
const userRouter = require("./userRouter");
const authorRouter = require("./authorRouter");
const artTypeRouter = require("./artTypeRouter") 
const productRouter = require("./productRouter");
const cartRouter = require("./cartRouter");
const wishListRouter = require("./wishListRouter");
const orderRouter = require("./orderRouter");
const reviewRouter = require("./reviewRouter")
const yookassaRouter = require("./yookassaRouter")

router.use("/users", userRouter);
router.use("/author", authorRouter);
router.use("/art-type", artTypeRouter);
router.use("/product", productRouter);
router.use("/cart", cartRouter);
router.use("/wish-list", wishListRouter);
router.use("/order", orderRouter);
router.use("/review", reviewRouter);
router.use("/yookassa", yookassaRouter);

module.exports = router;
