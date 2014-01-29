(function ($) {

    $.fn.mrjsontablecolumn = function (options) {
        var thisSelector = this.selector;
        var opt = $.extend({}, $.fn.mrjsontablecolumn.defaults, options);
        return opt;
    };

    $.fn.mrjsontablecolumn.defaults = {
        heading: "Heading",
        data: "json_field",
        type: "string",
        sortable: true,
        starthidden: false
    }

    $.fn.mrjsontable = function (options) {

        var thisSelector = this.selector;

        var opts = $.extend({}, $.fn.mrjsontable.defaults, options);

        var $mrjsontableContainer = $("<div>", { "data-so": "A", "data-ps": opts.pageSize }).addClass("mrjt");

        var $visibleColumnsCBList = $("<div>").addClass("legend");

        var $table = $("<table>").addClass(opts.tableClass);

        var $thead = $("<thead>");
        var $theadRow = $("<tr>");

        $.each(opts.columns, function (index, item) {
            var $th = $("<th>").attr("data-i", index);

            var $cb = $("<input>", { "type": "checkbox", "id": "cb" + thisSelector + index, value: index, checked: !item.starthidden, "data-i": index }).bind("change", opts.onHiddenCBChange).appendTo($visibleColumnsCBList);
            var $cblabel = $('<label />', { 'for': 'cb' + thisSelector + index, text: item.heading }).appendTo($visibleColumnsCBList);

            if (item.starthidden)
            {
                $th.hide();
            }

            if (item.sortable) {
                $("<a>", { "class": "s-init", "href": "#", "data-i": index, "data-t": item.type }).text(item.heading).bind("click", opts.onSortClick).appendTo($th);
            } else {
                $("<span>").text(item.heading).appendTo($th);
            }

            $th.appendTo($theadRow);
        });

        $theadRow.appendTo($thead);
        $thead.appendTo($table);
        
        var pagingNeeded = false;
        $.each(opts.data, function (index, item) {
            var $tr = $("<tr>").attr("data-i", index);

            if (opts.pageSize <= index) {
                $tr.hide();
                pagingNeeded = true;
            }

            $.each(opts.columns, function (c_index, c_item) {

                var $td = $("<td>").text(item[c_item.data]).attr("data-i", c_index);

                if (c_item.starthidden) {
                    $td.hide();
                }

                $td.appendTo($tr)
            });
            $tr.appendTo($table);
        });
                
        $mrjsontableContainer.append($visibleColumnsCBList);
        $mrjsontableContainer.append($table);


        if (pagingNeeded) {
            var $pager = $("<div>").addClass("paging");
            for (var i = 0; i < Math.ceil(opts.data.length / opts.pageSize) ; i++) {
                $("<a>", { "text": "Page " + (i + 1), "href": "#", "data-i": (i + 1), "class": "p-link" }).bind("click", opts.onPageClick).appendTo($pager);
            }
            $mrjsontableContainer.append($pager).addClass("paged");
        }


        return this.append($mrjsontableContainer);
    };
    
    $.fn.mrjsontable.defaults = {
        cssClass: "table",
        columns: [],
        data: [],
        pageSize: 10,

        onHiddenCBChange: function () {
            var $thisGrid = $(this).parents(".mrjt");
            var columIndex = $(this).attr("data-i");
            
            if ($(this).is(":checked")) {
                $("td[data-i='" + columIndex + "']", $thisGrid).show();
                $("th[data-i='" + columIndex + "']", $thisGrid).show();
            } else {
                $("td[data-i='" + columIndex + "']", $thisGrid).hide();
                $("th[data-i='" + columIndex + "']", $thisGrid).hide();
            }
        },
        onPageClick: function () {
            var $thisGrid = $(this).parents(".mrjt");

            var pageSize = $thisGrid.attr("data-ps");
            var page = $(this).attr("data-i");

            $("tbody tr", $thisGrid).each(function (tr_index, tr_item) {
                $(this).hide();

                var pageStart = ((page - 1) * pageSize) + 1;
                var pageEnd = page * pageSize;

                if ((tr_index + 1) >= pageStart && (tr_index + 1) <= pageEnd) {
                    $(this).show();
                }
            });

            return false;
        },
        onSortClick: function () {
            var $thisGrid = $(this).parents(".mrjt");
            var direction = $thisGrid.attr("data-so");

            $('.s-init', $thisGrid).removeClass("s-A s-D");
            $(this).addClass("s-" + direction);

            var type = $(this).attr("data-t");
            var index = $(this).attr("data-i");

            var array = [];

            $("tbody tr", $thisGrid).each(function (tr_index, tr_item) {
                var item = $("td", tr_item).eq(index)

                var tr_id = item.parent().attr("data-i");

                var value = null;
                switch (type) {
                    case "string":
                        value = item.text();
                        break;
                    case "int":
                        value = parseInt(item.text());
                        break;

                    case "float":
                        value = parseFloat(item.text());
                        break;

                    case "datetime":
                        value = new Date(item.text());
                        break;

                    default:
                        value = item.text();
                        break;
                }

                array.push({ tr_id: tr_id, val: value });
            });

            if (direction == "A") {
                array.sort(function (a, b) {
                    if (a.val > b.val) { return 1 }
                    if (a.val < b.val) { return -1 }
                    return 0;
                });
                $thisGrid.attr("data-so", "D");
            } else {

                array.sort(function (a, b) {
                    if (a.val < b.val) { return 1 }
                    if (a.val > b.val) { return -1 }
                    return 0;
                });

                $thisGrid.attr("data-so", "A");
            }

            for (var i = 0; i < array.length; i++) {
                var td = $("tr[data-i='" + array[i].tr_id + "']", $thisGrid)

                td.detach();
                
                $("tbody", $thisGrid).append(td);
            }

            if ($thisGrid.hasClass("paged")) {
                $('.p-link', $thisGrid).eq(0).click();
            }

            return false;
        }
    };
    
}(jQuery));
