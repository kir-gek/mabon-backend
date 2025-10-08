const Router = require("express");
const router = new Router();
const authorController = require("../controllers/authorController");
const checkRole = require("../middleware/checkRoleMiddleware");

router.post("/", checkRole("ADMIN"), authorController.create);
router.post("/addImg/:id", checkRole("ADMIN"), authorController.addImg);
router.get("/", authorController.getAll);
router.get("/:id", authorController.getById);
router.put("/:id",checkRole("ADMIN"), authorController.update);
router.delete("/:id", checkRole("ADMIN"), authorController.deleteUser);

module.exports = router;
