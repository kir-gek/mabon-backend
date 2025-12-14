const { Order } = require("../models/models");
const ApiError = require("../error/ApiError");
const { randomUUID } = require("crypto"); 
require("dotenv").config();
const axios = require("axios");

// Куда возвращать юзера после оплаты.
const RETURN_URL = `http://${process.env.HOST_IP}:${process.env.FRONTEND_PORT}/order-success`;

class YookassaController {
  async createPayment(req, res, next) {
    try {
      const { orderId } = req.body;

      // Можно валидировать, что user существует, продукты существуют и есть на складе

      if (!orderId) {
        return next(ApiError.badRequest("orderId is required"));
      }
      const order = await Order.findByPk(orderId);
      if (!order) {
        return next(ApiError.notFound("Order not found"));
      }
      const amount = order.total_amount.toFixed(2); //общая сумма с копейками

      const idempotenceKey = randomUUID(); // Ключ идемпотентности

      // Собираем объект для ЮКассы
      const payload = {
        amount: {
          value: amount,
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "embedded", // Это чтобы виджет прямо на сайте был, без редиректа
          return_url: RETURN_URL,
        },
        // Описание платежа, обрезаем, а то касса ругается если слишком длинно
        description: `Оплата заказа #${orderId}`,
        metadata: {
          // Сюда можно пихать че угодно, чисто для себя инфа в админке кассы
          orderId: String(orderId),
          userId: String(order.user_id),
        },
      };

      console.log("--- ОТПРАВЛЯЮ В КАССУ ---");
      console.log(payload);

      // Стучимся в API ЮКассы
      const yooResponse = await axios.post(
        "https://api.yookassa.ru/v3/payments",
        payload,
        {
          auth: {
            username: process.env.SHOP_ID,
            password: process.env.SECRET_KEY,
          },
          headers: {
            "Content-Type": "application/json",
            "Idempotence-Key": idempotenceKey,
          },
        }
      );

      const payment = yooResponse.data;

      // Иногда касса тупит и не возвращает токен, проверяем это
      if (
        !payment.confirmation ||
        payment.confirmation.type !== "embedded" ||
        !payment.confirmation.confirmation_token
      ) {
        console.error("Косяк: касса не дала токен", payment);
        return res.status(500).json({
          message: "ЮKassa не дала токен, походу настройки кривые.",
          raw: payment,
        });
      }

      // Сохраняем данные платежа в заказ
      await order.update({
        payment_id: payment.id,
        payment_status: payment.status,
        payment_response: payment,
      });

      return res.json({
        paymentId: payment.id,
        status: payment.status,
        confirmationToken: payment.confirmation.confirmation_token,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async webhookHandler(req, res, next) {
    try {
      const event = req.body;

      const { type, object } = event;
      if (type === "payment.succeeded") {
        const payment = object;
        const orderId = payment.metadata.orderId;

        const order = await Order.findByPk(orderId);
        if (order) {
          await order.update({
            payment_status: "succeeded",
            payment_response: payment,
          });
        }
      }

      if (type === "payment.canceled") {
        const payment = object;
        const order = await Order.findByPk(payment.metadata.orderId);
        if (order) {
          await order.update({
            payment_status: "canceled",
            payment_response: payment,
          });
        }
      }

      return res.json({ ok: true });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new YookassaController();