const fs = require('node:fs');

/**
 * Ghi danh sách trang lỗi ra file text
 */
function logErrorsToFile(errorPages, fileName = 'error.text') {
    if (errorPages && errorPages.length > 0) {
        console.log("Danh sách lỗi:", errorPages);
        fs.writeFile(fileName, JSON.stringify(errorPages, null, 2), err => {
            if (err) {
                console.error("Lỗi khi ghi file log:", err);
            } else {
                console.log('----Có lỗi trong quá trình lấy truyện! Đã ghi log.------');
            }
        });
    } else {
        console.log('--------Không phát hiện lỗi nào---------');
    }
}

module.exports = { logErrorsToFile };