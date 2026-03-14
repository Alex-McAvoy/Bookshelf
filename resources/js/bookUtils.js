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

// 渲染书架
function renderBookList(bookList, options) {
    options = options || {};
    var mediaFilter = options.mediaFilter || null;
    var pageFilter = options.pageFilter || null;
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

        // 页数过滤
        if (pageFilter) {
            const pages = Number(book.pages);
            if (pageFilter === "page-unknown" && pages != 0)
                return;
            if (pageFilter === "page-lt200" && (pages >= 200 || pages == 0 ))
                return;
            if (pageFilter === "page-200to500" && (pages < 200 || pages > 500))
                return;
            if (pageFilter === "page-gt500" && pages <= 500)
                return;
        }

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
        $detail.append($("<div>").addClass("name").text("《" + book.name + "》"));
        $detail.append(
            $("<div>").addClass("authorNation")
                .append($("<span>").text(book.nation + book.author))
        );
        $detail.append(
            $("<div>").addClass("category")
                .append($("<span>").text("类别："))
                .append($("<span>").text(book.category ? book.category : "暂无"))
        );
        $detail.append(
            $("<div>").addClass("publisher")
                .append($("<span>").text("出版社："))
                .append($("<span>").text(book.publisher ? book.publisher : "暂无"))
        );
        $detail.append(
            $("<div>").addClass("ISBN")
                .append($("<span>").text("ISBN："))
                .append($("<span>").text(book.ISBN ? book.ISBN : "暂无"))
        );
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
        $info.append(
            $("<div>").addClass("name")
                .append($("<span>").text("书名："))
                .append($("<span>").text("《" + book.name + "》"))
        );
        $info.append(
            $("<div>").addClass("authorNation")
                .append($("<span>").text("作者："))
                .append($("<span>").text(book.nation + book.author))
        );
        $info.append(
            $("<div>").addClass("category")
                .append($("<span>").text("类别："))
                .append($("<span>").text(book.category ? book.category : "暂无"))
        );
        $info.append(
            $("<div>").addClass("publisher")
                .append($("<span>").text("出版社："))
                .append($("<span>").text(book.publisher ? book.publisher : "暂无"))
        );
        $info.append(
            $("<div>").addClass("ISBN")
                .append($("<span>").text("ISBN："))
                .append($("<span>").text(book.ISBN ? book.ISBN : "暂无"))
        );
        if (showRating && book.rating) {
            var stars = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
            var hollowStars = ["", "☆☆☆☆", "☆☆☆", "☆☆", "☆", ""];
            $info.append(
                $("<div>").addClass("rating")
                    .append($("<span>").text("评分："))
                    .append($("<span>").text(stars[Number(book.rating)] + hollowStars[Number(book.rating)]))
            );

        }
        if (showComment && book.comment) {
            $info.append(
                $("<div>").addClass("rating")
                    .append($("<span>").text("备注："))
                    .append($("<span>").text(book.comment))
            );
        }

        $book.append($image);
        $book.append($detail);
        $book.append($info);
        $list.append($book);
    });

    return $list;
}
