var _ = require('underscore');
var utils = require('utils/utils');

module.exports = {

    enrichTime: function (flows, filterFlowsView, granularity) {
        let years = filterFlowsView.years.models;
        let months = filterFlowsView.months.models;

        if (granularity == "flowchain__month__year") {
            flows.forEach(function (flow, index) {
                let yearObject = years.find(year => year.attributes.id == flow.year);

                this[index].id = this[index].year;
                this[index].year = parseInt(yearObject.attributes.code);
            }, flows);

            flows = _.sortBy(flows, 'year');

        } else if (granularity == "flowchain__month") {
            flows.forEach(function (flow, index) {
                let monthObject = months.find(month => month.attributes.id == flow.month);

                this[index].id = monthObject.attributes.id;
                this[index].month = utils.returnMonthString(monthObject.attributes.code.substring(0, 2)) + " " + monthObject.attributes.code.substring(2, 6);
                this[index].monthName = this[index].month.substring(0, this[index].month.indexOf(' '));
                this[index].yearMonthCode = parseInt(monthObject.attributes.code.substring(2, 6) + monthObject.attributes.code.substring(0, 2));
                this[index].year = parseInt(monthObject.attributes.code.substring(2, 6));
            }, flows);

            flows = _.sortBy(flows, 'id');
        }

        return flows
    },

    enrichEconActivity: function (flows, filterFlowsView, granularity) {
        let activityGroups = filterFlowsView.activityGroups.models;
        let activities = filterFlowsView.activities.models;

        // Granularity = Activity group
        if (granularity == "origin__activity__activitygroup" || granularity == "destination__activity__activitygroup") {
            flows.forEach(function (flow, index) {
                let activityGroupObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.activitygroup);

                this[index].activityGroupCode = activityGroupObject.attributes.code;
                this[index].activityGroupName = activityGroupObject.attributes.name[0].toUpperCase() + activityGroupObject.attributes.name.slice(1).toLowerCase();
            }, flows);

            // Granularity: Activity
        } else if (granularity == "origin__activity" || granularity == "destination__activity") {
            flows.forEach(function (flow, index) {
                let activityObject = activities.find(activity => activity.attributes.id == flow.activity);
                let activityGroupObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.activitygroup);

                this[index].activityCode = activityObject.attributes.nace;
                this[index].activityName = activityObject.attributes.name[0].toUpperCase() + activityObject.attributes.name.slice(1).toLowerCase();

                this[index].activityGroupCode = activityGroupObject.attributes.code;
                this[index].activityGroupName = activityGroupObject.attributes.name[0].toUpperCase() + activityGroupObject.attributes.name.slice(1).toLowerCase();
            }, flows);
        }

        return flows
    },

    enrichTreatmentMethod: function (flows, filterFlowsView, granularity) {
        let processGroups = filterFlowsView.processgroups.models;
        let processes = filterFlowsView.processes.models;

        // Granularity: Treatment Method Group
        if (granularity == "origin__process__processgroup" || granularity == "destination__process__processgroup") {

            flows.forEach(function (flow, index) {
                let processGroupObject = processGroups.find(processGroup => processGroup.attributes.id == flow.processgroup);

                this[index].processGroupCode = processGroupObject.attributes.code;
                this[index].processGroupName = processGroupObject.attributes.name[0].toUpperCase() + processGroupObject.attributes.name.slice(1).toLowerCase();
            }, flows);

            // Granularity: Treatment Method
        } else if (granularity == "origin__process" || granularity == "destination__process") {

            flows.forEach(function (flow, index) {
                let processObject = processes.find(process => process.attributes.id == flow.process);
                let processGroupObject = processGroups.find(processGroup => processGroup.attributes.id == flow.processgroup);

                this[index].processCode = processObject.attributes.code;
                this[index].processName = processObject.attributes.name[0].toUpperCase() + processObject.attributes.name.slice(1).toLowerCase();

                this[index].processGroupCode = processGroupObject.attributes.code;
                this[index].processGroupName = processGroupObject.attributes.name[0].toUpperCase() + processGroupObject.attributes.name.slice(1).toLowerCase();
            }, flows);
        }

        return flows
    },

    enrichEWC: function (flows, filterFlowsView, granularity) {
        let ewc2 = filterFlowsView.wastes02.models;
        let ewc4 = filterFlowsView.wastes04.models;
        let ewc6 = filterFlowsView.wastes06.models;

        // ewc2
        if (granularity == "flowchain__waste06__waste04__waste02") {

            flows.forEach(function (flow, index) {
                let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.waste02);

                this[index].ewc2Code = ewc2Object.attributes.ewc_code;
                this[index].ewc2Name = ewc2Object.attributes.ewc_name[0].toUpperCase() + ewc2Object.attributes.ewc_name.slice(1).toLowerCase();
            }, flows);

            // ewc4
        } else if (granularity == "flowchain__waste06__waste04") {

            flows.forEach(function (flow, index) {
                let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.waste02);
                let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.waste04);

                this[index].ewc2Code = ewc2Object.attributes.ewc_code;
                this[index].ewc2Name = ewc2Object.attributes.ewc_name[0].toUpperCase() + ewc2Object.attributes.ewc_name.slice(1).toLowerCase();
                this[index].ewc4Code = ewc4Object.attributes.ewc_code;
                this[index].ewc4Name = ewc4Object.attributes.ewc_name[0].toUpperCase() + ewc4Object.attributes.ewc_name.slice(1).toLowerCase();
            }, flows);

            // ewc6
        } else if (granularity == "flowchain__waste06") {
            flows.forEach(function (flow, index) {
                let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.waste02);
                let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.waste04);
                let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.waste06);

                this[index].ewc2Code = ewc2Object.attributes.ewc_code;
                this[index].ewc2Name = ewc2Object.attributes.ewc_name[0].toUpperCase() + ewc2Object.attributes.ewc_name.slice(1).toLowerCase();
                this[index].ewc4Code = ewc4Object.attributes.ewc_code;
                this[index].ewc4Name = ewc4Object.attributes.ewc_name[0].toUpperCase() + ewc4Object.attributes.ewc_name.slice(1).toLowerCase();
                this[index].ewc6Code = ewc6Object.attributes.ewc_code;
                this[index].ewc6Name = ewc6Object.attributes.ewc_name[0].toUpperCase() + ewc6Object.attributes.ewc_name.slice(1).toLowerCase();
            }, flows);
        }

        return flows
    },
}