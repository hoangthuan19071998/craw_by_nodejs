const PDFDocument = require('pdfkit');

/**
 * Tạo file PDF từ nội dung truyện và stream thẳng vào response
 */
function streamPDFToClient(content, errorPages, res) {
    const doc = new PDFDocument({ margin: 50 });

    // Thiết lập Headers cho Express response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="noidung.pdf"');

    try {
        doc.registerFont('Roboto', './Roboto-Regular.ttf');
    } catch (error) {
        console.error("Lỗi khi tải font:", error);
        res.status(500).send("Không thể tải font chữ để tạo PDF.");
        return null;
    }

    // Pipe thẳng xuống client
    doc.pipe(res);

    for (const [index, chapter] of content.entries()) {
        if (!chapter || (!chapter.title && !chapter.subTitle) || !chapter.lines || chapter.lines.length < 1) {
            errorPages.push({ type: 'no content', chapter: index + 1 });
            continue
        }

        if (index > 0) doc.addPage();
        console.log(`Đang ghi vào pdf nội dung chương ${index + 1}/${content.length}`);

        doc.x = 100;
        doc.y = 100;

        if (chapter.title) {
            doc.font('Roboto').fontSize(25).text(chapter.title, { align: 'center' });
            doc.moveDown(0.5);
        }
        if (chapter.subTitle) {
            doc.font('Roboto').fontSize(25).text(chapter.subTitle, { align: 'center' });
            doc.moveDown(0.5);
        }

        if (chapter.lines.length < 1) {
            errorPages.push({ type: 'no content', chapter: index + 1 });
        }

        doc.moveDown();
        for (const line of chapter.lines) {
            if (line !== '-') {
                doc.font('Roboto').fontSize(15).text(line, { align: 'left' });
            } else {
                doc.font('Roboto').fontSize(15).text('-----', { align: 'center' });
            }
            doc.moveDown(0.5);
        }
    }

    doc.end();
    return errorPages; // Trả về danh sách lỗi đã được cập nhật thêm (nếu thiếu title/content)
}

module.exports = { streamPDFToClient };