var _ = require('underscore');
var utils = require('utils/utils');
var colorArray = [];
let occurances = []

module.exports = {
    enrichFlows: function(flows, tags, collections, granularity) {
        blocks = flows[0]['origin'] != undefined ? ['origin', 'destination'] : ['origin'];

        flows.forEach(function (flow, index) {
            var _this = this;

            // get all properties of flow
            blocks.forEach(block => {
                var node = flow[block] || flow,
                    properties = Object.keys(node);

                properties.forEach(function (property) {
                    // fetch corresponding collection
                    var collection = collections[tags[property]];

                    if (collection != undefined) {
                        // find corresponding model by ID
                        var model = collection.find(model => model.attributes.id == node[property]);

                        // fetch attributes
                        var attr = model.attributes,
                            code = attr.code || attr.nace || attr.ewc_code,
                            name = utils.capitalizeFirstLetter(attr.name || attr.ewc_name || "");

                        // add attributes to flows
                        idx = _this[index][block] || _this[index];
                        idx[property + 'Code'] = code;
                        idx[property + 'Name'] = name;
                    }
                })
            });
        }, flows);

        return flows
    },

    returnCodePlusName: function (input) {
        let codeString = input.attributes.code ? input.attributes.code : input.attributes.nace;
        return codeString + ". " + utils.capitalizeFirstLetter(input.attributes.name);
    },

    returnEwcCodePlusName: function (input) {
        return input.attributes.ewc_code + ". " + utils.capitalizeFirstLetter(input.attributes.ewc_name);
    },

    /**
     * Assigns colors per unique @propertyName for nominal data
     * 
     * @param {*} items: an array of items containing a property with name @propertyName
     * @param {*} propertyName: the property by which colors will be assigned 
     */
    assignColorsByProperty: function (items, propertyName) {
        // Get all unique occurences
        occurances = items.map(x => x[propertyName]);
        occurances = _.unique(occurances);

        // Create array with unique colors:
        colorArray = utils.interpolateColors(occurances.length);

        // Create array with prop of unique property and prop of matching color:
        occurances.forEach(function (propertyName, index) {
            this[index] = {
                name: this[index],
                color: colorArray[index],
            };
        }, occurances);

        // Asisgn a color for each unique property:
        items.forEach(function (item, index) {
            this[index].color = occurances.find(occ => occ.name == item[propertyName]).color;
        }, items);

        return items
    },

    checkToDisableLegend: function(items, propertyName) {
        occurances = items.map(x => x[propertyName]);
        occurances = _.unique(occurances);

        if (occurances.length > 50) {
            return false
        } else {
            return true;
        }
    }
}