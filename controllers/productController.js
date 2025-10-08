const { Product, Author, ArtType } = require("../models/models");
const ApiError = require("../error/ApiError");

class ProductController {
  async create(req, res, next) {
    try {
      const { title, description, price, img_url, gallery, stock, author_id, type_id } = req.body;
      const product = await Product.create({
        title,
        description,
        price,
        img_url,
        gallery,
        stock,
        author_id,
        type_id,
      });
      return res.json(product);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }


  async createIMG(req, res, next) {
  return res.json('в разработке')
       // TO DO
/*
        img_url,
        gallery,
*/
      
  }


  async getAll(req, res, next) {
    try {
      // НАДО добавить фильтры, пагинацию, поиск
      const products = await Product.findAll({
        include: [
          { model: Author, attributes: ["id", "first_name", "last_name", "img_url"] },
          { model: ArtType, attributes: ["id", "title"] },
        ],
      });
      return res.json(products);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [
          { model: Author, attributes: ["id", "first_name", "last_name", "img_url"] },
          { model: ArtType, attributes: ["id", "title"] },
        ],
      });
      if (!product) {
        return next(ApiError.notFound("Product not found"));
      }
      return res.json(product);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, price, stock, author_id, type_id } = req.body;
      const [count, [updated]] = await Product.update(
        { title, description, price, stock, author_id, type_id },
        { where: { id }, returning: true }
      );
      if (count === 0) {
        return next(ApiError.notFound("Product not found"));
      }
      return res.json(updated);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const count = await Product.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("Product not found"));
      }
      return res.json({ message: "Product deleted" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new ProductController();
