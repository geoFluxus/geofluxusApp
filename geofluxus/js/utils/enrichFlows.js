var _ = require('underscore');
var utils = require('utils/utils');
var colorArray = [];
let occurances = []

module.exports = {

    enrichTime: function (flows, collections, granularity) {
        let years = collections['years'].models;
        let months = collections['months'].models;

        if (granularity.includes("year")) {
            flows.forEach(function (flow, index) {
                let yearObject = years.find(year => year.attributes.id == flow.year);

                this[index].id = this[index].year;
                this[index].year = parseInt(yearObject.attributes.code);
            }, flows);

            flows = _.sortBy(flows, 'year');

        } else {
            flows.forEach(function (flow, index) {
                let monthObject = months.find(month => month.attributes.id == flow.month),
                    code = monthObject.attributes.code,
                    month = code.substring(0, 2),
                    year = code.substring(2, 6);

                this[index].id = monthObject.attributes.id;
                this[index].month = utils.toMonthString(month) + " " + year;
                this[index].monthName = this[index].month.split(" ")[0];
                this[index].yearMonthCode = parseInt(year + month);
                this[index].year = parseInt(year);
            }, flows);

            flows = _.sortBy(flows, 'id');
        }

        return flows
    },

    enrichEconActivity: function (flows, collections, granularity) {
        let activityGroups = collections['activitygroups'].models;
        let activities = collections['activities'].models;

        // Granularity = Activity group
        if (granularity.includes("activitygroup")) {
            flows.forEach(function (flow, index) {
                let activityGroupObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.activitygroup);

                this[index].activityGroupCode = activityGroupObject.attributes.code;
                this[index].activityGroupName = utils.capitalizeFirstLetter(activityGroupObject.attributes.name);
            }, flows);

            // Granularity: Activity
        } else {
            flows.forEach(function (flow, index) {
                let activityObject = activities.find(activity => activity.attributes.id == flow.activity);
                let activityGroupObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.activitygroup);

                this[index].activityCode = activityObject.attributes.nace;
                this[index].activityName = utils.capitalizeFirstLetter(activityObject.attributes.name);

                this[index].activityGroupCode = activityGroupObject.attributes.code;
                this[index].activityGroupName = utils.capitalizeFirstLetter(activityGroupObject.attributes.name);
            }, flows);
        }

        return flows
    },

    enrichTreatmentMethod: function (flows, collections, granularity) {
        let processGroups = collections['processgroups'].models;
        let processes = collections['processes'].models;

        // Granularity: Treatment Method Group
        if (granularity.includes("processgroup")) {

            flows.forEach(function (flow, index) {
                let processGroupObject = processGroups.find(processGroup => processGroup.attributes.id == flow.processgroup);

                this[index].processGroupCode = processGroupObject.attributes.code;
                this[index].processGroupName = utils.capitalizeFirstLetter(processGroupObject.attributes.name);
            }, flows);

            // Granularity: Treatment Method
        } else {

            flows.forEach(function (flow, index) {
                let processObject = processes.find(process => process.attributes.id == flow.process);
                let processGroupObject = processGroups.find(processGroup => processGroup.attributes.id == flow.processgroup);

                this[index].processCode = processObject.attributes.code;
                this[index].processName = utils.capitalizeFirstLetter(processObject.attributes.name);

                this[index].processGroupCode = processGroupObject.attributes.code;
                this[index].processGroupName = utils.capitalizeFirstLetter(processGroupObject.attributes.name);
            }, flows);
        }

        return flows
    },

    enrichEWC: function (flows, collections, granularity) {
        let ewc2 = collections['wastes02'].models;
        let ewc4 = collections['wastes04'].models;
        let ewc6 = collections['wastes06'].models;

        // ewc2
        if (granularity.includes("waste02")) {

            flows.forEach(function (flow, index) {
                let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.waste02);

                this[index].ewc2Code = ewc2Object.attributes.ewc_code;
                this[index].ewc2Name = utils.capitalizeFirstLetter(ewc2Object.attributes.ewc_name);
            }, flows);

            // ewc4
        } else if (granularity.includes("waste04")) {

            flows.forEach(function (flow, index) {
                let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.waste02);
                let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.waste04);

                this[index].ewc2Code = ewc2Object.attributes.ewc_code;
                this[index].ewc2Name = utils.capitalizeFirstLetter(ewc2Object.attributes.ewc_name);
                this[index].ewc4Code = ewc4Object.attributes.ewc_code;
                this[index].ewc4Name = utils.capitalizeFirstLetter(ewc4Object.attributes.ewc_name);
            }, flows);

            // ewc6
        } else if (granularity.include("waste06")) {
            flows.forEach(function (flow, index) {
                let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.waste02);
                let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.waste04);
                let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.waste06);

                this[index].ewc2Code = ewc2Object.attributes.ewc_code;
                this[index].ewc2Name = utils.capitalizeFirstLetter(ewc2Object.attributes.ewc_name);
                this[index].ewc4Code = ewc4Object.attributes.ewc_code;
                this[index].ewc4Name = utils.capitalizeFirstLetter(ewc4Object.attributes.ewc_name);
                this[index].ewc6Code = ewc6Object.attributes.ewc_code;
                this[index].ewc6Name = utils.capitalizeFirstLetter(ewc6Object.attributes.ewc_name);
            }, flows);
        }

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
    }
}