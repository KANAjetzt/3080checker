require('dotenv').config()
const request = require('request')
const cheerio = require('cheerio')
const {Client} = require('discord.js')


const handler = async (event, context) => {

  const scrape = (url) => {
    return new Promise((resolve, reject) => {
      request(url, async (error, response, html) => { 
        if(!error & response.statusCode === 200) {
          // load html in cheerio
          const $ = cheerio.load(html)
          // get availability_widget of NBB page
          const availability = $('.availability_widget')
          resolve(availability.text())
        } else {
          reject('error scraping')
        }
      })
    })
  }

  const sendMessage = async (message) => {
    return new Promise(async (resolve, reject) => {
      const client = new Client()
      const token = await client.login(process.env.DISCORDJS_BOT_TOKEN)
      client.on('ready', async () => {
        const channel = await client.channels.cache.find(channel => channel.name === '3080checker')
        const messageObj = await channel.send(message)
        resolve(messageObj.content)
      })
    })
  }

  const init = async () => {
    // RTX 3080 Founders Edition on Notebooksbilliger.de
    const url = 'https://www.notebooksbilliger.de/nvidia%252Bgeforce%252Brtx%252B3080%252Bfounders%252Bedition%252B683301?nbbct=1001_101248&nbb=2177fc&wt_cc8=adgoal&pid=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a&awc=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a'
    const result = await scrape(url)
    if(!result.includes('ausverkauft')) {
      await sendMessage(result)
      return {
        statusCode: 200,
        body: JSON.stringify({action: 'send Discord Message', message: result})
    };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({action: 'nothing', message: result})
    };
    }
  }

  return await init()  
}

exports.handler = handler