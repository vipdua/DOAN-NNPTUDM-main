const axios = require('axios');

async function test() {
    try {
        console.log('Logging in...');
        const login = await axios.post('http://localhost:3000/api/v1/auth/login', {
            username: 'admin',
            password: '1'
        });
        const token = login.data.token;
        console.log('Token:', token);

        console.log('Fetching categories...');
        const cats = await axios.get('http://localhost:3000/api/v1/categories');
        const catId = cats.data.length > 0 ? cats.data[0]._id : null;
        console.log('CatID:', catId);

        console.log('Adding product...');
        const res = await axios.post('http://localhost:3000/api/v1/products', {
            title: 'Test Product ' + Date.now(),
            price: 1000,
            stock: 10,
            description: 'test',
            category: catId,
            images: ['https://placehold.co/400']
        }, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Error:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
