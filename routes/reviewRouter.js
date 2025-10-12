const Router = require("express");
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.post("/", authMiddleware, reviewController.createReview);
router.get("/all-by-product", reviewController.getProductReviews);
router.get("/", checkRole("ADMIN"), reviewController.getAll);
router.patch("/:id", checkRole("ADMIN"), reviewController.updateReview);
router.delete("/:id", checkRole("ADMIN"), reviewController.deleteReview);

module.exports = router;
