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

// 将任意日期字符串规范化显示
function formatBookDate(dateStr) {
    if (!dateStr || dateStr.trim() === "") return "暂无";

    const parts = dateStr.trim().split("-");
    const year = parts[0] ? parseInt(parts[0], 10) : null;
    const month = parts[1] ? parseInt(parts[1], 10) : null;
    const day = parts[2] ? parseInt(parts[2], 10) : null;

    if (!year) return "暂无";

    let result = year + "年";
    if (month !== null) result += month + "月";
    if (day !== null) result += day + "日";

    return result;
}

// 渲染书架
function renderBookList(bookList, options) {
    options = options || {};
    var mediaFilter = options.mediaFilter || null;
    var pageFilter = options.pageFilter || null;
    var wordFilter = options.wordFilter || null;
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
            if (pageFilter === "page-lt200" && (pages >= 200 || pages == 0))
                return;
            if (pageFilter === "page-200to500" && (pages < 200 || pages > 500))
                return;
            if (pageFilter === "page-gt500" && pages <= 500)
                return;
            if (pageFilter === "page-unknown" && pages != 0)
                return;
        }
        // 字数过滤
        if (wordFilter) {
            const words = Number(book.words);
            if (wordFilter === "word-lt100" && (words >= 100 || words == 0))
                return;
            if (wordFilter === "word-100to300" && (words < 100 || words >= 300))
                return;
            if (wordFilter === "word-300to500" && (words < 300 || words > 500))
                return;
            if (wordFilter === "word-gt500" && words <= 500)
                return;
            if (wordFilter === "word-unknown" && words != 0)
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
            : basePath + "default.png";
        $image.append($("<img>").attr("src", imageSrc));

        // 详情模式
        $detail.append($("<div>").addClass("name").text("《" + book.name + "》"));
        if ((book.nation + book.author).trim() !== "") {
            $detail.append(
                $("<div>").addClass("authorNation")
                    .append($("<span>").text(book.nation + book.author))
            );
        } else {
            $detail.append(
                $("<div>").addClass("authorNation placeholder")
                    .append($("<span>").text("暂无"))
            );
        }
        $detail.append(
            $("<div>").addClass("media")
                .append($("<span>").text("媒介："))
                .append($("<span>").text(book.media ? book.media : "暂无"))
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
        if (book.media == "纸质书") {
            $detail.append(
                $("<div>").addClass("ISBN")
                    .append($("<span>").text("ISBN："))
                    .append($("<span>").text(book.ISBN ? book.ISBN : "暂无"))
            );
            $detail.append(
                $("<div>").addClass("date")
                    .append($("<span>").text("阅读时间："))
                    .append($("<span>").text(formatBookDate(book.date)))
            );
        } else {
            $detail.append(
                $("<div>").addClass("date")
                    .append($("<span>").text("阅读时间："))
                    .append($("<span>").text(formatBookDate(book.date)))
            );
            $detail.append(
                $("<div>").addClass("ISBN placeholder")
                    .append($("<span>").text("ISBN："))
                    .append($("<span>").text("暂无"))
            );
        }

        if (showComment && book.comment) {
            $bookFooter.append(
                $("<div>").addClass("comment")
                    .append($("<span>").text("备注："))
                    .append($("<span>").addClass("icon").text("ⓘ"))
                    .append($("<span>").addClass("content").text(book.comment))
            );
        }
        if (showRating && book.rating) {
            var stars = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
            var hollowStars = ["", "☆☆☆☆", "☆☆☆", "☆☆", "☆", ""];
            $bookFooter.append(
                $("<div>").addClass("rating")
                    .append($("<span>").text("评分："))
                    .append($("<span>").addClass("star").text(stars[Number(book.rating)]))
                    .append($("<span>").addClass("hollowStar").text(hollowStars[Number(book.rating)]))
            );
        }
        if (showComment || showRating) {
            $detail.append($bookFooter);
        }

        // 大图/小图模式
        $info.append(
            $("<div>").addClass("name")
                .append($("<span>").text("书名："))
                .append($("<span>").text("《" + book.name + "》"))
        );
        if ((book.nation + book.author).trim() !== "") {
            $info.append(
                $("<div>").addClass("authorNation")
                    .append($("<span>").text("作者："))
                    .append($("<span>").text(book.nation + book.author))
            );
        } else {
            $info.append(
                $("<div>").addClass("authorNation")
                    .append($("<span>").text("作者："))
                    .append($("<span>").text("暂无"))
            );
        }
        $info.append(
            $("<div>").addClass("media")
                .append($("<span>").text("媒介："))
                .append($("<span>").text(book.media ? book.media : "暂无"))
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
        if (book.media == "纸质书") {
            $info.append(
                $("<div>").addClass("ISBN")
                    .append($("<span>").text("ISBN："))
                    .append($("<span>").text(book.ISBN ? book.ISBN : "暂无"))
            );
        } else {
            $info.append(
                $("<div>").addClass("ISBN")
                    .append($("<span>").text(""))
                    .append($("<span>").text(""))
            );
        }
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


// 按年/按月分组渲染书籍列表（兼容媒介、页数、字数过滤）
function renderGroupedBookList(bookList, groupMode, options) {
    options = options || {};
    var mediaFilter = options.mediaFilter || null;
    var pageFilter = options.pageFilter || null;
    var wordFilter = options.wordFilter || null;
    var showComment = options.showComment || false;
    var showRating = options.showRating || false;
    var order = options.order || null;

    if (order === "rating") {
        bookList = sortBookList(bookList, compareByRating);
    } else if (order === "ReadYearAndRating") {
        bookList = sortBookList(bookList, compareByReadYearAndRating);
    }

    // 先按现有逻辑过滤
    var filteredList = [];
    $.each(bookList, function (_, book) {
        // 媒介过滤
        if (mediaFilter && book.media !== mediaFilter)
            return;

        // 页数过滤
        if (pageFilter) {
            const pages = Number(book.pages);
            if (pageFilter === "page-lt200" && (pages >= 200 || pages == 0))
                return;
            if (pageFilter === "page-200to500" && (pages < 200 || pages > 500))
                return;
            if (pageFilter === "page-gt500" && pages <= 500)
                return;
            if (pageFilter === "page-unknown" && pages != 0)
                return;
        }

        // 字数过滤
        if (wordFilter) {
            const words = Number(book.words);
            if (wordFilter === "word-lt100" && (words >= 100 || words == 0))
                return;
            if (wordFilter === "word-100to300" && (words < 100 || words >= 300))
                return;
            if (wordFilter === "word-300to500" && (words < 300 || words > 500))
                return;
            if (wordFilter === "word-gt500" && words <= 500)
                return;
            if (wordFilter === "word-unknown" && words != 0)
                return;
        }

        filteredList.push(book);
    });

    // 分组容器
    var $groupedList = $("<div>").addClass("groupedBookList");
    var groupedBooks = {};
    var groupKeysMap = {};

    $.each(filteredList, function (_, book) {
        var readDate = (book.date || "").trim();
        var groupKey = "未知";
        var yearNum = 0, monthNum = 0;

        if (readDate !== "") {
            const parts = readDate.split("-");
            yearNum = parseInt(parts[0], 10);
            monthNum = parts[1] ? parseInt(parts[1], 10) : 0;

            if (groupMode === "year") {
                groupKey = yearNum + "年";
            } else if (groupMode === "month") {
                groupKey = monthNum ? (yearNum + "年" + monthNum + "月") : (yearNum + "年");
            }
        }

        if (!groupedBooks[groupKey]) {
            groupedBooks[groupKey] = [];
            groupKeysMap[groupKey] = { year: yearNum, month: monthNum };
        }

        groupedBooks[groupKey].push(book);
    });

    // 分组排序：先按年降序，再按月降序，未知放最后
    var groupKeys = Object.keys(groupedBooks).sort(function (a, b) {
        if (a === "未知") return 1;
        if (b === "未知") return -1;

        const keyA = groupKeysMap[a];
        const keyB = groupKeysMap[b];

        if (keyA.year !== keyB.year) return keyB.year - keyA.year;
        return keyB.month - keyA.month;
    });

    // 渲染每个分组
    $.each(groupKeys, function (_, groupKey) {
        var booksInGroup = groupedBooks[groupKey];

        var $groupSection = $("<div>").addClass("bookGroupSection");

        var $groupTitle = $("<h2>").addClass("bookGroupTitle")
            .append($("<span>").text(groupKey))
            .append($("<span>").addClass("count").text(booksInGroup.length));

        var $groupContent = $("<div>").addClass("bookGroupContent");
        $groupContent.append(
            renderBookList(booksInGroup, {
                showComment: showComment,
                showRating: showRating,
                order: null
            })
        );

        $groupSection.append($groupTitle);
        $groupSection.append($groupContent);
        $groupedList.append($groupSection);
    });

    return $groupedList;
}