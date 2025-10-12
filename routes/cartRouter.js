const Router = require("express");
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post("/", authMiddleware, cartController.addToCart);
router.get("/:user_id", authMiddleware, cartController.getUserCart);
router.patch("/:id", authMiddleware, cartController.updateCartItem);
router.delete("/:id", authMiddleware, cartController.removeFromCart);

module.exports = router;
