require('dotenv').config()
const request = require('request')
const cheerio = require('cheerio')
const {Client} = require('discord.js')

exports.handler = async function(event, context) {
  const client = new Client()

  client.login(process.env.DISCORDJS_BOT_TOKEN)


  const sendMessage = (message) => {
    const channel = client.channels.cache.find(channel => channel.name === '3080checker')
    channel.send(message)
  }
  
  
  const url = 'https://www.notebooksbilliger.de/nvidia%252Bgeforce%252Brtx%252B3080%252Bfounders%252Bedition%252B683301?nbbct=1001_101248&nbb=2177fc&wt_cc8=adgoal&pid=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a&awc=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a'
  // const url = `https://www.notebooksbilliger.de/pc+hardware/grafikkarten/nvidia/geforce+rtx+3000+serie+nvidia/gigabyte+geforce+rtx+3090+vision+oc+24g+grafikkarte+685795`
  
  request(url, (error, response, html) => {

    if(error){
      return {
        statusCode: 500,
        body: JSON.stringify({status: "error", message: "error scraping"})
    };
    }

    if(!error & response.statusCode === 200){
      const $ = cheerio.load(html)
  
      const availability = $('.availability_widget')
      
      try {
        sendMessage(availability.text())
      }catch(err) {
        return {
          statusCode: 500,
          body: JSON.stringify({status: "error", message: "error sending discord message"})
      };
      }
    }
  })

  return {
    statusCode: 200,
    body: JSON.stringify({status: "success"})
};
}