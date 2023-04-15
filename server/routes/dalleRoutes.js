import express, { response } from 'express';
import * as dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

dotenv.config();

const router = express.Router();

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

router.route('/').get(async(req, res) => {
    res.send('Hello from DALL-E API');
});

router.route('/').post(async(req, res) => {
    try {
        const { prompt } = req.body;
        // console.log(prompt);
        // const response = await openai.createImage({
        //     prompt: prompt,
        //     n: 1,
        //     size: '1024x1024',
        //     response_format: 'b64_json',
        // });

        // const image = response.data.data[0].b64_json;

        const options = {
            method: 'POST',
            url: 'https://openai80.p.rapidapi.com/images/generations',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': `${process.env.RAPID_API_KEY}`,
                'X-RapidAPI-Host': 'openai80.p.rapidapi.com'
            },
            data: `{ "prompt":"${prompt}", "n":1, "size":"1024x1024", "response_format":"b64_json" }`
        };

        await axios.request(options).then(function (response) {
            // console.log(response.data);
            const image = response.data.data[0].b64_json;
            res.status(200).json({ photo: image });
        }).catch(function (error) {
            console.error(error?.response.data);
        });


    } catch (error) {
        console.log(error?.response.data);
        res.status(500).json({ message: 'Something went wrong', error: error?.response.data.error.message });
    }
});

export default router;