const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override')
const path = require('path');
const app = express();
const port = 3000;

const { SortMiddleware } = require('./app/middlewares/SortMiddleware');

const route = require('./routes');
const db = require('./config/db');

//Connect to DB
db.connection();

//HTTP logger
app.use(morgan('combined'));

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());

app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, 'public')));

//Custom middlewares
app.use(SortMiddleware);

//Template engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    helpers: {
      sum: (a, b) => a + b,
      sortable: (field, sort) => {
        const sortType = field === sort.column ? sort.type : 'default';

        const icons = {
          default: '/img/icons/sort.svg',
          asc: '/img/icons/sort_up.svg',
          desc: '/img/icons/sort_down.svg',
        }

        const types = {
          default: 'desc',
          asc: 'desc',
          desc: 'asc',
        }

        const icon = icons[sortType] || icons.default;
        const type = types[sortType] || types.default;

        return `<a href="?_sort&column=${field}&type=${type}">
                        <img src="${icon}" alt="" width="15" height="15">
                    </a>`
      }
    }
  }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
