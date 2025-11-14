// Import thư viện puppeteer
const puppeteer = require('puppeteer');
const url = 'https://giatochotran.wordpress.com/2022/05/20/cmdcpl-chuong-64-2/';
// (Tất cả code của Puppeteer phải nằm trong một hàm async)
async function layTieuDeTrang(url) {
    try {
        // 1. Khởi chạy trình duyệt
        // headless: true (mặc định) -> chạy ẩn
        // headless: false -> mở trình duyệt lên cho bạn xem
        const browser = await puppeteer.launch({ headless: true });

        // 2. Mở một trang mới
        const page = await browser.newPage();

        // 3. Đi đến trang đăng nhập (thay URL của bạn vào)
        await page.goto(url);

        // 4. Điền password vào input có tên 'password'
        // Chúng ta dùng selector CSS: 'input[name="password"]'
        await page.type('input[name="post_password"]', 'adudu');
        await page.locator('input[type="submit"][name="Submit" ]').click();
        // (Có thể bạn cũng cần điền username)
        // await page.type('input[name="username"]', 'TEN_DANG_NHAP');

        // 5. Click nút submit và ĐỢI trang mới load xong
        // Thay 'button[type="submit"]' bằng selector của nút đăng nhập
        await page.waitForNavigation()

        // ---- BÂY GIỜ BẠN ĐANG Ở TRANG MỚI ----

        // 6. Lấy text của phần tử H1 trên trang mới
        // page.$eval() tìm phần tử đầu tiên khớp với 'h1' và chạy hàm callback
        const content = await page.$eval('div[class="entry-content"] p', (element) => element.textContent);

        console.log('Tiêu đề H1 trên trang mới là:', content);

        // 7. Đóng trình duyệt
        await browser.close();

    } catch (error) {
        console.error('Đã xảy ra lỗi:', error);
    }
}

// Chạy hàm
layTieuDeTrang(url);