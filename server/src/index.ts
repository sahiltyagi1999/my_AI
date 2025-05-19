import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import chatRoutes from './routes/chat';


const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
