const { scrapePages } = require('../tools/getLink');
const { getTextContent } = require('../tools/getContent');

/**
 * Lấy danh sách link và nội dung từng chương
 */
async function fetchAllChapters(baseUrl, totalPages, linkSelector, contentSelector) {
    const allLink = [];
    const content = [];
    const errorPages = [];

    // Lấy toàn bộ links
    const getLink = await scrapePages(baseUrl, linkSelector, totalPages);
    allLink.push(...getLink);

    // Cào nội dung từng link
    for (const [index, link] of allLink.entries()) {

        console.log(`Đang lấy nội dung chương ${index + 1}/${allLink.length}`);

        try {
            const chapter = await getTextContent(link, contentSelector);
            content.push(chapter);
        } catch {
            errorPages.push(link); // Lưu lại link nếu get content thất bại
        }
    }

    return { content, errorPages };
}

module.exports = { fetchAllChapters };