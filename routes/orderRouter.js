const Router = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.post("/", authMiddleware, orderController.createOrder);
router.get("/all-by-admin", checkRole("ADMIN"), orderController.getAllAdmin);
router.get("/all-by-user/:user_id", authMiddleware, orderController.getAll);
router.get("/:id", authMiddleware, orderController.getOne);
router.put("/:id", authMiddleware, orderController.update);
router.delete("/:id", checkRole("ADMIN"), orderController.delete);

module.exports = router;
