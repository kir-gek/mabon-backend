const { Review, Product, User } = require("../models/models");
const ApiError = require("../error/ApiError");

class ReviewController {
  async createReview(req, res, next) {
    try {
      const { user_id, product_id, rating, title, text, images } = req.body;
      const review = await Review.create({
        user_id,
        product_id,
        rating,
        title,
        text,
        images,
        verified: false,
        status: "pending",
      });
      return res.json(review);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getProductReviews(req, res, next) {
    try {
      const { product_id } = req.params;
      const reviews = await Review.findAll({
        where: { product_id },
        include: [User],
      });
      return res.json(reviews);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async getAll(req, res, next) {
    let { user_id, product_id, status, limit, page } = req.query;
    page = page || 1;
    limit = limit || 10;
    let offset = page * limit - limit;
    try {
      let whereClause = {};
      if (user_id) {
        whereClause.user_id = user_id;
      }
      if (product_id) {
        whereClause.product_id = product_id;
      }
      if (status) {
        whereClause.status = status;
      }
      const reviews = await Review.findAll({
        where: whereClause,
        limit,
        offset,
        include: [User, Product],
      });
      return res.json(reviews);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
  async updateReview(req, res, next) {
    const { id } = req.params;
    let { status, verified } = req.body;
    try {
      const [count, [updated]] = await Review.update(
        { status, verified },
        { where: { id }, returning: true }
      );
      if (count === 0) {
        return next(ApiError.notFound("Review not found"));
      }
      return res.json(updated);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const count = await Review.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("Review not found"));
      }
      return res.json({ message: "Review deleted" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new ReviewController();
