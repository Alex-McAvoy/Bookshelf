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

    // 在第一行左右、第二行右侧
    if ($optionGroup.length > 0) {
        $optionGroup.find(".option").removeClass("active");
    } 
    // 页数按钮
    else if ($currentOption.closest("#readPageOptions").length > 0) {
        $("#page-all, #page-lt200, #page-200to500, #page-gt500, #page-unknown").removeClass("active");
    }
    // 字数按钮
    else if ($currentOption.closest("#readWordOptions").length > 0) {
        $("#word-all, #word-lt100, #word-100to300, #word-300to500, #word-gt500, #word-unknown").removeClass("active");
    }
    // 其他options
    else {
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
    $("#page-all, #page-lt200, #page-200to500, #page-gt500, #page-unknown").removeClass("active");
    $("#page-all").addClass("active");
}

// 重置字数过滤器
function resetWordFilter() {
    $("#word-all, #word-lt100, #word-100to300, #word-300to500, #word-gt500, #word-unknown").removeClass("active");
    $("#word-all").addClass("active");
}

// 重置分组模式过滤器
function resetGroupMode() {
    $("#readMediaOptions .groupModeGroup .option").removeClass("active");
    $("#group-none").addClass("active");
}

// 重置第类别分组过滤器
function resetCategoryGroupFilter() {
    $("#pageCategoryGroupOptions .option").removeClass("active");
    $("#page-category-none").addClass("active");

    $("#wordCategoryGroupOptions .option").removeClass("active");
    $("#word-category-none").addClass("active");
}

// 点击媒介过滤器
function onMediaFilterClick(element) {
    setOptionActive(element);
    resetGroupMode();
    resetCategoryGroupMode();
    hideCategoryDetailOptions();

    var mediaFilter = getMediaFilterValue();

    if (mediaFilter === "纸质书") {
        resetPageFilter();
        $("#readSubOptions").show();
        $("#readWordOptions").hide();
        $("#readPageOptions").show();
    } else if (mediaFilter === "电子书") {
        resetWordFilter();
        $("#readSubOptions").show();
        $("#readPageOptions").hide();
        $("#readWordOptions").show();
    } else {
        $("#readSubOptions").hide();
        $("#readPageOptions").hide();
        $("#readWordOptions").hide();
    }

    updateCategoryGroupOptionsVisibility();
    refreshBookList();
}

// 点击页数过滤器
function onPageFilterClick(element) {
    setOptionActive(element);
    resetGroupMode();
    resetCategoryGroupMode();
    hideCategoryDetailOptions();

    updateCategoryGroupOptionsVisibility();
    refreshBookList();
}

// 点击字数过滤器
function onWordFilterClick(element) {
    setOptionActive(element);
    resetGroupMode();
    resetCategoryGroupMode();
    hideCategoryDetailOptions();

    updateCategoryGroupOptionsVisibility();
    refreshBookList();
}

// 点击分组模式过滤器
function onGroupModeClick(element) {
    setOptionActive(element);
    resetCategoryGroupMode();
    hideCategoryDetailOptions();

    updateCategoryGroupOptionsVisibility();
    refreshBookList();
}

// 点击类别过滤器
function onCategoryFilterClick(element) {
    setOptionActive(element);

    var categoryGroupMode = getCategoryGroupModeValue();

    if (categoryGroupMode === "category") {
        renderCategoryDetailOptions();
    } else {
        hideCategoryDetailOptions();
    }

    refreshBookList();
}

// 按类别显示/隐藏
function updateCategoryGroupOptionsVisibility() {
    var groupMode = getGroupModeValue();
    var mediaFilter = getMediaFilterValue();

    if ((mediaFilter === "纸质书" || mediaFilter === "电子书") && groupMode === "none") {
        $("#pageCategoryGroupOptions").show();
        $("#wordCategoryGroupOptions").show();
    } else {
        $("#pageCategoryGroupOptions").hide();
        $("#wordCategoryGroupOptions").hide();

        hideCategoryDetailOptions();
    }
}

// 刷新读过的书籍列表
function refreshBookList() {
    var mediaFilter = getMediaFilterValue();
    var pageFilter = null;
    var wordFilter = null;
    var groupMode = getGroupModeValue();
    var categoryFilter = getCategoryDetailValue();

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
            categoryFilter: categoryFilter,
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


// 获取当前类别分组模式
function getCategoryGroupModeValue() {
    var mediaFilter = getMediaFilterValue();
    var activeId = null;

    if (mediaFilter === "纸质书") {
        activeId = $("#pageCategoryGroupOptions .option.active").attr("id");
    } else if (mediaFilter === "电子书") {
        activeId = $("#wordCategoryGroupOptions .option.active").attr("id");
    }

    if (activeId && activeId.indexOf("category-group") !== -1) {
        return "category";
    }

    return "none";
}

// 重置类别分组模式
function resetCategoryGroupMode() {
    $("#pageCategoryGroupOptions .option").removeClass("active");
    $("#wordCategoryGroupOptions .option").removeClass("active");

    $("#page-category-none").addClass("active");
    $("#word-category-none").addClass("active");
}

// 隐藏第三行具体类别过滤
function hideCategoryDetailOptions() {
    $("#readCategoryDetailOptions").hide().empty();
}

// 判断单本书是否命中页数过滤器
function matchPageFilter(book, pageFilter) {
    var pages = parseInt(book.pages, 10);

    // all
    if (!pageFilter || pageFilter === "page-all") {
        return true;
    }

    // 未知
    if (pageFilter === "page-unknown") {
        return isNaN(pages);
    }

    // 没有页数时，其它范围都不命中
    if (isNaN(pages)) {
        return false;
    }

    if (pageFilter === "page-lt200") {
        return pages < 200;
    }

    if (pageFilter === "page-200to500") {
        return pages >= 200 && pages <= 500;
    }

    if (pageFilter === "page-gt500") {
        return pages > 500;
    }

    return true;
}

// 判断单本书是否命中字数过滤器
function matchWordFilter(book, wordFilter) {
    var words = parseFloat(book.words);

    // all
    if (!wordFilter || wordFilter === "word-all") {
        return true;
    }

    // 未知
    if (wordFilter === "word-unknown") {
        return isNaN(words);
    }

    // 没有字数时，其它范围都不命中
    if (isNaN(words)) {
        return false;
    }

    if (wordFilter === "word-lt100") {
        return words < 100;
    }

    if (wordFilter === "word-100to300") {
        return words >= 100 && words < 300;
    }

    if (wordFilter === "word-300to500") {
        return words >= 300 && words <= 500;
    }

    if (wordFilter === "word-gt500") {
        return words > 500;
    }

    return true;
}

// 获取当前过滤条件下的类别统计结果（媒介 + 页数/字数）
function getCategoryStatsByCurrentFilters() {
    var mediaFilter = getMediaFilterValue();
    var pageFilter = null;
    var wordFilter = null;
    var bookList = window.BOOK_COLLECTIONS.readingHistory || [];
    var filteredBooks = [];
    var categoryMap = {};

    // 只统计纸质书 / 电子书；all 时不生成第三行
    if (mediaFilter !== "纸质书" && mediaFilter !== "电子书") {
        return [];
    }

    // 根据当前媒介，拿到对应的页数/字数过滤值
    if (mediaFilter === "纸质书") {
        pageFilter = getPageFilterValue();
    } else if (mediaFilter === "电子书") {
        wordFilter = getWordFilterValue();
    }

    // 先做组合过滤：媒介 + 页数/字数
    filteredBooks = bookList.filter(function (book) {
        // 1. 媒介过滤
        if (book.media !== mediaFilter) {
            return false;
        }

        // 2. 页数过滤（仅纸质书）
        if (mediaFilter === "纸质书") {
            return matchPageFilter(book, pageFilter);
        }

        // 3. 字数过滤（仅电子书）
        if (mediaFilter === "电子书") {
            return matchWordFilter(book, wordFilter);
        }

        return true;
    });

    // 统计类别
    filteredBooks.forEach(function (book) {
        var rawCategory = book.category ? String(book.category).trim() : "未分类";

        // 当前先按单值类别统计
        if (!categoryMap[rawCategory]) {
            categoryMap[rawCategory] = 0;
        }
        categoryMap[rawCategory]++;
    });

    // 转数组
    var result = Object.keys(categoryMap).map(function (categoryName) {
        return {
            name: categoryName,
            count: categoryMap[categoryName]
        };
    });

    // 排序：数量降序；数量相同按名称升序
    result.sort(function (a, b) {
        if (b.count !== a.count) {
            return b.count - a.count;
        }
        return a.name.localeCompare(b.name, "zh-CN");
    });

    return result;
}

// 渲染类别过滤按钮
function renderCategoryDetailOptions() {
    var $container = $("#readCategoryDetailOptions");
    // var categoryStats = getCategoryStatsByCurrentMedia();
    var categoryStats = getCategoryStatsByCurrentFilters();

    $container.empty();

    // 没有类别数据，直接隐藏
    if (!categoryStats || categoryStats.length === 0) {
        $container.hide();
        return;
    }

    // 加all
    var totalCount = categoryStats.reduce(function (sum, item) {
        return sum + item.count;
    }, 0);

    var $allOption = $("<div>")
        .addClass("option active")
        .attr("data-category", "all")
        .attr("onclick", "onCategoryDetailFilterClick(this)")
        .append($("<span>").text("all"))
        .append($("<span>").addClass("count").text(totalCount));

    $container.append($allOption);

    // 加每个类别
    categoryStats.forEach(function (item) {
        var $option = $("<div>")
            .addClass("option")
            .attr("data-category", item.name)
            .attr("onclick", "onCategoryDetailFilterClick(this)")
            .append($("<span>").text(item.name))
            .append($("<span>").addClass("count").text(item.count));

        $container.append($option);
    });

    $container.show();
}

// 点击类别过滤按钮
function onCategoryDetailFilterClick(element) {
    $(element).siblings(".option").removeClass("active");
    $(element).addClass("active");
    refreshBookList();
}

// 获取当前具体类别值
function getCategoryDetailValue() {
    var $active = $("#readCategoryDetailOptions .option.active");

    if ($active.length === 0) {
        return "all";
    }

    return $active.attr("data-category") || "all";
}