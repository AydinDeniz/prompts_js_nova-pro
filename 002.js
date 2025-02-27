const puppeteer = require('puppeteer');

async function scrapeData(urls, selector) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let data = [];

    for (const url of urls) {
        await page.goto(url);
        await page.waitForSelector(selector);

        const scrapedData = await page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => el.textContent);
        }, selector);

        data.push({
            url: url,
            data: scrapedData
        });
    }

    await browser.close();
    return data;
}

// Example usage:
const urls = ['https://example.com/page1', 'https://example.com/page2'];
const selector = '.some-class';

scrapeData(urls, selector).then(data => {
    console.log(data);
});