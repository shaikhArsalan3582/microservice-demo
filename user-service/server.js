require('dotenv').config(); // If you use .env files
const app = require('./app'); // Assuming your provided code is in app.js

const PORT = process.env.PORT || 3001; // Use an environment variable or a default port

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access API at: http://localhost:${PORT}`);
    console.log(`Access Swagger UI at: http://localhost:${PORT}/api-docs`);
    console.log(`Access Raw Swagger JSON at: http://localhost:${PORT}/swagger.json`);
    console.log(`Access User routes at: http://localhost:${PORT}/users`);
});