const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: "Server running" });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Server running');
});
