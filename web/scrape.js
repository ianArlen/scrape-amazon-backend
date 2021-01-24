const puppeteer = require('puppeteer');


const scrape = async () =>{
    const browser= await puppeteer.launch( {headless: false} );
    const page = await browser.newPage();

    await page.goto('https://www.amazon.com.mx/gp/bestsellers/?ref_=nav_cs_bestsellers');

    await page.waitForTimeout(2000);

    await page.waitForSelector('div[class="zg_homeWidget"');
    


    const categories = await page.evaluate(() => {
        async function getchildren (parents, numberson){
            const children = [];
            for (let parent of parents){
                children.push(parent.childNodes[numberson].innerHTML);
            }
            return children;
        }

        const divshomeWidget = document.querySelectorAll(
            'div[class="zg_homeWidget"');
            return getchildren(divshomeWidget, 1);
    });


    const urls = await page.evaluate(() => {
        const elements = document.querySelectorAll(
            'div[class="a-section a-spacing-none p13n-asin"');
        const urls = []; 
        for(let element of elements){
            urls.push(element.childNodes[1].href);
        }
        return urls;
    });
    
    const books = [];
    const stuffs = [];
    const cards = [];
    const data = [];
    
    for ( let url of urls ){
        
        await page.goto(url);

        let isBook = ((await page.$('#productTitle')) !== null 
                            && (await page.$('.author a')) !== null) 
                            && (await page.$('#ebooks-img-wrapper') === null)
                            && (await page.$('#acrCustomerReviewText') !== null); 
        
        let isBookwhithoutval = isBook && (await page.$('#acrCustomerReviewText') === null)                  
        
        let isShop = (await page.$('#ebooks-img-wrapper') !== null);

        let isShopwithstart = isShop && (await page.$('#acrCustomerReviewText') !== null);

        let isShopwithoutstart = isShop && (await page.$('#acrCustomerReviewText') === null);

        let isShopwithoutValStart = isShopwithoutstart && (await page.$('span[class="a-icon-alt') === null);

        let isCard = (await page.$('#gc-asin-title') !== null);

        let isSttuff = (await page.$('[id="imgTagWrapperId"] img') !== null);

        let stuffwithval = (isSttuff && await page.$('#acrCustomerReviewText') !== null);

        let stuffwithoutval = isSttuff && await page.$('#acrCustomerReviewText') === null

        if (isBook){
            const book = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('.author a').innerText;
                tmp.coverImage = document.querySelector('[id="img-canvas"] img').src;
                tmp.value = document.querySelector('span[class="a-icon-alt').innerText;
                tmp.total = document.querySelector('#acrCustomerReviewText').innerText;
            
                return tmp;
            });
            books.push(book);
            data.push(book);
        }
        if(isBookwhithoutval){
            const book = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('.author a').innerText;
                tmp.coverImage = document.querySelector('[id="img-canvas"] img').src;
                tmp.value = '0 0';
                tmp.total = '0 0';
            
                return tmp;
            });
            books.push(book);
            data.push(book);   
        }

        if(isShopwithstart){
            const book = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('.author a').innerText;
                tmp.coverImage = document.querySelector('img[class="a-dynamic-image frontImage"]').src;
                tmp.value = document.querySelector('span[class="a-icon-alt"]').innerText;
                tmp.total = document.querySelector('#acrCustomerReviewText').innerText;
            
                return tmp;
            });
            books.push(book);
            data.push(book);
        }

        if(isShopwithoutstart){
            const book = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('.author a').innerText;
                tmp.coverImage = document.querySelector('img[class="a-dynamic-image frontImage"]').src;
                tmp.value = document.querySelector('[class="ebooksSitbLogo"] img[class="a-dynamic-image frontImage"]').innerText;
                tmp.total = '0 0';
            
                return tmp;
            });
            books.push(book);
            data.push(book);
        }

        if(isShopwithoutValStart){
            const book = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('.author a').innerText;
                tmp.coverImage = document.querySelector('img[class="a-dynamic-image frontImage"]').src;
                tmp.value = '0 0'
                tmp.total = '0 0';
            
                return tmp;
            });
            books.push(book);
            data.push(book);
        }

        if(isCard){
            const card = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#gc-asin-title').innerText;
                tmp.author = document.querySelector('#gc-brand-name-link').innerText;
                tmp.coverImage = document.querySelector('[class="a-section gc-design-image-wrapper"] img').src;
                tmp.value = document.querySelector('span[class="a-icon-alt"]').innerText;
                tmp.total = document.querySelector('#acrCustomerReviewText').innerText;
        
                return tmp;
            });
            cards.push(card);
            data.push(card);
        }

        if(stuffwithval){
            const stuff = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('#bylineInfo').innerText;
                tmp.coverImage = document.querySelector('[id="imgTagWrapperId"] img').src;
                tmp.value = document.querySelector('span[class="a-icon-alt"]').innerText;
                tmp.total = document.querySelector('#acrCustomerReviewText').innerText;

                return tmp;
            });            
            stuffs.push(stuff);
            data.push(stuff);
        }

        if(stuffwithoutval){
            const stuff = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#productTitle').innerText;
                tmp.author = document.querySelector('#bylineInfo').innerText;
                tmp.coverImage = document.querySelector('[id="imgTagWrapperId"] img').src;
                tmp.value = '0 0';
                tmp.total = '0 0';


                return tmp;
            });
            stuffs.push(stuff);
            data.push(stuff);
        }

    }
    
    scrapeData = [];
    scrapeData.push(categories);
    scrapeData.push(data);

    await browser.close();
    
    return scrapeData;
    //await page.screenshot({ path: 'amazon1.jpg'});

};

const main = async () => {
    const scrapeData = await scrape();
    return scrapeData;
}

module.exports = {main}; 
