
import {shortenedRoutes} from "./routes/shortener.routes.js";
import express from "express";

const app = express();

const PORT = 3000;


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// app.use(router);
app.use(shortenedRoutes);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

