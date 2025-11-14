const fs = require('fs');
const PDFDocument = require('pdfkit');
// Create a new PDF document instance


const writeFile = (content) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('generated-output.pdf'));
    doc.fontSize(25).text(content.title, 100, 100, { align: 'left' });
    for (const line of content.lines) {
        doc.text(line, { align: 'left' });
    }
    doc.end();

    return doc
}
module.exports = {
    writeFile
};
