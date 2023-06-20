const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });
const dbConnect = require(path.join(__dirname, "..", "config", "db"));
const User = require(path.join(__dirname, "..", "model", "User"));

const deleteDb = async () => {
  try {
    dbConnect();
    await User.deleteMany({});
    process.exit(0);
  } catch (err) {
  }
};

deleteDb();
