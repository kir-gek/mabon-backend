const { Author } = require("../models/models");
const ApiError = require("../error/ApiError");

class AuthorController {
  async create(req, res, next) {
    try {
      const { first_name, last_name, bio } = req.body;
      const author = await Author.create({
        first_name,
        last_name,
        bio,
      });
      return res.json(author);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async addImg(req, res, next) {
    try {
      const { id } = req.params;
      const { img_url } = req.files;
      let fileName = uuid.v4() + ".jpg";
      img_url.mv(path.resolve(__dirname, "..", "static/authorImg", fileName));
      await Author.update({ img_url: fileName }, { where: { id } });
      const author = await Author.findAll({ where: { id } });
      return res.json(author[0]);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res, next) {
    try {
      const authors = await Author.findAll();
      return res.json(authors);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const author = await Author.findByPk(id);
      if (!author) {
        return next(ApiError.notFound("Author not found"));
      }
      return res.json(author);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { first_name, last_name, bio } = req.body;
      const [count, [updated]] = await Author.update(
        { first_name, last_name, bio },
        { where: { id }, returning: true }
      );
      if (count === 0) {
        return next(ApiError.notFound("Author not found"));
      }
      return res.json(updated);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const count = await Author.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("Author not found"));
      }
      return res.json({ message: "Author deleted" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new AuthorController();
