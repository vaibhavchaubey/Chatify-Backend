import express from 'express';
import userRoute from './routes/user.routes.js';

const app = express();

app.use('/users', userRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(3000, () => {
    console.log('Server started on port 3000');
})