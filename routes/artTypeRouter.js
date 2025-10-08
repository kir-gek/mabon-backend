const Router = require("express");
const artTypeController = require("../controllers/artTypeController");
const checkRole = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.post("/",checkRole("ADMIN"), artTypeController.create);
router.get("/", artTypeController.getAll);
router.get("/:id", artTypeController.getOne);
router.put("/:id",checkRole("ADMIN"), artTypeController.update);
router.delete("/:id",checkRole("ADMIN"), artTypeController.delete);

module.exports = router;
