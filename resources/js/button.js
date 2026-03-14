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

        if (optionValue === "detail") {
            $el.find(".detail").removeClass("hidden");
            $el.find(".info").addClass("hidden");
        } else {
            $el.find(".detail").addClass("hidden");
            $el.find(".info").removeClass("hidden");
        }
    });
}

// 重置媒介过滤器
function setOptionActive(element) {
    var $currentOption = $(element);
    var $optionsContainer = $currentOption.closest(".options");
    $optionsContainer.find(".option").removeClass("active");
    $currentOption.addClass("active");
}

// 重置页数过滤器
function resetPageFilter() {
    $("#readPageOptions .option").removeClass("active");
    $("#page-all").addClass("active");
}
// 重置字数过滤器
function resetWordFilter() {
    $("#readWordOptions .option").removeClass("active");
    $("#word-all").addClass("active");
}

// 刷新读过的书籍列表
function refreshBookList(options) {
    options = options || {};
    var mediaFilter = options.mediaFilter;
    var pageFilter = options.pageFilter;
    var wordFilter = options.wordFilter;

    if (mediaFilter === "纸质书") {
        $("#readWordOptions").hide();
        resetWordFilter();
        wordFilter = null;

        $("#readPageOptions").show();
        pageFilter = pageFilter || "page-all";
    } else if (mediaFilter === "电子书") {
        $("#readPageOptions").hide();
        resetPageFilter();
        pageFilter = null;

        $("#readWordOptions").show();
        wordFilter = wordFilter || "word-all";
    }
    else {
        $("#readPageOptions").hide();
        $("#readWordOptions").hide();
        resetPageFilter();
        resetWordFilter();
        pageFilter = null;
        wordFilter = null;
    }

    $("#readBookList").empty();
    $("#readBookList").append(renderBookList(window.BOOK_COLLECTIONS.readingHistory, {
        mediaFilter: mediaFilter,
        pageFilter: pageFilter,
        wordFilter: wordFilter,
        showComment: true,
        showRating: true
    }));
}
