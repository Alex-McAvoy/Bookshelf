/**
 * @Description   书籍数量统计
 * @Author        Alex_McAvoy
 * @Date          2026-03-14 21:24:37
 **/
// 书籍数量
function getBookCount(bookList, key, value) {
    let count = 0;
    for (let book of bookList) {
        if (book[key] == value) {
            count++;
        }
    }
    return count;
}

// 页数书籍数量统计
function getPageCount(bookList, pageFilter) {
    let count = 0;
    for (let book of bookList) {
        if (book.media == "电子书")
            continue;

        const pages = Number(book.pages);
        switch (pageFilter) {
            case "all":
                count++;
                break;
            case "page-lt200":
                if (pages != 0 && pages < 200)
                    count++;
                break;
            case "page-200to500":
                if (pages >= 200 && pages <= 500)
                    count++;
                break;
            case "page-gt500":
                if (pages > 500)
                    count++;
                break;
            case "page-unknown":
                if (pages == 0)
                    count++;
                break;
        }
    }
    return count;
}