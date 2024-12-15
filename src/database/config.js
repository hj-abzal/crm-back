require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`, // Load the correct .env file
});

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
  production: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
};
