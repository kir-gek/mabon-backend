const { Cart, Product } = require("../models/models");
const ApiError = require("../error/ApiError");

class CartController {
  async addToCart(req, res, next) {
    try {
      const { user_id, product_id, quantity } = req.body;
      // проверить, что такой уже item есть, тогда просто увеличить количество
      const existing = await Cart.findOne({ where: { user_id, product_id } });
      if (existing) {
        existing.quantity += quantity;
        await existing.save();
        return res.json(existing);
      }
      const cartItem = await Cart.create({ user_id, product_id, quantity });
      return res.json(cartItem);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getUserCart(req, res, next) {
    try {
      const user_id = req.params.user_id;
      const items = await Cart.findAll({
        where: { user_id },
        include: [Product],
      });
      return res.json(items);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const [count, [updated]] = await Cart.update(
        { quantity },
        { where: { id }, returning: true }
      );
      if (count === 0) {
        return next(ApiError.notFound("Cart item not found"));
      }
      return res.json(updated);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async removeFromCart(req, res, next) {
    try {
      const { id } = req.params;
      const count = await Cart.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("Cart item not found"));
      }
      return res.json({ message: "Removed from cart" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new CartController();
