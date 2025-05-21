import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

//2nd method
// import { Pool } from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT),
//   database: process.env.DB_NAME,
// });

// export default pool;

//3rd method

// import { Pool } from "pg";

// const pool = new Pool({
//   user: "postgres",
//   password: "Karan2024",
//   host: "localhost",
//   port: 5432,
//   database: "skillsync",
// });

// export default pool;
