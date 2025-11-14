const express = require('express');
const app = express();
const { scrapePages } = require('./tools/getLink');
const { getTextContent } = require('./tools/getContent');

// const fs = require('fs');
const PDFDocument = require('pdfkit');
// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Thư mục chứa các tệp .ejs

// Phân tích dữ liệu JSON
app.use(express.json());

// Phân tích dữ liệu URL-encoded (cho biểu mẫu)
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.listen(port, () => {
    console.log(`Ứng dụng chạy trên cổng ${port}`);
});

app.get('/', (req, res) => {
    // Truyền dữ liệu 'name' vào view index.ejs
    res.render('index');
});



app.get('/getContent', async (req, res) => {
    const url1 = 'https://wikidich.com.vn/thi-the-noi-mo-duong-to'
    const url2 = 'http://127.0.0.1:5500/test.html'
    const linkSelector = 'div.clearfix ul a'
    const contentSelector = 'div.vung-doc p'
    const allLink = []
    let content = []
    const getLink1 = await scrapePages(url1, linkSelector, 1)
    await allLink.push(...getLink1)
    const getLink2 = await scrapePages(url2, linkSelector, 1)
    await allLink.push(...getLink2)
    const newLink = await allLink.filter(item => item.includes('chuong-')).map(item => 'https://wikidich.com.vn' + item)
    for (const [index, link] of newLink.entries()) {
        console.log(`Đang lấy nội dung chương ${index + 1}...`);
        const chapter = await getTextContent(link, contentSelector)
        content.push(chapter)
    }


    const doc = await new PDFDocument({ margin: 50 });

    // Thiết lập Headers cho response để trình duyệt hiểu đây là file PDF
    // 'attachment' sẽ buộc trình duyệt bật hộp thoại "Save As..."
    // 'inline' sẽ cố gắng hiển thị PDF ngay trên trình duyệt (nếu hỗ trợ)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="noidung.pdf"');
    try {
        await doc.registerFont('Roboto', './Roboto-Regular.ttf');
    } catch (error) {
        console.error("Lỗi khi tải font:", error);
        return res.status(500).send("Không thể tải font chữ để tạo PDF.");
    }
    // Pipe (truyền) nội dung PDF trực tiếp vào response (res)
    // Cách này rất hiệu quả vì không cần lưu file tạm trên server
    await doc.pipe(res);

    for (const [index, chapter] of content.entries()) {
        if (index > 0) doc.addPage();
        console.log(`Đang ghi vào pdf nội dung chương ${index + 1}...`);
        await doc.font('Roboto').fontSize(25).text(chapter.title, { align: 'center' });
        doc.moveDown();
        for (const line of chapter.lines) {
            await doc.font('Roboto').fontSize(15).text(line, { align: 'left' });
            await doc.moveDown(0.5);
        }
    }
    doc.end()
})
