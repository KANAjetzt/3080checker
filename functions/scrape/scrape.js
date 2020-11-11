require('dotenv').config()
const request = require('request')
const cheerio = require('cheerio')
const {Client} = require('discord.js')


const handler = async (event, context) => {

  const sendMessage = (message) => {
    const channel = client.channels.cache.find(channel => channel.name === '3080checker')
    channel.send(message)
  }

  // RTX 3080 Founders Edition on Notebooksbilliger.de
  const url = 'https://www.notebooksbilliger.de/nvidia%252Bgeforce%252Brtx%252B3080%252Bfounders%252Bedition%252B683301?nbbct=1001_101248&nbb=2177fc&wt_cc8=adgoal&pid=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a&awc=11348_1603460418_79964a12f864b38ee6c28e1057c02b2a'
  // const url = `https://www.notebooksbilliger.de/pc+hardware/grafikkarten/nvidia/geforce+rtx+3000+serie+nvidia/gigabyte+geforce+rtx+3090+vision+oc+24g+grafikkarte+685795`
    
    request(url, async (error, response, html) => {
      
      // On rquest error send back status 500 with error message
      if(error){
        return {
          statusCode: 500,
          body: JSON.stringify({status: "error", message: "error scraping"})
      };
      }
      
      // If no error
      if(!error & response.statusCode === 200){
        
        // load html in cheerio
        const $ = cheerio.load(html)
        // get availability_widget of NBB page
        const availability = $('.availability_widget')
        
        // If the text in the availability_widget doesn't include "ausverkauft"
        if(!(availability.text()).includes('ausverkauft')){
          try {
            // send a message with the text to the discord channel
            const client = new Client()
            const token = await client.login(process.env.DISCORDJS_BOT_TOKEN)
            sendMessage(availability.text())
            // end send response 200 with success message
            return {
              statusCode: 200,
              body: JSON.stringify({status: "success", message: token})
          };
          }catch(err) {
            return {
              statusCode: 500,
              body: JSON.stringify({status: "error", message: "error sending discord message"})
          };
          }
        }       
      }
    })
}

exports.handler = handler