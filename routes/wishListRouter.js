const Router = require("express");
const wishListController = require("../controllers/wishListController");
const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post("/", authMiddleware, wishListController.addToWishList);
router.get("/:user_id", authMiddleware, wishListController.getUserWishList);
router.delete("/:id", authMiddleware, wishListController.removeFromWishList);

module.exports = router;
