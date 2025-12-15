const { Order } = require("../models/models");
const ApiError = require("../error/ApiError");
const { randomUUID } = require("crypto");
require("dotenv").config();
const axios = require("axios");

// Куда возвращать юзера после оплаты.
// const RETURN_URL = `http://${process.env.HOST_IP}:${process.env.FRONTEND_PORT}/order-success`;
const RETURN_URL = "192.168.27.196:5173/order-success";

class YookassaController {
  async testGet(req, res, next) {
    try {
      const smth = "rabotaet";
      return res.json(smth);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }

async createPaymentTest(req, res, next) {
  try {
    const { amount, orderId, description, customer } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ message: "Поле amount обязательно и > 0" });
    }

    // Проверяем наличие переменных окружения
    const shopId ='1182411';
    const secretKey = 'test_pnNMgm3JhjwDHbHz7LN0Wif7mj-VRbqQhxeRAt7786c';
    
    if (!shopId || !secretKey) {
      console.error('Отсутствуют переменные окружения для ЮKassa:', {
        shopId: !!shopId,
        secretKey: !!secretKey
      });
      return res.status(500).json({
        message: "Не настроены платежные ключи",
        error: "Отсутствуют SHOP_ID или SECRET_KEY в переменных окружения"
      });
    }

    console.log('YOO_DEBUG: Используем учетные данные:', {
      shopId: shopId.substring(0, 3) + '...',
      secretKeyLength: secretKey.length,
      secretKeyPrefix: secretKey.substring(0, 5) + '...'
    });

    const idempotenceKey = crypto.randomUUID();

    const payload = {
      amount: {
        value: Number(amount).toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "embedded",
      },
      description: (description || `Заказ ${orderId || ""}`)
        .trim()
        .slice(0, 128),
      metadata: {
        orderId: orderId || null,
        email: customer?.email || null,
        name: customer?.name || null,
      },
    };

    const yooResponse = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      payload,
      {
        auth: {
          username: shopId,
          password: secretKey,
        },
        headers: {
          "Content-Type": "application/json",
          "Idempotence-Key": idempotenceKey,
        },
      }
    );

    const payment = yooResponse.data;

    if (
      !payment.confirmation ||
      payment.confirmation.type !== "embedded" ||
      !payment.confirmation.confirmation_token
    ) {
      return res.status(500).json({
        message: "ЮKassa вернула ответ без confirmation_token",
        raw: payment,
      });
    }

    res.json({
      paymentId: payment.id,
      status: payment.status,
      confirmationToken: payment.confirmation.confirmation_token,
    });
  } catch (error) {
    console.error("YOO_DEBUG_ERROR", {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Более детальная обработка ошибок
    let errorMessage = "Не удалось создать платёж в ЮKassa";
    
    if (error.response?.status === 401) {
      errorMessage = "Ошибка авторизации в ЮKassa. Проверьте shopId и secretKey.";
    } else if (error.response?.status === 400) {
      errorMessage = "Некорректный запрос к ЮKassa.";
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Не удалось подключиться к серверу ЮKassa.";
    }

    res.status(error.response?.status || 500).json({
      message: errorMessage,
      error: {
        code: error.code,
        message: error.message,
        status: error.response?.status || null,
        data: error.response?.data || null,
      },
    });
  }
}
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
