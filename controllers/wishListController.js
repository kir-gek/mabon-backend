const { WhishList, Product, User } = require("../models/models");
const ApiError = require("../error/ApiError");

class WishListController {
  async addToWishList(req, res, next) {
    try {
      const { user_id, product_id } = req.body;
      const existing = await WhishList.findOne({
        where: { user_id, product_id },
      });
      if (existing) {
        return res.json(existing);
      }
      const item = await WhishList.create({ user_id, product_id });
      return res.json(item);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getUserWishList(req, res, next) {
    try {
      const { user_id } = req.params;
      const items = await WhishList.findAll({
        where: { user_id },
        include: [Product],
      });
      return res.json(items);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async removeFromWishList(req, res, next) {
    try {
      const { id } = req.params;
      const count = await WhishList.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("WishList item not found"));
      }
      return res.json({ message: "Removed from wish list" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new WishListController();
