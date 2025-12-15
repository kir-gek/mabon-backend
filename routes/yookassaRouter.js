const Router = require("express");
const yookassaController = require("../controllers/yookassaController");
// const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post("/create-payment", yookassaController.createPaymentTest);
router.get("/create-payment", yookassaController.testGet);
router.post("/webhook", yookassaController.webhookHandler);


module.exports = router;
