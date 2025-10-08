require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const model = require("./models/models");
const cors = require(`cors`);
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const path = require('path')

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}));  // дает возможность работать с файлами

app.use("/api", router);

// обработка ошибка (замыкающий мидлвэйр)
app.use(errorHandler);

// app.get('/test' , (req, res)=> {res.status(200).json({message: 'rrrrr'})})

const start = async () => {
  try {
    await sequelize.authenticate(); //здесь идет подключение к базе данных
    await sequelize.sync(); // сверяет состояние БД с схемой БД
    app.listen(PORT, () => console.log(`rabotaet ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
