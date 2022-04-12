import express, { Application } from "express";
import bodyParser from "body-parser";
require("dotenv").config();

export default class Server {
    public app: Application;

    constructor() {
        this.app = express();
        this.app.use(bodyParser.json())
        this.run();
    }

    private run(): void {
        this.app.listen(process.env.PORT || 3000);
        console.log(`run on port: ${process.env.PORT || 3000}`);
    }
}
