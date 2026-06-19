const express = require('express');
const app = express();

// Import các utils
const { fetchAllChapters } = require('./tools/scraper');
const { streamPDFToClient } = require('./tools/pdf');
const { logErrorsToFile } = require('./tools/logger');

// Cấu hình Express
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Ứng dụng chạy trên cổng ${PORT}`);
});

app.get('/', (req, res) => {
    res.render('index');
});

// ==========================================
// CẤU HÌNH LẤY TRUYỆN (Dễ dàng thay đổi ở đây)
// ==========================================
const SCRAPE_CONFIG = {
    baseUrl: 'https://hiroshimi.wordpress.com/than-moc-nao-bat-tan/',
    pagesToScrape: 1,
    linkSelector: 'div#content-left a',
    contentSelector: 'div.entry-content > p'
};

app.get('/getContent', async (req, res) => {
    try {
        // 1. Scraping: Lấy danh sách link và nội dung truyện
        const { content, errorPages: initialErrors } = await fetchAllChapters(
            SCRAPE_CONFIG.baseUrl,
            SCRAPE_CONFIG.pagesToScrape,
            SCRAPE_CONFIG.linkSelector,
            SCRAPE_CONFIG.contentSelector
        );

        // 2. Export PDF: Stream trực tiếp dữ liệu xuống response
        const finalErrorPages = streamPDFToClient(content, initialErrors, res);

        // 3. Logging: Xử lý ghi nhận lỗi (nếu PDF Stream thành công)
        if (finalErrorPages) {
            logErrorsToFile(finalErrorPages, 'error.text');
        }

    } catch (error) {
        console.error("Lỗi nghiêm trọng tại route /getContent:", error);
        if (res.headersSent) {
            // Chỉ kết thúc response thôi, không send text nữa để tránh lỗi ghi đè
            res.end();
        } else {
            // Nếu chưa pipe dữ liệu, gửi lỗi 500 bình thường
            res.status(500).send("Đã xảy ra lỗi trên Server.");
        }
    }
});