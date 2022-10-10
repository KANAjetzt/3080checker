require("dotenv").config();
const request = require("request");
const { Client } = require("discord.js");

const NVIDIA_ENDPOINT =
  "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080&manufacturer=NVIDIA";
let cookie =
  "ak_bmsc=645A9A81B400A683E65F78258C21CA96~000000000000000000000000000000~YAAQhSV+aHqUJKmDAQAA4qDFwRHguI1X8Kj5bxjHdWElLhARlCdir4qLlhDmkS/1gHxe3uHBQ6kcFwsuxwYVQWygw5CgdDkM1vBiogKEjveVDqnvXLqqmUlACtcyMCdd4CYFuzmDS/YJ2ItUMQ/Bg8yO7oxb18eJ5hew4ReXnZ2sq3dRymlEsb4TyrP8cd2pTl6PJiN/C5eqpcjvlGPdm/VmVV9t4LRHt6J/XZD7hanDwYl5xOFbjqjFfOKcXv5tl0sd4dNUUajsY9miAIiuiU3iLU2ZB30ImipdiVrzcsXpbfQ7Uh9arI+c8g3SR65YTuOJyv6WdnNxyiOlO97MVO7PgE5p3AjnBdHTxhvbetlfyE6Ed1Rcpl+l10P4fP+OMg==; bm_sv=40054D2C255BD6B68692464FAEA62BCE~YAAQlx0QApu0sbmDAQAA27qVwRHxMcUQs1V7KE/vaeTfsiFx5wjryYZd/nCEpEU5ZC0GHG8k0ukNTOqEP4OUfUcrFk2ykOkdtrf5yjUx0DM44q+NGmT/OqBGTTwpZLkHBnQpUOWh7sHCoItnLOMxVdr+SjNxUtppsCjz4Vo99WtFtEng0/uNvruUrhdM78a4xVAXVEMZD4+vcZIDxCNhuZ5Vy3MDMybXJU8tHinAvNwofmm1s+Z3mR2rCM127KXjl9S4R04=~1";

const handler = async (event, context) => {
  async function getNvidia() {
    return new Promise((resolve, reject) => {
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
        cookie = response.headers["set-cookie"][0].split(";")[0];

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
      await client.login(process.env.DISCORDJS_BOT_TOKEN);
      console.log("Bot logging in...");
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

  return await init();
};

exports.handler = handler;
