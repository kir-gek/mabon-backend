const ApiError = require("../error/ApiError");
const { User } = require("../models/models");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const path = require("path");

const generateJWT = (id, email, phone, role, first_name, last_name, img) => {
  return jwt.sign(
    { id, email, phone, role, first_name, last_name, img },
    process.env.SECRET_KEY,
    {
      expiresIn: "50h",
    }
  );
};

class UserController {
  async getUsers(req, res, next) {
    try {
      const usersAll = await User.findAll({
        order: [["last_name", "ASC"]],
      });
      return res.json(usersAll);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const id = req.params.id;

      const user = await User.findOne({
        where: { id },
      });
      return res.json(user);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async updateUser(req, res, next) {
    try {
      const id = req.params.id;
      const { password, first_name, last_name, address } = req.body;

      await User.update(
        { password, first_name, last_name, address },
        { where: { id } }
      );
      const user = await User.findAll({ where: { id } });
      return res.json(user[0]);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async updateUserImg(req, res, next) {
    try {
      const id = req.params.id;
      const { img_url } = req.files;
      let fileName = uuid.v4() + ".jpg";
      img_url.mv(path.resolve(__dirname, "..", "static/user", fileName));

      await User.update({ img_url: fileName }, { where: { id } });

      const user = await User.findAll({ where: { id } });
      return res.json(user[0]);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async registration(req, res, next) {
    try {
      const { email, phone, password, first_name, last_name } = req.body;

      if (!email || !password) {
        return next(ApiError.badRequest("нет логина или пароля в запросе"));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(
          ApiError.badRequest("Такой пользователь с таким логином уже есть")
        );
      }

      const user = await User.create({
        email,
        phone,
        password,        
        first_name,
        last_name,
      });
      const token = generateJWT(
        user.id,
        user.email,
        user.phone,
        user.role,
        user.first_name,
        user.last_name,
        null
      );
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(ApiError.badRequest("нет эл адреса или пароля в запросе"));
      }
      const currentUser = await User.findOne({ where: { email } });
      if (!currentUser) {
        return next(ApiError.internal("Такого пользователя нет"));
      }

      if (currentUser.password != password) {
        return next(ApiError.internal("неверный пароль"));
      }

      const token = generateJWT(
        currentUser.id,
        currentUser.email,
        currentUser.phone,
        currentUser.role,
        currentUser.first_name,
        currentUser.last_name,
        currentUser.img_url
      );
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async check(req, res, next) {
    const token = generateJWT(
      req.user.id,
      req.user.email,
      req.user.phone,
      req.user.role,
      req.user.first_name,
      req.user.last_name,
      req.user.img_url
    );
    res.json({ token });
  }

  async deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      await User.destroy({
        where: { id },
      });
      return res.json("ok");
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new UserController();
