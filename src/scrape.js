require("dotenv").config();
const request = require("request");
const fs = require("fs");
const path = require("path");
const { Client } = require("discord.js");

const NVIDIA_ENDPOINT =
  "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080&manufacturer=NVIDIA";
let cookie =
  "ak_bmsc=EF3A78C02CF7D6D13AAB1B82593A0442~000000000000000000000000000000~YAAQh93dWNBC87WDAQAArWdP0BGfpq47rxZ6Nypjnt+x2vETUAxtErOWCygTEFs0vIN2+X1ye8pb8I17lzoJSk81lg7jrd97NLUBNoUuwv7te0kLJPKAIkUtFhWTwHDqG1GS/wBgGM35OphqLBGOsjkBJv6TWWHzpcNgtWdC5o1Uw53aGLTgwu1mFnxKdv3FGeGi419VImdWgJzL5tf7+nUoVk9H3wfaIT8MT7XJcyHwyDlaZOHvc/D8zx5RDbNKLRQKpJ8H/zKgHcYXnkynWHDtLm5+YNXJKuHJP63xJkqMFqcYsWXFq3IJkes78qlbx5bh3fzKEqvrepqIa+E+FlYzuxTuAq5Ajnr0QDLbZ3CyfcuQWf7oinzNONRTw7FDg/U=";

const logPath = path.join(__dirname, "../log/log.txt");

function handleLog(content) {
  const time = new Date();

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  fs.appendFileSync(
    logPath,
    `${time.toLocaleDateString("de-DE", dateOptions)} ${time.toLocaleTimeString(
      "de-DE"
    )} - ${content} \n`
  );
}

async function handler() {
  async function getNvidia() {
    return new Promise((resolve, reject) => {
      console.log(`NVIDIA_ENDPOINT: ${NVIDIA_ENDPOINT}`);
      console.log(`cookie: ${cookie}`);

      const options = {
        method: "GET",
        url: NVIDIA_ENDPOINT,
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "de,de-DE;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          Referer: "https://store.nvidia.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          Cookie: cookie,
        },
      };

      request(options, function (error, response) {
        if (error) {
          reject(error);
        }

        // Update cookie
        console.log(`cookie old: ${cookie}`);
        cookie = response.headers["set-cookie"][0].split(";")[0];
        console.log(`cookie new: ${cookie}`);

        // Grab product available prop
        resolve(
          JSON.parse(response.body).searchedProducts.productDetails[0]
            .productAvailable
        );
      });
    });
  }
  const sendMessage = async (message) => {
    return new Promise(async (resolve, reject) => {
      const client = new Client();

      client.on("error", (error) => {
        console.log(error);
      });

      client.on("ready", async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        const channel = client.channels.cache.get("776070036296040529");

        if (channel) {
          const messageObj = await channel.send(message);
          client.destroy();
          resolve(messageObj.content);
        } else {
          reject("channel not found");
        }
      });

      await client.login(process.env.DISCORDJS_BOT_TOKEN);
      console.log("Bot logging in...");
    });
  };

  const init = async () => {
    console.log("getting nvidia data...");
    const resultNvidia = await getNvidia();
    console.log(`resultNvidia: ${resultNvidia}`);

    // If they are out of stock just return
    if (!resultNvidia) {
      console.log("nothing in stock");
      handleLog("nothing in stock");
      return {
        statusCode: 200,
        body: JSON.stringify({
          action: "nothing",
          message: { resultNvidia },
        }),
      };
      // if they are available on one Page send Discord Message
    } else {
      handleLog("something in stock!");
      await sendMessage(
        `Nvidia: ${resultNvidia} - https://shop.nvidia.com/de-de/geforce/store/gpu/?page=1&limit=9&locale=de-de&gpu=RTX%203080&category=GPU&manufacturer=NVIDIA&manufacturer_filter=NVIDIA~1,ASUS~3,EVGA~5,GIGABYTE~1,MSI~2,PNY~2,ZOTAC~1`
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          action: "send Discord Message",
          message: `Nvidia: ${resultNvidia}`,
        }),
      };
    }
  };

  await init();
}

function interval() {
  setInterval(() => {
    handler();
  }, 1000 * 60 * 1);
}

interval();
