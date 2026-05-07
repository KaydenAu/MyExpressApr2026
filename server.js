const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const cors = require('cors');
const corsOptions = {
    origin: ['http://localhost:3000', ''], // allowed origins
    method: 'GET,HEAD,POST,PATCH,PUT,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors(corsOptions));
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure Express Static Path
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use( methodOverride( '_method' ));

// Configure Routes
const blogRoutes = require('./routes/blog/blog_routes');
app.use('/blogs', blogRoutes);

const contactRoutes = require('./routes/contacts/contacts_routes');
app.use('/contacts', contactRoutes);

const usersRoutes = require('./routes/users/users_routes');
app.use('/users', usersRoutes);

const reportApiRoutes = require('./routes/api/report_api_routes');
app.use('/api/reports', reportApiRoutes);

const authApiRoutes = require('./routes/api/auth_api_routes');
app.use('/api/auth', authApiRoutes);


app.use('/api/files/images', express.static(path.join(__dirname, "files/images")))

// GET request
app.get('/', (req, res) => {
    res.send('Hello Express!');
});

app.get( '/about', (req, res) => {
    res.send('You are viewing About Us Page!');
});

app.get('/products/:id',(req,res) => {
    const {id} = req.params;
    res.send('Product ID is ' + id);
});

app.get('/search',(req, res) => {
    const {keyword, page} = req.query;
    res.send('Search: ' + keyword + ' (Page: ' + page + ')');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
