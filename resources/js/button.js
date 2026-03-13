/**
 * @Description   按钮渲染与点击处理
 * @Author        Alex_McAvoy
 * @Date          2026-03-12 22:23:02
 **/

// 切换书籍显示样式
function setBookInfoOption(optionValue) {
    const bookIds = ["readingBookList", "readBookList", "boughtBookList", "purchaseBookList"];
    bookIds.forEach(id => {
        var $el = $("#" + id);
        $el.removeClass(function (index, className) {
            return (className.match(/bookInfo-\S+/g) || []).join(" ");
        });
        $el.addClass("bookInfo-" + optionValue);

        if(optionValue === "detail") {
            $el.find(".detail").removeClass("hidden");
            $el.find(".info").addClass("hidden");
        } else {
            $el.find(".detail").addClass("hidden");
            $el.find(".info").removeClass("hidden");
        }
    });
}



// 获取媒介数量
function getMediaCount(bookList, media) {
    if (!bookList) return 0;
    return bookList.filter(b => media === "all" || b.media === media).length;
}

// 获取页数范围数量
function getPagesRangeCount(bookList, pagesRange) {
    if (!bookList) return 0;
    return bookList.filter(b => pagesRange === "all" || getPagesRange(b.pages) === pagesRange).length;
}

// 渲染媒介按钮
function renderMediaOptionButton(media, bookList, bookListId) {
    var mediaCount = getMediaCount(bookList, media);
    if (mediaCount === 0 && media !== "all") return "";

    var btnHtml = "<span class='text'>" + media + "</span>";
    if (media !== "all") btnHtml += "<span class='count'>" + mediaCount + "</span>";

    return $("<div>")
        .addClass("option media-" + media)
        .html(btnHtml)
        .data("media", media)
        .on("click", function () {
            setOption(bookListId, "media", media);
            refreshBookList(bookListId);
        });
}

// 渲染页数范围按钮
function renderPagesRangeOptionButton(pagesRange, bookList, bookListId) {
    var rangeCount = getPagesRangeCount(bookList, pagesRange);
    if (rangeCount === 0 && pagesRange !== "all") return "";

    var btnHtml = "<span class='text'>" + pagesRange + "</span>";
    if (pagesRange !== "all") btnHtml += "<span class='count'>" + rangeCount + "</span>";

    return $("<div>")
        .addClass("option pagesRange-" + pagesRange)
        .html(btnHtml)
        .data("pagesRange", pagesRange)
        .on("click", function () {
            setOption(bookListId, "pagesRange", pagesRange);
            refreshBookList(bookListId);
        });
}

// 设置选项
function setOption(elementId, optionName, optionValue) {
    var $el = $("#" + elementId);
    // 移除已有的 optionName-* class
    $el.removeClass(function (index, className) {
        return (className.match(new RegExp(optionName + "-\\S+", "g")) || []).join(' ');
    });
    // 添加新的 class
    $el.addClass(optionName + "-" + optionValue);
}

// 获取选项值
function getOption(elementId, optionName) {
    var className = $("#" + elementId).attr("class") || "";
    var result = null;
    className.split(/\s+/).forEach(function (cls) {
        var parts = cls.split("-");
        if (parts.length === 2 && parts[0] === optionName) {
            result = parts[1];
        }
    });
    return result;
}

// 重新渲染书架
function refreshBookList(bookListId) {
    var $collection = $("#" + bookListId);

    var media = getOption(bookListId, "media");
    var pagesRange = getOption(bookListId, "pagesRange");
    var order = getOption(bookListId, "order") || "ReadYearAndRating";

    // 获取书籍列表
    var bookList = window.BOOK_COLLECTIONS[bookListId] || [];

    var renderedHtml = renderBookList(bookList, {
        mediaFilter: media && media !== "all" ? media : null,
        showPagesOrWords: true,
        showPublisher: true,
        showISBN: true,
        showImage: true,
        showMedia: true,
        order: order
    });

    $collection.find("> #"+bookListId+"BookList, > div.bookList, > div:last-child").first().html(renderedHtml);
}