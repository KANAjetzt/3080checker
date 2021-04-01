// const request = require('request')
// const cheerio = require('cheerio')
require('dotenv').config()
// const {Client} = require('discord.js')

// const client = new Client()

// const scrape = (url, searchClass) => {
//   return new Promise((resolve, reject) => {
//     request(url, async (error, response, html) => { 
//       if(!error & response.statusCode === 200) {
//         // load html in cheerio
//         const $ = cheerio.load(html)
//         // get availability_widget of NBB page
//         const availability = $(searchClass)
//         resolve(availability.text())
//       } else {
//         reject('error scraping')
//       }
//     })
//   })
// }

// const sendMessage = async (message) => {
//   return new Promise(async (resolve, reject) => {
//     const client = new Client()
//     const token = await client.login(process.env.DISCORDJS_BOT_TOKEN)
//     client.on('ready', async () => {
//       const channel = await client.channels.cache.find(channel => channel.name === '3080checker')
//       const messageObj = await channel.send(message)
//       resolve(messageObj.content)
//     })
//   })
// }

// const init = async () => {
//   const NBBurl = 'https://www.notebooksbilliger.de/nvidia%252Bgeforce%252Brtx%252B3080%252Bfounders%252Bedition%252B683301?nbbct=1001_101248&nbb=2177fc&wt_cc8=adgoal&pid=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a&awc=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a'
//   const NVDurl = 'https://www.nvidia.com/de-de/shop/geforce/gpu/?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080'
  
//   const NBBresult = await scrape(NBBurl, '.availability_widget')
//   if(!NBBresult.includes('ausverkauft')) {
//     await sendMessage(NBBresult)
//   } else {
//     console.log(NBBresult)
//   }
  
//   const NVDresult = await scrape(NVDurl, '.buy')
//   if(!NVDresult.includes('NICHT')) {
//     await sendMessage(NVDresult)
//   } else {
//     console.log(NVDresult)
//   }
// }

// // init()

// const url = 'https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=de-de&category=GPU&gpu=RTX%203080&manufacturer=NVIDIA&manufacturer_filter=NVIDIA~1,ASUS~3,EVGA~5,GAINWARD~0,GIGABYTE~1,MSI~2,PNY~2,ZOTAC~1'

// request(url, async (error, response, html) => { 
//   if(!error & response.statusCode === 200) {
//     const body = JSON.parse(response.toJSON().body)
//     console.log(body.searchedProducts.featuredProduct.prdStatus)
//   } else {
//     console.log('error')
//   }
// })

console.log(process.env.DISCORDJS_BOT_TOKEN)
