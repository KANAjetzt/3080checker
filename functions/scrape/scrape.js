require("dotenv").config();
const request = require("request");
const { Client } = require("discord.js");

const handler = async (event, context) => {
  const checkNvidia = () => {
    return new Promise((resolve, reject) => {
      const NvidiaUrl =
        "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080&manufacturer=NVIDIA&manufacturer_filter=NVIDIA~1,ACER~0,ALIENWARE~0,ASUS~2,DELL~0,EVGA~0,GAINWARD~1,GIGABYTE~3,HP~0,INNO3D~1,LENOVO~0,MSI~3,PALIT~0,PNY~1,RAZER~0,ZOTAC~2";

      // ------ Check Nvidia ------
      request(NvidiaUrl, async (error, response, html) => {
        if (!error & (response.statusCode === 200)) {
          const body = JSON.parse(response.toJSON().body);
          resolve(body.searchedProducts.productDetails[0].productAvailable);
        } else {
          reject("error scraping");
        }
      });
    });
  };

  const sendMessage = async (message) => {
    return new Promise(async (resolve, reject) => {
      const client = new Client();
      await client.login(process.env.DISCORDJS_BOT_TOKEN);
      client.on("ready", async () => {
        const channel = await client.channels.cache.find(
          (channel) => channel.name === "3080checker"
        );
        const messageObj = await channel.send(message);
        resolve(messageObj.content);
      });
    });
  };

  const init = async () => {
    const resultNvidia = await checkNvidia();

    // If they are out of stock just return
    if (!resultNvidia) {
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

  return await init();
};

exports.handler = handler;
