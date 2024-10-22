const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRouter = require("./routes/user");
const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.listen(process.env.PORT, () => {
  console.log(`Server is running live on port ${process.env.PORT}`);
  mongoose.connect(process.env.MONGOOSE_URI, {});
  mongoose.connection.on("error", (error) => {
    console.error(error);
  });
});
