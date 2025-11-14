const axios = require('axios');
const cheerio = require('cheerio');



const getTextContent = async (url, SELECTOR) => {

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

    const textArray = {
        title: '',
        lines: []
    }
    const html = await fetchHtml(url);
    if (!html) {
        return
    }

    // Load HTML vào Cheerio
    const $ = cheerio.load(html);

    //Thêm  tiêu đề 
    const title = $('h2.current-chapter').text().trim();
    textArray.title = title

    // Tìm các phần tử phù hợp
    const matchingElements = $(SELECTOR);
    for (const ele of matchingElements.toArray()) {
        const text = $(ele).text().trim();
        if (text.startsWith('Editor:') && text.includes('Beta:')) {
            continue;
        }
        textArray.lines.push(text);
    }
    return textArray
}

module.exports = {
    getTextContent
};