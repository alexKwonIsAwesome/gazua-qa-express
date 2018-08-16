import * as express from 'express';
import * as bodyParser from 'body-parser';

const app = express();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(7777, () => console.log('Hi!!'));