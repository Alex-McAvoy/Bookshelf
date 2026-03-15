/**
 * @Description   按钮渲染与点击处理
 * @Author        Alex_McAvoy
 * @Date          2026-03-12 22:23:02
 **/


// 修改 setBookInfoOption
var currentBookInfoOption = "detail";
function setBookInfoOption(optionValue) {
    currentBookInfoOption = optionValue;

    const bookContainers = ["readingBookList", "readBookList", "boughtBookList", "purchaseBookList"];
    
    bookContainers.forEach(id => {
        const $container = $("#" + id);

        $container.removeClass(function (index, className) {
            return (className.match(/bookInfo-\S+/g) || []).join(" ");
        });
        $container.addClass("bookInfo-" + optionValue);

        $container.find(".book").each(function () {
            const $book = $(this);
            const $detail = $book.find(".detail");
            const $info = $book.find(".info");

            if (optionValue === "detail") {
                $detail.removeClass("hidden");
                $info.addClass("hidden");
            } else {
                $detail.addClass("hidden");
                $info.removeClass("hidden");
            }
        });
    });
}

// 重置当前分组内的过滤器
function setOptionActive(element) {
    var $currentOption = $(element);
    var $optionGroup = $currentOption.closest(".optionGroup");

    if ($optionGroup.length > 0) {
        $optionGroup.find(".option").removeClass("active");
    } else {
        $currentOption.closest(".options").find(".option").removeClass("active");
    }

    $currentOption.addClass("active");
}

// 获取某个分组当前激活按钮 id
function getActiveOptionId(selector) {
    return $(selector).find(".option.active").attr("id");
}

// 根据媒介按钮 id 获取媒介过滤值
function getMediaFilterValue() {
    var activeId = getActiveOptionId("#readMediaOptions .mediaFilterGroup");

    if (activeId === "media-pBook") {
        return "纸质书";
    }
    if (activeId === "media-eBook") {
        return "电子书";
    }

    return null;
}

// 根据页数按钮 id 获取页数过滤值
function getPageFilterValue() {
    var activeId = getActiveOptionId("#readPageOptions");

    if (!activeId || activeId === "page-all") {
        return "page-all";
    }

    return activeId;
}

// 根据字数按钮 id 获取字数过滤值
function getWordFilterValue() {
    var activeId = getActiveOptionId("#readWordOptions");

    if (!activeId || activeId === "word-all") {
        return "word-all";
    }

    return activeId;
}

// 根据分组按钮 id 获取分组模式
function getGroupModeValue() {
    var activeId = getActiveOptionId("#readMediaOptions .groupModeGroup");

    if (activeId === "group-year") {
        return "year";
    }
    if (activeId === "group-month") {
        return "month";
    }

    return "none";
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

// 重置分组模式过滤器
function resetGroupMode() {
    $("#readMediaOptions .groupModeGroup .option").removeClass("active");
    $("#group-none").addClass("active");
}

// 点击左侧媒介过滤器
function onMediaFilterClick(element) {
    setOptionActive(element);
    resetGroupMode();

    var mediaFilter = getMediaFilterValue();

    if (mediaFilter === "纸质书") {
        resetPageFilter();
    } else if (mediaFilter === "电子书") {
        resetWordFilter();
    }

    refreshBookList();
}

// 点击页数过滤器
function onPageFilterClick(element) {
    setOptionActive(element);
    resetGroupMode();
    refreshBookList();
}

// 点击字数过滤器
function onWordFilterClick(element) {
    setOptionActive(element);
    resetGroupMode();
    refreshBookList();
}

// 点击分组模式过滤器
function onGroupModeClick(element) {
    setOptionActive(element);
    refreshBookList();
}

// 刷新读过的书籍列表
function refreshBookList() {
    var mediaFilter = getMediaFilterValue();
    var pageFilter = null;
    var wordFilter = null;
    var groupMode = getGroupModeValue();

    if (mediaFilter === "纸质书") {
        $("#readWordOptions").hide();
        $("#readSubOptions").show();
        $("#readPageOptions").show();

        wordFilter = null;
        pageFilter = getPageFilterValue();
    }
    else if (mediaFilter === "电子书") {
        $("#readPageOptions").hide();
        $("#readSubOptions").show();
        $("#readWordOptions").show();

        pageFilter = null;
        wordFilter = getWordFilterValue();
    }
    else {
        $("#readSubOptions").hide();
        $("#readPageOptions").hide();
        $("#readWordOptions").hide();

        pageFilter = null;
        wordFilter = null;
    }

    // 不分组
    if (groupMode == "none") {
        $("#readBookList").empty();
        $("#readBookList").append(renderBookList(window.BOOK_COLLECTIONS.readingHistory, {
            mediaFilter: mediaFilter,
            pageFilter: pageFilter,
            wordFilter: wordFilter,
            showComment: true,
            showRating: true
        }));
    }
    // 按年分组
    else if (groupMode == "year") {
        $("#readBookList").empty();
        $("#readBookList").append(renderGroupedBookList(window.BOOK_COLLECTIONS.readingHistory, "year", {
            mediaFilter: mediaFilter,
            pageFilter: pageFilter,
            wordFilter: wordFilter,
            showComment: true,
            showRating: true
        }));
    }
    // 按月分组
    else if (groupMode == "month") {
        $("#readBookList").empty();
        $("#readBookList").append(renderGroupedBookList(window.BOOK_COLLECTIONS.readingHistory, "month", {
            mediaFilter: mediaFilter,
            pageFilter: pageFilter,
            wordFilter: wordFilter,
            showComment: true,
            showRating: true
        }));
    }

    // 重新同步当前模式
    setBookInfoOption(currentBookInfoOption);
}