const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRoleMiddleware");

router.get("/", userController.getUsers);  
router.get("/:id", authMiddleware, userController.getCurrentUser);
router.put("/:id", authMiddleware, userController.updateUser);
router.patch("/:id", authMiddleware, userController.updateUserImg);
router.post("/auth/registration", userController.registration);
router.post("/auth/login", userController.login);
router.get("/auth", authMiddleware, userController.check);
router.delete("/:id", checkRole("ADMIN"), userController.deleteUser);


module.exports = router;
