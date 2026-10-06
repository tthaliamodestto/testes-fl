import express from "express";

import router from "./routes/router.js";

import cors from "cors";

import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', router);

app.listen(process.env.SERVER_PORT || 3000, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.SERVER_PORT || 3000}`);
})

