require('dotenv').config()
const request = require('request')
const cheerio = require('cheerio')
const {Client} = require('discord.js')


const handler = async (event, context) => {

  const checkNBB = () => {
    return new Promise((resolve, reject) => {
      
      const NNBUrl = 'https://www.notebooksbilliger.de/nvidia%252Bgeforce%252Brtx%252B3080%252Bfounders%252Bedition%252B683301?nbbct=1001_101248&nbb=2177fc&wt_cc8=adgoal&pid=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a&awc=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a'

      // ------ Check NNB ------
      request(NNBUrl, async (error, response, html) => { 
        if(!error & response.statusCode === 200) {
          // load html in cheerio
          const $ = cheerio.load(html)
          // get availability_widget of NBB page
          const availability = $('.availability_widget')
          resolve(availability.text().includes('ausverkauft') ? 'out_of_stock' : availability.text().replace(/\s+/g, ' '))
        } else {
          reject('error scraping')
        }
      })
    })
  }

  const checkNvidia = () => { 
    return new Promise((resolve, reject) => {
      
      const NvidiaUrl = 'https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080&manufacturer=NVIDIA&manufacturer_filter=NVIDIA~1,ASUS~3,EVGA~5,GAINWARD~0,GIGABYTE~1,MSI~2,PNY~2,ZOTAC~1'

      // ------ Check Nvidia ------    
    request(NvidiaUrl, async (error, response, html) => {
      if(!error & response.statusCode === 200) {
        const body = JSON.parse(response.toJSON().body)
        resolve(body.searchedProducts.featuredProduct.prdStatus)
      } else {
        reject("error scraping")
      }
    })
  })
}

  const sendMessage = async (message) => {
    return new Promise(async (resolve, reject) => {
      const client = new Client()
      await client.login(process.env.DISCORDJS_BOT_TOKEN)
      client.on('ready', async () => {
        const channel = await client.channels.cache.find(channel => channel.name === '3080checker')
        const messageObj = await channel.send(message)
        resolve(messageObj.content)
      })
    })
  }

  const init = async () => {

    const resultNBB = await checkNBB()
    const resultNvidia = await checkNvidia()

    // If they are out of stock just return
    if(resultNBB === "out_of_stock" && resultNvidia === "out_of_stock") {
      return {
        statusCode: 200,
       body: JSON.stringify({action: 'nothing', message: {resultNBB, resultNvidia}})
      }
    // if they are available on one Page send Discord Message
    } else {
      await sendMessage(`NBB: ${resultNBB} Nvidia: ${resultNvidia}`)
      return {
        statusCode: 200,
       body: JSON.stringify({action: 'send Discord Message', message: `NBB: ${resultNBB} Nvidia: ${resultNvidia}`})
      }
    }
  }

  return await init()  

  }

exports.handler = handler