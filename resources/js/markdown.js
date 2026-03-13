/**
 * @Description   markdown解析相关函数
 * @Author        Alex_McAvoy
 * @Date          2026-03-10 21:22:43
 **/

// 解析书籍信息
function parseMarkdownTable(md) {
    // 按行分割
    let lines = md.split("\n").map(v => v.trim());
    // 删除完全空行
    lines = lines.filter(v => v.length > 0);

    // 表头
    let headers = lines[0].split("|").slice(1, -1).map(v => v.trim());

    // 从第三行开始解析数据
    let books = [];
    for (let i = 2; i < lines.length; i++) {
        // 解析列
        let cols = lines[i].split("|").slice(1, -1).map(v => v.trim());

        // 整行为空
        if (cols.every(v => v === ""))
            continue;

        // json对象
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = cols[j] ?? "";
        }
        books.push(obj);
    }

    let result = {
        // 读过
        "read": [],
        // 在读
        "reading": [],
        // 已购买
        "bought": [],
        // 计划购买
        "purchase": []
    }
    let stateMap = {
        "读过": "read",
        "在读": "reading",
        "已购买": "bought",
        "计划购买": "purchase"
    };
    // 按state分类
    books.forEach(book => {
        let stateCN = book.state;
        let stateEN = stateMap[stateCN];

        if (stateEN && result[stateEN]) {
            result[stateEN].push(book);
        }
    });
    return result;
}