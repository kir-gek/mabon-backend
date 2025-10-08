const Router = require("express");
const productController = require("../controllers/productController");
const router = new Router();

// TO DO в контроллере еще лежит
router.post("/", productController.create);
router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);

module.exports = router;
