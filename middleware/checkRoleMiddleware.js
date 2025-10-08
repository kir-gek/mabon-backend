const jwt = require("jsonwebtoken");

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = req.headers.authorization.split(" ")[1]; //  чтобы по пробелу отлепить два слова  (придет типо 'bearer afjalfjalfjaladfnk')
      if (!token) {
        return res.status(401).json({ message: "пользователь не авторизован" });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if(decoded.role !== role){
        return res.status(403).json({ message: "нет доступа у этого вида пользователя" });
      }
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ message: "пользователь не авторизован" });
    }
  };
};
