import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../../..', 'dist')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
