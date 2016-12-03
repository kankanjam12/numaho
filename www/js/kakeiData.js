/**
 * 家計情報
 * id ユーザID
 * name ユーザ名
 * index 表示順
 * pointInfoMap 得点情報マップ
*/
function KakeiInfo(id, addDate, item, price, category){
    this.id = id;
    this.addDate = addDate;
    this.item = item;
    this.price = price;
    this.category = category;
    /* JSONData */
    this.getJSONData = function() {
        var JSONData = {};
        JSONData["id"] = this.id;
        JSONData["addDate"] = this.addDate;
        JSONData["item"] = this.item;
        JSONData["price"] = this.price;
        JSONData["category"] = this.category;
        return JSONData;
    };
};