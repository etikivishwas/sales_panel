require("dotenv").config();

const app = require("./app");
const { pool, testConnection } = require("./config/db");

const port = Number(process.env.PORT) || 5000;

let server;

(async () => {
  try {
    // Ensure JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    // Test database connection
    await testConnection();

    // Start the server
    server = app.listen(port, () => {
      console.log(`Sales API: http://localhost:${port}`);
    });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();

// Gracefully shut down the server
async function stop() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await pool.end();

  process.exit(0);
}

// Handle termination signals
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
