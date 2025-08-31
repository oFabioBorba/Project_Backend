import express from 'express';
import cors from 'cors';
import loginRouter from './routes/login.js';
import signRouter from './routes/sign.js';
import profileRouter from './routes/profile.js'
import adRouter from './routes/advertisement.js'

const PORT = 8080;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/login', loginRouter);
app.use('/sign', signRouter);
app.use('/profile', profileRouter)
app.use('/ad', adRouter)



app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
