const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const getTextContent = async (url, SELECTOR) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    // --- BẬT TÍNH NĂNG CHẶN TÀI NGUYÊN (TĂNG TỐC ĐỘ X5) ---
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        // Chặn tải hình ảnh, css, font, và media (video/audio)
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
            req.abort();
        } else {
            req.continue(); // Cho phép tải document (HTML), script (JS), fetch/xhr
        }
    });
    //-----------------------
    try {
        // Dùng trình duyệt thật để truy cập link
        await page.goto(url, {
            waitUntil: 'domcontentloaded', // Đợi HTML load xong
            timeout: 30000
        });
        await page.waitForSelector(SELECTOR, { timeout: 5000 });
        // Lấy toàn bộ mã HTML sau khi trang đã render
        const html = await page.content();

        // Lại đưa HTML cho Cheerio xử lý y hệt như code cũ của bạn
        const $ = cheerio.load(html);

        const textArray = {
            title: '',
            lines: []
        }

        const titleSelector = 'div.entry-content h3 span';

        const allTitleText = $(titleSelector).map((index, element) => {
            return $(element).text().trim();
        }).get(); // .get() chuyển kết quả của Cheerio thành mảng mảng JS thuần
        // Kết quả trả về sẽ có dạng: ['Nội dung 1', 'Nội dung 2', 'Nội dung 3']
        textArray.title = allTitleText[0]
        textArray.subTitle = allTitleText[1]

        // ----Content nằm trong 1 thẻ div to----

        // // 1. (Tùy chọn) Xóa các thẻ div chứa quảng cáo rác lẫn trong nội dung để PDF sạch hơn
        // $(SELECTOR).find('div[id^="ads-"], div.adfill').remove();

        // // 2. Chuyển đổi tất cả các thẻ <br> thành ký tự xuống dòng (\n)
        // $(SELECTOR).find('br').replaceWith('\n');

        // // 3. Lấy nội dung text thô sau khi đã giữ được các mốc xuống dòng
        // let rawText = $(SELECTOR).text();

        // // 4. Tách thành mảng dựa trên ký tự xuống dòng (\n) thay vì dấu câu
        // const sentenceArray = rawText
        //     .split('\n')
        //     .map(line => line
        //         .trim()
        //         .replace('th*m d*', 'Thẩm Du').replace('th*m d*', 'Thẩm Du')
        //         .replace('h*m m**n', 'ham muốn').replace('th*n d***', 'thân dưới')
        //         .replace('v**t v*', 'vuốt ve')
        //     )
        //     // Cắt khoảng trắng thừa ở 2 đầu mỗi đoạn
        //     .filter(line => line.length > 0 && line !== '...'); // Lọc bỏ các phần tử trống hoặc chỉ có dấu 3 chấm\

        // ----Content nằm trong nhiều thẻ selector nhỏ----

        const sentenceArray = $(SELECTOR).map((index, element) => {
            return $(element).text().trim();
        }).get();


        for (const ele of sentenceArray) {
            textArray.lines.push(ele);
        }

        return textArray

    } catch (err) {
        console.error(`[LỖI] Không thể tải ${url}: ${err.message}`);
    } finally {
        // Luôn nhớ đóng trình duyệt để không bị tràn RAM
        if (browser) {
            await browser.close();
        }
    }


}

module.exports = {
    getTextContent
};