require("dotenv").config();
const request = require("request");
const { Client } = require("discord.js");

const NVIDIA_ENDPOINT =
  "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080&manufacturer=NVIDIA";
let cookie =
  "ak_bmsc=C288E712D890B61EF4C2077030CC83B9~000000000000000000000000000000~YAAQVKEkF+zuqaiDAQAATK46yBESH4fNXMWE2h/gyiPgQqO7zHFamFDhPLxYGqIbZzkY6ae4JVgBUn50vgPv26m35ex9RQPQG1PpYLso8te33/pHGdqvEddVV9uazwC1YJlz0SwAxBVCM9GhZzlfCbAgoZjC3rxWT0j+wF6VsQxN3il3HVebAww+t9H5zUvuciEhqcM+oMc44NravN8CpOCBNHF7zk6vIu5uYUuYgmcoCrd35QLc8jj6ICNEvZ5Dc2KRDzC7+WMzpWzdGjWMQXhmM0tgnOPvvjuevbWPTnfSj8scal+iEFLGmSOB/lORx3Ijabb0AyYslh1lhYJimz8xoY2GeKro3u7N1jd5Su8PBDnkAJsGX/t+z/4fH2+duw0T";

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
      return {
        statusCode: 200,
        body: JSON.stringify({
          action: "nothing",
          message: { resultNvidia },
        }),
      };
      // if they are available on one Page send Discord Message
    } else {
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

handler();
