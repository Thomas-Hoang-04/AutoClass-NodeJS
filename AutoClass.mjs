import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {} from "dotenv/config";
import delay from "delay";
import axios from "axios";

const register = async (page, code) => {
  const classID = await page.waitForSelector(`#${process.env.INP_ID}`);
  if (classID) {
    await classID.click();
    await classID.type(`${code}`, { delay: 100 });
    await delay(250);
    const first_confirm = await page.waitForSelector(
      `#${process.env.BTN_ID_1}`
    );
    if (first_confirm) {
      await first_confirm.click();
      await delay(250);
      const send_data = await page.waitForSelector(`#${process.env.BTN_ID_2}`);
      if (send_data) {
        await send_data.click();
        await delay(250);
      }
    }
  }
};

const login = async (page, id, pass) => {
  const usrName = await page.waitForSelector("#tbUserName");
  if (usrName) {
    await usrName.type(`${id}`, { delay: 100 });
  }
  await page.keyboard.press("Tab");
  await delay(500);
  const usrPass = await page.waitForSelector('input[type="password"]');
  if (usrPass) {
    await usrPass.type(`${pass}`, { delay: 100 });
  }
  await delay(500);
};

const test = async () => {
  try {
    const browser = await puppeteer.use(StealthPlugin).launch({
      args: ["--window-size=1024,1280"],
      headless: false,
      executablePath: `${process.env.EXE_PATH}`,
    });
    await delay(500);
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1280 });
    await page.setBypassCSP(true);

    await page.goto(`${process.env.MAIN_PATH}`);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "vi-VN",
    });
    await page.setUserAgent(`${process.env.USER_AGENT}`);
    await page.setJavaScriptEnabled(true);
    await delay(1500);

    await page.reload();
    await page.waitForNetworkIdle({ idleTime: 500 });

    const cImage = await page.waitForSelector("#ccCaptcha_IMG");
    let scrshot;
    if (cImage) {
      scrshot = await cImage.screenshot();
      await delay(800);
    }
    const image = scrshot.toString("base64");

    axios
      .post("http://2captcha.com/in.php", {
        key: `${process.env.API_KEY}`,
        method: "base64",
        body: image,
      })
      .then(async res => {
        const id = res.data.split("|")[1];
        await delay(6500);
        axios
          .request({
            method: "GET",
            url: "http://2captcha.com/res.php",
            params: {
              key: `${process.env.API_KEY}`,
              action: "get",
              id: `${id}`,
            },
          })
          .then(async res => {
            const result = res.data.split("|")[1];
            await delay(500);
            const captcha = await page.waitForSelector("#ccCaptcha_TB_I");
            if (captcha) {
              await captcha.click();
              await delay(750);
              await captcha.type(`${result}`, { delay: 100 });
            }
            await delay(1000);
            const ent = await page.waitForSelector('button[type="submit"]');
            if (ent) {
              await ent.click();
            }
          })
          .catch(err => {
            if (err) console.log("Fail");
          });
      })
      .catch(err => {
        if (err) console.log("Fail");
      });
    await delay(250);

    await login(page, 20225187, "Ro5Cz3d4");
    await page.waitForNavigation({ waitUntil: ["networkidle0"] });
    await delay(500);

    if (page.url() !== `${process.env.MAIN_PATH}`) {
      await page.reload();
      await delay(750);
      await register(page, 733160);
      await register(page, 733161);
      await delay(1000);
      const final_confirm = await page.waitForSelector(
        `#${process.env.BTN_ID_3}`
      );
      if (final_confirm) {
        await final_confirm.click();
        await delay(1000);
      }
    } else {
      console.log("Login Error");
    }
  } catch (err) {
    console.log(err);
    console.log("\n\n");
    console.log("Automation Error");
  }
};

test();
