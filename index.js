
const fs = require('fs');
const puppeteer = require('puppeteer');
const $ = require('cheerio');

const url = 'https://persona-exp.geops.net/delegate-monitor';
let config = readConfigFile('config.json');
let crashedDelegates = "";


main();

function hasAdminBeenContacted(config, messageText){
    if(config.whenWasAdminContacted != null){
        shouldAdminBeContacted(config, delegate);
    }
    else {
        config.whenWasAdminContacted = new Date().toJSON();
        sendMessage(messageText);
        writeConfigFile('config.json', config);
    }
}
function shouldAdminBeContacted(config, messageText) {
    let oldTime = new Date(Date.parse(config.whenWasAdminContacted));
    let newTime = new Date();

    if((newTime.getTime() - oldTime.getTime()) > 86400000)
    {
        config.whenWasAdminContacted = newTime;
        sendMessage(messageText);
        writeConfigFile('config.json', config);
    }
}
function readConfigFile(configFile){
    let rawConfig = fs.readFileSync(configFile);
    let config = JSON.parse(rawConfig);
    return config;
}
function writeConfigFile(fileName, data){
    jsonData = JSON.stringify(data);
    fs.writeFileSync(fileName,jsonData);
}



//scrape the site functionality
function main(){
    puppeteer
    .launch()
    .then(function(browser) {
        return browser.newPage();
    })
    .then(function(page) {
        return page.goto(url, {waitUntil: 'networkidle0'}).then(function(){
            return page.content();
        });
    })
    .then(function(html){
        $('.table-component__table__body > tr ', html)
        .each(function() {
            var delegate = $(this).find("a > span").first().text();

            if(shouldDelegateBeEvaluated(delegate)){
                crashedDelegates += delegate + "; ";
                if(isDelegateDown(getStatusColor(this))){
                    hasAdminBeenContacted(config, crashedDelegates);
                }
            }
            
          });
          browser.close();
    })
    .catch(function(err) {
    });
}

function shouldDelegateBeEvaluated(delegate){
    //make iterative over config delegates object
    if(delegate == "persona_power"|| delegate == "crna_luca" || delegate == "biggie_smalls" || delegate == "von_kamata"){
        return true;
    }
}

function isDelegateDown(statusColor){
    if(statusColor != "#838a9b" && statusColor != "#46b02e"){
        return true;
    }
    else return false;
}
function getStatusColor(el){
    return $(el).find("path").prop("fill");
}
function sendMessage(delegate){
    //implement message send
    console.log(delegate + " is Down Or missing Blocks")
}


