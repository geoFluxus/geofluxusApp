var utils = require('utils/utils');
var enrichFlows = require('utils/enrichFlows');

module.exports = {

    /**
     * Fill selectPicker with filtered items, add to DOM, and refresh:
     * @param {*} filterName 
     * @param {*} selectPicker 
     * @param {*} objectArray 
     */
    fillSelectPicker: function (filterName, selectPicker, objectArray) {
        let itemsHtml = "<option selected value='-1'>All (" + objectArray.length + ")</option><option data-divider='true'></option>";

        if (["activityGroup", "activity", "treatmentMethodGroup", "treatmentMethod"].includes(filterName)) {
            objectArray.forEach(function (item) {
                itemsHtml += "<option class='dropdown-item' value='" + item.attributes.id + "'>" + enrichFlows.returnCodePlusName(item) + "</option>";
            });
        } else if (filterName == "months") {
            objectArray.forEach(month => itemsHtml += "<option class='dropdown-item' value='" + month.attributes.id + "'>" + month.attributes.code.substring(2, 6) + " " + utils.toMonthString(month.attributes.code.substring(0, 2)) + "</option>");
        } else if (filterName == "wastes04") {
            objectArray.forEach(waste04 => itemsHtml += "<option class='dropdown-item' value='" + waste04.attributes.id + "'>" + waste04.attributes.ewc_code + " " + waste04.attributes.ewc_name + "</option>");
        } else if (filterName == "wastes06") {
            objectArray.forEach(waste06 => itemsHtml += "<option class='dropdown-item' value='" + waste06.attributes.id + "'>" + waste06.attributes.ewc_code + " " + waste06.attributes.ewc_name + (waste06.attributes.hazardous ? "*" : "") + "</option>");
        }

        $(selectPicker).html(itemsHtml);
        $(selectPicker).selectpicker("refresh");
    },

}