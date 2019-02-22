import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../build')));

app.listen(8080, () => {
  console.log('server listening on 8080');
});
