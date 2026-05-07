const express = require('express');
const db = require('../../database');
const router = express.Router();

router.get('/', async(req, res) => {
    try{
        const [result] = await db.query('Select * FROM users');
        const users = result;
        res.render('users/users',{
            title: 'Users Management',
            content: 'Manage your users', 
            // users
            users: users
        });
    } catch(err) {
        console.log(err);
    }
});

function renderFormPage(res, error = null, user = null){
    const isUpdate = !!user;

    res.render('users/user_form', {
        title: isUpdate ? 'Update User' : 'New User',
        content: isUpdate ? 'Change user details' : 'Fill up user details', 
        error,
        user,
        formAction: isUpdate ? ('/users/update/'+ user.id + '?_method=PUT') : '/users/add',      
    });
};

router.get('/add', (req, res) => {
    renderFormPage(res);
});

router.get('/:id', async(req, res) => {
    try{
        const [result] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        const user = result[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('users/user_details', {
            title: 'User Details',
            content: 'View detailed information about this user.', 
            user
        });
    } catch(err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

function validateForm(name, phone, email, res, userId = null){
    if(!name || name.trim() == '' ){
        renderFormPage(res, 'Name is required', {name, email, phone, id: userId});
        return false;
    }

    if(!phone || !/^\d{6,12}$/.test(phone)){
        renderFormPage(res, 'Valid phone is required', {name, email, phone, id: userId});
        return false;
    }

    if(!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
        renderFormPage(res, 'Valid email is required', {name, email, phone, id: userId});
        return false;
    }

    return true;
};

router.post('/add', async(req,res) => {
    const { name, phone, email } = req.body;

    if(!validateForm(name,phone,email)){
        return ;
    }

    try{
        await db.query('INSERT INTO users (name, email, phone) VALUES (?,?,?)', [name, email,phone]);
        res.redirect('/users');
    } catch(error){
        renderFormPage(res, 'Database error. Please check with admin', {name, email, phone});
    }
});

router.delete('/delete/:id', async(req, res) => {
    try{
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if(result.affectedRows == 0){
            return res.status(404).send('User not found.');
        }
        res.redirect('/users');
    } catch(error) {
        console.log(error);
        res.status(500).send('An error occured. Unable to delete from database.');
    };
});

router.get('/update/:id', async(req, res) => {
    try{
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length < 1){
            return res.status(404).send('User not found');
        }
        const user = rows[0];
        renderFormPage(res, null, user);
    } catch(err) {};
});

router.put('/update/:id', async(req, res) => {
    const { name, phone, email } = req.body;
    
    if(!validateForm(name,phone,email, res, req.params.id)){
        return ;
    }
    
    try{
        const [result] = await db.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',[name, email, phone, req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).send('User not found.');
        }
        res.redirect('/users');
    } catch(err){
        renderFormPage(res,'Database error');
    };

});

module.exports = router;
