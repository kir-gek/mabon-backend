const { Product, Author, ArtType } = require("../models/models");
const ApiError = require("../error/ApiError");
const uuid = require("uuid");
const path = require("path");
const fs = require('fs');


class ProductController {
  async create(req, res, next) {
    try {
      const { title, description, price, stock, author_id, type_id } = req.body;
      const product = await Product.create({
        title,
        description,
        price,
        stock,
        author_id,
        type_id,
      });
      return res.json(product);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async updateIMG(req, res, next) {
    try {
      const id = req.params.id;
      const { img_url } = req.files;
      let fileName = uuid.v4() + ".jpg";
      img_url.mv(path.resolve(__dirname, "..", "static/product", fileName));

      await Product.update({ img_url: fileName }, { where: { id } });

      const user = await Product.findAll({ where: { id } });
      return res.json(user[0]);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async addToGallery(req, res, next) {
    try {
      const id = req.params.id;
      const { gallery_images } = req.files; // массив файлов    
      const product = await Product.findOne({ where: { id } });
      const currentGallery = product.gallery || [];
      const newImages = [];
      // Если один файл - превращаем в массив
      const files = Array.isArray(gallery_images) ? gallery_images : [gallery_images];

      for (const file of files) {
        const fileName = uuid.v4() + ".jpg";
        await file.mv(path.resolve(__dirname, "..", "static/product/gallery", fileName));
        newImages.push(fileName);
      }
      const updatedGallery = [...currentGallery, ...newImages];
      await Product.update({ gallery: updatedGallery }, { where: { id } });

      const updatedProduct = await Product.findOne({ where: { id } });
      return res.json(updatedProduct);

    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async removeFromGallery(req, res, next) {
    try {
      const id = req.params.id;
      const { fileName } = req.body;

      const product = await Product.findOne({ where: { id } });
      const currentGallery = product.gallery || [];

      // Фильтруем массив, убирая указанный файл
      const updatedGallery = currentGallery.filter(file => file !== fileName);

      await Product.update({ gallery: updatedGallery }, { where: { id } });

      // удалить физический файл с диска
      fs.unlinkSync(path.resolve(__dirname, "..", "static/product/gallery", fileName));

      const updatedProduct = await Product.findOne({ where: { id } });
      return res.json(updatedProduct);

    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    let {
      title,
      price,
      stock,
      limit,
      page
    } = req.query;
    page = page || 1;
    limit = limit || 10;
    let offset = page * limit - limit;
    try {
      let whereClause = {};
      if (title) {
        whereClause.title = title;
      }
      if (price){
        whereClause.price = price;
      }
      if (stock) {
        whereClause.stock = stock;
      }

      const products = await Product.findAll({
        where: whereClause,
        limit,
        offset,
        order: [["id", "ASC"]],
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

      const product = await Product.findOne({ where: { id } });

      if (!product) {
        return next(ApiError.notFound("Product not found"));
      }

      // Удаляем основное изображение 
      if (product.img_url) {
        const mainImagePath = path.resolve(__dirname, "..", "static/product", product.img_url);
        if (fs.existsSync(mainImagePath)) {
          fs.unlinkSync(mainImagePath);
        }
      }

      // удвл все файлы из галереи если они есть
      if (product.gallery && Array.isArray(product.gallery)) {
        for (const fileName of product.gallery) {
          const galleryImagePath = path.resolve(__dirname, "..", "static/product/gallery", fileName);
          if (fs.existsSync(galleryImagePath)) {
            fs.unlinkSync(galleryImagePath);
          }
        }
      }

      //  Удаляем запись из бд
      await Product.destroy({ where: { id } });

      return res.json({ message: "Product and all associated images deleted successfully" });

    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new ProductController();
