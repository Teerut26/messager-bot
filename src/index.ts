import { Request, Response } from "express";
import puppeteer from "puppeteer";
import Server from "./server";
require("dotenv").config();

export interface CookieList {
    domain: string,
    name: string,
    value: string,
    path: string,
}

let cookie_list: CookieList[] = JSON.parse(process.env.COOKIE_LIST as string).map((item:any) => ({
    domain: item.domain,
    name: item.name,
    value: item.value,
    path: item.path,
}));

class Message extends Server {
    private browser!: puppeteer.Browser;
    private page!: puppeteer.Page;
    private url!: string;

    constructor(url: string) {
        super();
        this.url = url;
        this.initBrowser();
        this.rounter();
    }

    private async initBrowser() {
        this.browser = await puppeteer.launch();
        await this.initNewPage();
        await this.setCookie();
        console.log(`[x] setCookie`)
        await this.goto();
        await this.page.waitForSelector(
            "button._527y.btn.btnC.mfss.touchable.iconOnly"
        );
        console.log(`[x] browser run success`)
    }

    private async initNewPage() {
        return (this.page = await this.browser.newPage());
    }

    private async setCookie() {
        return await this.page.setCookie(...cookie_list);
    }

    private async goto() {
        return await this.page.goto(this.url);
    }

    private async sendLike() {
        await this.page.waitForSelector(
            "button._527y.btn.btnC.mfss.touchable.iconOnly"
        );
        return await this.page.click(
            "button._527y.btn.btnC.mfss.touchable.iconOnly"
        );
    }

    private async sendMessage(message: string) {
        console.log(">> send_message : ",message)
        await this.page.waitForSelector("#composerInput");
        await this.page.click("#composerInput");

        await this.page.$eval(
            "#composerInput",
            (el: any, message) => {
                return (el.value = message);
            },
            message
        );

        await this.page.click("#composerInput");
        await this.page.keyboard.press(" ");

        await this.page.waitForSelector(
            "button._5y14._52cp.btn.btnC.mfss.touchable"
        );

        return await this.page.click(
            "button._5y14._52cp.btn.btnC.mfss.touchable"
        );
    }

    private rounter(): void {
        this.app.post("/send-message", async (req: Request, res: Response) => {
            let { content } = req.body;
            await this.sendMessage(content as string);
            res.status(200).json({ message: "ok" });
        });

        this.app.post("/send-like", async (req: Request, res: Response) => {
            await this.sendLike();
            res.status(200).json({ message: "ok" });
        });
    }
}

new Message(process.env.MESSAGE_URL as string);
