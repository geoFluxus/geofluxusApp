var utils = require('utils/utils');

module.exports = {

    fillSelectPicker: function (filterName, selectPicker, objectArray) {
        let itemsHtml = '<option selected value="-1">All (' + objectArray.length + ')</option><option data-divider="true"></option>';

        switch (filterName) {
            case "activityGroup":
                objectArray.forEach(item => itemsHtml += "<option value='" + item.attributes.id + "'>" + item.attributes.code + " " + utils.capitalizeFirstLetter(item.attributes.name) + "</option>");
                $(selectPicker).html(itemsHtml);
                $(selectPicker).selectpicker("refresh");
                break;
            case "activity":
                objectArray.forEach(item => itemsHtml += "<option value='" + item.attributes.id + "'>" + item.attributes.nace + " " + item.attributes.name + "</option>");
                $(selectPicker).html(itemsHtml);
                $(selectPicker).selectpicker("refresh");
                break;

            default:
                break;



        }
    },

}