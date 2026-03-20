const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// a) GET / → returns { message: "Server running" }
app.get('/', (req, res) => {
    res.json({ message: "Server running" });
});

// b) GET /api/test → returns { success: true }
app.get('/api/test', (req, res) => {
    res.json({ success: true });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
