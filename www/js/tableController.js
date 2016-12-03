/** 定数 */
var TCAttr = {
    PREFIX: {
        CLASS:"TC_"
    },
	BUTTON: {
		ADD:"ADD",
		EDIT:"EDIT",
		DEL:"DEL",
		// ↓ページング
		TOP:"TOP",
		BACK:"BACK",
		PAGE:"PAGE",
		NEXT:"NEXT",
		LAST:"LAST"
	}
};

var TableController = function(mapList, settingInfo) {
    TC_PRI = {};
    TC_PUB = this;

    TC_PRI.mapList = {};
    TC_PRI.currentPage = 0;
    TC_PRI.maxPage = 0;
    TC_PRI.buttonMap = {};
    TC_PRI.settingInfo;

    TC_PUB.createButton = function() {
        // 追加ボタンを追加
    	var maxKey = TC_PUB.getMaxPrimaryKey();
        var addButtonId = COMMON.Event.ADD_BUTTON_ID_PREFIX + (maxKey + 1);
        var addButton = COMMON.TagUtil.Create.newButton(addButtonId, "追加", function(){
            var id = $(this).attr('id');
            id = id.replace(COMMON.Event.ADD_BUTTON_ID_PREFIX, "");
        	var buttonFuncMap = TC_PRI.settingInfo.buttonFuncMap;
            buttonFuncMap[TCAttr.BUTTON.ADD](id);
        });
        TC_PRI.buttonMap[TCAttr.BUTTON.ADD] = addButton;
        // 前へボタンを追加
        var topButton = COMMON.TagUtil.Create.newButton("topButton", "<<", function() {
        	TC_PUB.createDataTable(0);
        });
        TC_PRI.buttonMap[TCAttr.BUTTON.TOP] = topButton;
        var backButton = COMMON.TagUtil.Create.newButton("backButton", "<", function(){
        	TC_PRI.currentPage = TC_PRI.currentPage - 1;
        	TC_PUB.createDataTable(TC_PRI.currentPage);
        });
        TC_PRI.buttonMap[TCAttr.BUTTON.BACK] = backButton;
        // ページボタンを追加
        var pageButton = COMMON.TagUtil.Create.newButton("pageButton", "", function() {
        	// 必要に応じて
        });
        TC_PRI.buttonMap[TCAttr.BUTTON.PAGE] = pageButton;
        // 次へボタンを追加
        var nextButton = COMMON.TagUtil.Create.newButton("nextButton", ">", function() {
        	TC_PRI.currentPage = TC_PRI.currentPage + 1;
        	TC_PUB.createDataTable(TC_PRI.currentPage);
        });
        TC_PRI.buttonMap[TCAttr.BUTTON.NEXT] = nextButton;
        var lastButton = COMMON.TagUtil.Create.newButton("lastButton", ">>", function() {
        	TC_PUB.createDataTable(TC_PRI.maxPage - 1);
        });
        TC_PRI.buttonMap[TCAttr.BUTTON.LAST] = lastButton;
    };

    TC_PUB.createDataTable = function(pageNum) {
    	var buttonFuncMap = TC_PRI.settingInfo.buttonFuncMap;
    	var primaryKey = TC_PRI.settingInfo.key;
    	var columnInfoList = TC_PRI.settingInfo.columnInfoList;
    	var dataTableId = TCAttr.PREFIX.CLASS + "base";
    	// 前のテーブルを削除する
    	var oldTableObj = $("#" + dataTableId);
    	oldTableObj.remove();
    	// テーブルを新規作成
    	var dataTableObj = $("<table>");
    	dataTableObj.attr("id", dataTableId);
    	dataTableObj.attr("border", "solid 10px #FFFFFF");
    	dataTableObj.attr("data-role", "table");
    	dataTableObj.attr("data-mode", "columntoggle");
    	dataTableObj.addClass("ui-responsive");
    	dataTableObj.addClass("table-stripe");
        // タイトルTRを作成
        var theadObj = $("<thead>");
        var titleTrObj = $("<tr>");
        titleTrObj.attr("id", "dataTitleTr");
        for(var i in columnInfoList) {
            var thObj = $("<th>");
            var titleTd = COMMON.TagUtil.addSpanTd(thObj, columnInfoList[i].title, "");
            titleTd.attr("text-align", "center");
            titleTrObj.append(thObj);
        }
        theadObj.append(titleTrObj);
        dataTableObj.append(theadObj);

        /* ここからページ関連 */
        TC_PRI.currentPage = pageNum;
        var listLength = Object.keys(TC_PRI.mapList).length;
    	var maxLength = TC_PRI.settingInfo.max;
    	if(!maxLength) {
    		maxLength = listLength;
    	}
    	var start = TC_PRI.currentPage * maxLength;
    	var end = start + maxLength;
    	if(end > listLength) {
    		end = listLength;
    	}
        var tbodyObj = $("<tbody>");
    	for (var i = start; i < end; i++) {
            var dataMap = TC_PRI.mapList[i];
            var id = dataMap[primaryKey];
            var trObj = $("<tr>");
            trObj.attr("id", TCAttr.PREFIX.CLASS + "tr_" + id);
            for(var j in columnInfoList) {
            	var key = columnInfoList[j].bindKey;
            	var value = dataMap[key];
                COMMON.TagUtil.addSpanTd(trObj, value, TCAttr.PREFIX.CLASS + key + "_" + id);
            }

            // 編集ボタンを追加
            var editButtonId = COMMON.Event.EDIT_BUTTON_ID_PREFIX + id;
            var editButton = COMMON.TagUtil.Create.newButton(editButtonId, "編集", function(){
                var id = $(this).attr('id');
                id = id.replace(COMMON.Event.EDIT_BUTTON_ID_PREFIX, "");
                buttonFuncMap[TCAttr.BUTTON.EDIT](id);
            });
            COMMON.TagUtil.appendChildAtTr(trObj, editButton);
            // 削除ボタンを追加
            var deleteButtonId = COMMON.Event.DELETE_BUTTON_ID_PREFIX + id;
            var deleteButton = COMMON.TagUtil.Create.newButton(deleteButtonId, "削除", function(){
                var id = $(this).attr('id');
                id = id.replace(COMMON.Event.DELETE_BUTTON_ID_PREFIX, "");

                if (confirm(id + "を削除してよろしいですか？")) {
                    buttonFuncMap[TCAttr.BUTTON.DEL](id);
                }
            });
            COMMON.TagUtil.appendChildAtTr(trObj, deleteButton);
            var theadObj = $("<thead>");
            tbodyObj.append(trObj);
        }
        dataTableObj.append(tbodyObj);
    	var parentObj = TC_PRI.settingInfo.parent;
    	parentObj.append(dataTableObj);
    	// ボタン情報更新
    	TC_PRI.modifyButton();
    };

    TC_PRI.modifyButton = function() {
    	// ページボタンの文字を変更
        var pageButton = TC_PRI.buttonMap[TCAttr.BUTTON.PAGE];
        pageButton.text((TC_PRI.currentPage + 1) + "/" + TC_PRI.maxPage);
        // 移動ボタンの有効性の設定
        var backAble = null;
        if(TC_PRI.currentPage === 0) {
        	backAble = "disabled";
        }
        TC_PRI.buttonMap[TCAttr.BUTTON.TOP].attr("disabled", backAble);
        TC_PRI.buttonMap[TCAttr.BUTTON.BACK].attr("disabled", backAble);
        var nextAble = null;
        if(TC_PRI.currentPage >= (TC_PRI.maxPage - 1)) {
        	nextAble = "disabled";
        }
        TC_PRI.buttonMap[TCAttr.BUTTON.NEXT].attr("disabled", nextAble);
        TC_PRI.buttonMap[TCAttr.BUTTON.LAST].attr("disabled", nextAble);
    };

    TC_PUB.getButtonByKey = function(key) {
    	return TC_PRI.buttonMap[key];
    };

    TC_PUB.getMaxPrimaryKey = function() {
    	var primaryKey = TC_PRI.settingInfo.key;
        var max = 0;
    	for (var i in TC_PRI.mapList) {
            var dataMap = TC_PRI.mapList[i];
            var key = dataMap[primaryKey];
            if(max < Number(key)) {
                max = Number(key);
            }
    	}
    	return max;
    };

    TC_PRI.getMaxPage = function() {
        var listLength = Object.keys(TC_PRI.mapList).length;
    	var maxLength = TC_PRI.settingInfo.max;
    	var maxPage = Math.ceil(listLength / maxLength);
    	return maxPage;
    };

    new function() {
        TC_PRI.mapList = mapList;
        TC_PRI.settingInfo = settingInfo;
        TC_PRI.maxPage = TC_PRI.getMaxPage();
        // ボタン作成
        TC_PUB.createButton();
    };
};


/**
 * テーブル設定情報
 * parent 親OBJ
 * max 最大表示数
 * key 主キー
 * columnInfoList テーブルカラム設定情報一覧
 * buttonFuncMap ボタン処理マップ
*/
function TableSettingInfo(parent, max, key) {
    this.parent = parent;
    this.max = max;
    this.key = key;
    this.columnInfoList = [];
    this.buttonFuncMap = {};
};

/**
 * テーブルカラム設定情報
 * title タイトル
 * bindKey バインドキー
*/
function ColumnSettingInfo(title, bindKey) {
    this.title = title;
    this.bindKey = bindKey;
};