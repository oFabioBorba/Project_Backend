import express from 'express';
import loginRouter from './routes/login.js';
import signRouter from './routes/sign.js';

const PORT = 8080;

const app = express();
app.use(express.json());
app.use('/login', loginRouter);
app.use('/sign', signRouter);


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
