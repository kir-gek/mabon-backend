const { Order, OrderItem, Product, User } = require("../models/models");
const ApiError = require("../error/ApiError");

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { user_id, address, payment_info, items } = req.body;
      // items — массив: [{ product_id, quantity, price }, ...]
      // Можно валидировать, что user существует, продукты существуют и есть на складе

      const order = await Order.create({
        user_id,
        address,
        payment_info,
        status: "pending",
        total_amount: items.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        ),
      });

      // Создать ордерИтемы
      const orderItems = await Promise.all(
        items.map((it) => {
          return OrderItem.create({
            order_id: order.id,
            product_id: it.product_id,
            quantity: it.quantity,
            price: it.price,
          });
        })
      );
      return res.json({ order, items: orderItems });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  // Получить все заказы (для админа)
  async getAllAdmin(req, res, next) {
    let { user_id, status, limit, page } = req.query;
    page = page || 1;
    limit = limit || 10;
    let offset = page * limit - limit;
    try {
      let whereClause = {};
      if (user_id) {
        whereClause.user_id = user_id;
      }
      if (status) {
        whereClause.status = status;
      }

      const orders = await Order.findAll({
        where: whereClause,
        limit,
        offset,
        order: [["id", "ASC"]],
        include: [{ model: OrderItem, include: [Product] }, User],
      });
      return res.json(orders);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  // Получить все заказы юзера
  async getAll(req, res, next) {
    const { user_id } = req.params;
    if (!user_id) {
      return next(ApiError.notFound("user not found"));
    }
    try {
      const orders = await Order.findAll({
        where: { user_id },
        order: [["id", "ASC"]],
        include: [{ model: OrderItem, include: [Product] }, User],
      });
      return res.json(orders);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  // Получить один заказ по id
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [{ model: OrderItem, include: [Product] }, User],
      });
      if (!order) {
        return next(ApiError.notFound("Order not found"));
      }
      return res.json(order);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  // Обновить статус заказа или данные
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { status, address, payment_info } = req.body;

      const [count, [updated]] = await Order.update(
        { status, address, payment_info },
        { where: { id }, returning: true }
      );
      if (count === 0) {
        return next(ApiError.notFound("Order not found"));
      }
      return res.json(updated);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const count = await Order.destroy({ where: { id } });
      if (count === 0) {
        return next(ApiError.notFound("Order not found"));
      }
      return res.json({ message: "Order deleted" });
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
}

module.exports = new OrderController();
