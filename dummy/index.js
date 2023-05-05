const express = require('express');
const axios = require('axios');
const app = express();
const port = 3003;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api', async (req, res) => {
    const prompt = req.body;

    const request = require('request');

    const options = {
        method: 'POST',
        url: 'https://openai80.p.rapidapi.com/images/generations',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '0afdd413fdmshf25184bf368188fp11f955jsnb13751e084a0',
            'X-RapidAPI-Host': 'openai80.p.rapidapi.com'
        },
        body: {
            prompt: 'A cute baby sea otter',
            n: 2,
            size: '1024x1024'
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });
});

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });