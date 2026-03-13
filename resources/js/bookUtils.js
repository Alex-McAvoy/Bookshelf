/**
 * @Description   书籍渲染函数
 * @Author        Alex_McAvoy
 * @Date          2026-03-12 21:49:08
 **/
// 书籍类
function Book(data) {
    $.extend(this, data);
}

// 深复制书籍
function cloneBook(book) {
    return $.extend(true, new Book(), book);
}

// 深复制书籍列表
function cloneBookList(bookList) {
    return $.map(bookList, function (book) { return cloneBook(book); });
}

// 对书籍排序
function sortBookList(bookList, compare) {
    var workingList = cloneBookList(bookList);
    workingList.sort(compare);
    return workingList;
}

// 按评分排序方向
function compareByRating(a, b) {
    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
}

// 按阅读年份与评分排序
function compareByReadYearAndRating(a, b) {
    var y1 = Number((a.readDate || "").split("-")[0]) || 0;
    var y2 = Number((b.readDate || "").split("-")[0]) || 0;
    if (y1 !== y2)
        return y2 - y1;
    return compareByRating(a, b);
}

// 获取月份
function getMonth(date) {
    if (!date)
        return "";
    var parts = date.split("-");
    return parts.length >= 2 ? parts[0] + "年" + Number(parts[1]) + "月" : "";
}

// 获取年份
function getYear(date) {
    if (!date)
        return "";
    var parts = date.split("-");
    return parts.length >= 1 ? parts[0] + "年" : "";
}

// 获取页数范围
function getPagesRange(pageCount) {
    if (!pageCount)
        return "未知";
    else if (pageCount < 200)
        return "200页以下";
    else if (pageCount < 500 && pageCount >= 200)
        return "200到500页";
    else if (pageCount < 1000 && pageCount >= 500)
        return "500到1000页";
    else if (pageCount >= 1000)
        return "1000页以上";
}

// 渲染页数指示条
function renderPagesIndicator(className, pages, base) {
    var percent = Math.min(((pages - base) / 1000) * 100, 100);
    return $("<div>").addClass("pagesIndicator " + className)
        .css("width", percent + "%")
        .append($("<div>").addClass("pagesText").text(pages + "页"));
}

// 渲染书架
function renderBookList(bookList, options) {
    options = options || {};
    var mediaFilter = options.mediaFilter || null;
    var showComment = options.showComment || false;
    var showRating = options.showRating || false;
    var order = options.order || null;

    // 排序
    if (order === "rating") {
        bookList = sortBookList(bookList, compareByRating);
    } else if (order === "ReadYearAndRating") {
        bookList = sortBookList(bookList, compareByReadYearAndRating);
    }

    var $list = $("<div>").addClass("bookList");
    $.each(bookList, function (_, book) {
        // 媒介过滤
        if (mediaFilter && book.media !== mediaFilter)
            return;

        // 结点
        var $book = $("<div>").addClass("book");
        var $image = $("<div>").addClass("image");
        var $detail = $("<div>").addClass("detail");
        var $info = $("<div>").addClass("info hidden");
        var $bookFooter = $("<div>").addClass("bookFooter");

        // 封面
        var basePath = "./resources/images/books/";
        var imageSrc = (book.imageURL && book.imageURL.trim() !== "")
        ? basePath + book.imageURL
        : basePath + "samplebook.png";
        $image.append($("<img>").attr("src", imageSrc));

        // 详情模式
        $detail.append($("<div>").addClass("name").text(book.name));
        $detail.append($("<div>").addClass("authorNation")
            .append($("<span>").text(book.nation))
            .append($("<span>").text(book.author)));
        $detail.append($("<div>").addClass("category").text("类别：" + (book.category ? book.category : "暂无")));
        $detail.append($("<div>").addClass("publisher").text("出版社：" + (book.publisher ? book.publisher : "暂无")));
        $detail.append($("<div>").addClass("ISBN").text("ISBN：" + (book.ISBN ? book.ISBN : "暂无")));
        if (showComment && book.comment) {
            $bookFooter.append(
                $("<div>").addClass("comment")
                    .append($("<div>").addClass("icon").text("ⓘ"))
                    .append($("<div>").addClass("content").text(book.comment))
            );
        }
        if (showRating && book.rating) {
            var stars = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
            var hollowStars = ["", "☆☆☆☆", "☆☆☆", "☆☆", "☆", ""];
            $bookFooter.append(
                $("<div>").addClass("rating")
                    .append($("<span>").addClass("star").text(stars[Number(book.rating)]))
                    .append($("<span>").addClass("hollowStar").text(hollowStars[Number(book.rating)]))
            );
        }
        if ($bookFooter.children().length > 0) {
            $detail.append($bookFooter);
        }

        // 大图/小图模式
        $info.append($("<div>").addClass("name").text("书名：" + book.name));
        $info.append($("<div>").addClass("authorNation")
            .append($("<span>").text("作者："))
            .append($("<span>").text(book.nation))
            .append($("<span>").text(book.author)));
        $info.append($("<div>").addClass("category").text("类别：" + (book.category ? book.category : "暂无")));
        $info.append($("<div>").addClass("publisher").text("出版社：" + (book.publisher ? book.publisher : "暂无")));
        $info.append($("<div>").addClass("ISBN").text("ISBN：" + (book.ISBN ? book.ISBN : "暂无")));
        if (showRating && book.rating) {
            var stars = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
            var hollowStars = ["", "☆☆☆☆", "☆☆☆", "☆☆", "☆", ""];
            $info.append($("<div>").addClass("rating")
                .append($("<span>").text("评分：")
                    .append($("<span>").addClass("star").text(stars[Number(book.rating)]))
                    .append($("<span>").addClass("hollowStar").text(hollowStars[Number(book.rating)])))
            );
        }
        if (showComment && book.comment) {
            $info.append($("<div>").addClass("rating")
                .append($("<span>").text("备注：")
                    .append($("<span>").addClass("content").text(book.comment)))
            );
        }

        $book.append($image);
        $book.append($detail);
        $book.append($info);
        $list.append($book);
    });

    return $list;
}