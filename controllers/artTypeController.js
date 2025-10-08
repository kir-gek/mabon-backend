const { ArtType } = require("../models/models");
const ApiError = require("../error/ApiError");

class ArtTypeController {
  async create(req, res, next) {
    try {
      const { title } = req.body;
      const artType = await ArtType.create({ title });
      return res.json(artType);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res, next) {
    try {
      const types = await ArtType.findAll();
      return res.json(types);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const at = await ArtType.findByPk(id);
      if (!at) {
        return next(ApiError.notFound("Art type not found"));
      }
      return res.json(at);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const [count, [updated]] = await ArtType.update(
        { title },
        { where: { id }, returning: true }
      );
      if (count === 0) {
        return next(ApiError.notFound("Art type not found"));
      }
      return res.json(updated);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const count = await ArtType.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("Art type not found"));
      }
      return res.json({ message: "Art type deleted" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new ArtTypeController();
