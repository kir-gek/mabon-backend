const Router = require("express");
const productController = require("../controllers/productController");
const router = new Router();
const checkRole = require("../middleware/checkRoleMiddleware");


router.post("/", checkRole("ADMIN"), productController.create);
router.patch("/img-URL/:id", checkRole("ADMIN"), productController.updateIMG);
router.post("/gallery/:id", checkRole("ADMIN"), productController.addToGallery);
router.post("/remove-from-gallery/:id", checkRole("ADMIN"), productController.removeFromGallery);
router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.put("/:id", checkRole("ADMIN"), productController.update);
router.delete("/:id", productController.delete);

module.exports = router;