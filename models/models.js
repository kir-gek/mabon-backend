const sequelize = require("../db");
const { DataTypes, Op } = require("sequelize");

const Author = sequelize.define("author", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  img_url: { type: DataTypes.STRING },
});

const ArtType = sequelize.define("art_type", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
});

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
  img_url: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
});

const Product = sequelize.define("product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.INTEGER },
  img_url: {type: DataTypes.INTEGER},
  gallery: {type:DataTypes.JSON, allowNull: true },
  stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
});

const Order = sequelize.define("order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
  total_amount: { type: DataTypes.INTEGER, allowNull: false },
  payment_info: { type: DataTypes.JSON, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: false },
});

const OrderItem = sequelize.define("order_item", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.INTEGER, allowNull: false },
});

const Cart = sequelize.define("cart", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

const WhishList = sequelize.define("cart", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const Review = sequelize.define("review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING },
  text: { type: DataTypes.TEXT },
  images: { type: DataTypes.JSON },  // если в отзыве могут быть картинки
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
});

// Автор — Продукты (один автор создаёт много продуктов)
Author.hasMany(Product, { foreignKey: "author_id" });
Product.belongsTo(Author, { foreignKey: "author_id" });

ArtType.hasMany(Product, { foreignKey: "type_id" });
Product.belongsTo(ArtType, { foreignKey: "type_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasOne(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Cart, { foreignKey: "product_id" });
Cart.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(WhishList, { foreignKey: "user_id" });
WhishList.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(WhishList, { foreignKey: "product_id" });
WhishList.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Review, { foreignKey: "product_id" });
Review.belongsTo(Product, { foreignKey: "product_id" });

module.exports = {
  Author,
  ArtType,
  User,
  Product,
  Order,
  OrderItem,
  Cart,
  WhishList,
  Review,
};