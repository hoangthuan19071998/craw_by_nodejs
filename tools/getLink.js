const cheerio = require('cheerio');
// Sử dụng puppeteer-extra và plugin tàng hình để tránh bị chặn 403
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function scrapePages(BASE_URL, SELECTOR, END_PAGE) {
    let allLinks = [];
    let browser;

    try {
        console.log('🚀 Đang khởi động trình duyệt ẩn...');
        // Khởi chạy trình duyệt thật (nhưng ẩn giao diện)
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Vòng lặp các trang
        const totalPages = END_PAGE > 0 ? END_PAGE : 1;

        for (let i = 1; i <= totalPages; i++) {
            const url = END_PAGE > 1 ? `${BASE_URL}${i}/#list-chapter` : BASE_URL;
            console.log(`Đang xử lý: ${url}`);

            try {
                // Dùng trình duyệt thật để truy cập link
                await page.goto(url, {
                    waitUntil: 'domcontentloaded', // Đợi HTML load xong
                    timeout: 30000
                });

                // Lấy toàn bộ mã HTML sau khi trang đã render
                const html = await page.content();

                // Lại đưa HTML cho Cheerio xử lý y hệt như code cũ của bạn
                const $ = cheerio.load(html);
                const matchingElements = $(SELECTOR);

                if (matchingElements.length > 0) {
                    console.log(`  -> Tìm thấy ${matchingElements.length} link.`);
                    matchingElements.each((index, element) => {
                        const href = $(element).attr('href');
                        if (href) {
                            allLinks.push(href);
                        }
                    });
                } else {
                    console.log(`  -> Không tìm thấy phần tử nào khớp với selector.`);
                }

                // Lịch sự nghỉ 1 giây giữa các lần chuyển trang
                // await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (err) {
                console.error(`[LỖI] Không thể tải ${url}: ${err.message}`);
            }

            if (END_PAGE <= 1) break; // Thoát nếu chỉ quét 1 trang
        }

    } catch (error) {
        console.error('Lỗi nghiêm trọng khi chạy trình duyệt:', error);
    } finally {
        // Luôn nhớ đóng trình duyệt để không bị tràn RAM
        if (browser) {
            await browser.close();
        }
    }

    console.log('-----------------------------------');
    console.log('🎉 Đã hoàn thành!');
    console.log(`Tổng số link tìm thấy: ${allLinks.length}`);
    return allLinks;
}

module.exports = {
    scrapePages
};