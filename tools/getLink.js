const axios = require('axios');
const cheerio = require('cheerio');

// Hàm chính để chạy quá trình cào dữ liệu
async function scrapePages(BASE_URL, SELECTOR, END_PAGE) {

    async function fetchHtml(url) {
        try {
            const { data } = await axios.get(url, {
                // Thêm User-Agent để giả lập trình duyệt, tăng khả năng thành công
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            return data;
        } catch (error) {
            // Nếu trang không tồn tại (ví dụ: lỗi 404), trả về null
            if (error.response && error.response.status === 404) {
                console.warn(`[CẢNH BÁO] Trang ${url} trả về lỗi 404. Bỏ qua.`);
                return null;
            }
            // Lỗi khác
            console.error(`[LỖI] Không thể tải ${url}: ${error.message}`);
            return null; // Bỏ qua trang này nếu có lỗi
        }
    }

    let allLinks = []; // Mảng để chứa tất cả link tìm được

    const getLinksFromPage = async (url) => {

        console.log(`Đang xử lý: ${url}`);
        const html = await fetchHtml(url);

        // Nếu fetchHtml trả về null (do lỗi hoặc 404), bỏ qua vòng lặp này
        if (!html) {
            return;
        }
        // Load HTML vào Cheerio
        const $ = cheerio.load(html);

        // Tìm các phần tử phù hợp
        const matchingElements = $(SELECTOR);

        if (matchingElements.length > 0) {
            console.log(`  -> Tìm thấy ${matchingElements.length} link ở trang ${url}.`);
            matchingElements.each((index, element) => {
                const href = $(element).attr('href');
                if (href) {
                    allLinks.push(href); // Thêm vào mảng để đếm tổng
                }
            });
        }

        // Thêm một độ trễ nhỏ (ví dụ: 200ms) để không spam server
        // (Lịch sự khi cào dữ liệu)

    }
    if (END_PAGE > 1) {
        for (let page = 1; page <= END_PAGE; page++) {
            const url = `${BASE_URL}${page}/`;
            await getLinksFromPage(url);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    } else {
        await getLinksFromPage(BASE_URL);
    }

    console.log('-----------------------------------');
    console.log('🎉 Đã hoàn thành!');
    console.log(`Tổng số link tìm thấy: ${allLinks.length}`);
    return allLinks;
}

module.exports = {
    scrapePages
};