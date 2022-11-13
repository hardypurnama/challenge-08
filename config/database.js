const {
  DB_USER = "postgres",
  DB_PASSWORD = "sgyYq4JDYqjoWTz4S9Ud",
  DB_NAME = "Mobil",
  DB_HOST = "containers-us-west-93.railway.app",
  DB_PORT = "7920",
} = process.env;

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: `${DB_NAME}_development`,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
  },
  test: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: `${DB_NAME}_test`,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
  },
  production: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: `${DB_NAME}_production`,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
  },
};
