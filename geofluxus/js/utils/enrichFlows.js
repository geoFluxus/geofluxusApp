var _ = require('underscore');

module.exports = {

    enrichTime: function (flows, filterFlowsView, granularityString) {
        console.log("enrichtTime");

        let years = filterFlowsView.years.models;
        let months = filterFlowsView.months.models;

        if (granularityString == "flowchain__month__year") {


            flows.forEach(function (flow, index) {
                let yearObject = years.find(year => year.attributes.id == flow.year);

                this[index].id = this[index].year;
                this[index].year = parseInt(yearObject.attributes.code);
            }, flows);

            flows = _.sortBy(flows, 'year');

        } else if (granularityString == "flowchain__month") {

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

    enrichEconActivity: function (flows, filterFlowsView, granularityString) {


        let activityGroups = filterFlowsView.activityGroups.models;
        let activities = filterFlowsView.activities.models;

        // Granularity = Activity group
        if (granularityString == "origin__activity__activitygroup" || granularityString == "destination__activity__activitygroup") {

            flows.forEach(function (flow, index) {
                let activityGroupObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.activitygroup);

                this[index].activityGroupCode = activityGroupObject.attributes.code;
                this[index].activityGroupName = activityGroupObject.attributes.name[0].toUpperCase() + activityGroupObject.attributes.name.slice(1).toLowerCase();
            }, flows);

            // Granularity: Activity
        } else if (granularityString == "origin__activity" || granularityString == "destination__activity") {

            flows.forEach(function (flow, index) {
                let activityGroupName = "";
                let activityObject = activities.find(activity => activity.attributes.id == flow.activity);

                this[index].activityCode = activityObject.attributes.nace;
                this[index].activityName = activityObject.attributes.name[0].toUpperCase() + activityObject.attributes.name.slice(1).toLowerCase();

                this[index].activityGroupCode = this[index].activityCode.substring(0, this[index].activityCode.indexOf('-'));
                activityGroupName = activityGroups.find(activityGroup => activityGroup.attributes.code == this[index].activityGroupCode).attributes.name;
                this[index].activityGroupName = activityGroupName[0].toUpperCase() + activityGroupName.slice(1).toLowerCase();
            }, flows);
        }

        return flows
    },

    enrichTreatmentMethod: function (flows, filterFlowsView, granularityString) {
        let processGroups = filterFlowsView.processgroups.models;
        let processes = filterFlowsView.processes.models;

        // Granularity: Treatment Method Group
        if (granularityString == "origin__process__processgroup" || granularityString == "destination__process__processgroup") {

            flows.forEach(function (flow, index) {
                let processGroupObject = processGroups.find(processGroup => processGroup.attributes.id == flow.processgroup);

                this[index].processGroupCode = processGroupObject.attributes.code;
                this[index].processGroupName = processGroupObject.attributes.name[0].toUpperCase() + processGroupObject.attributes.name.slice(1).toLowerCase();
            }, flows);

            // Granularity: Treatment Method
        } else if (granularityString == "origin__process" || granularityString == "destination__process") {

            flows.forEach(function (flow, index) {
                let processGroupName = "";
                let processObject = processes.find(process => process.attributes.id == flow.process);

                this[index].processCode = processObject.attributes.code;
                this[index].processName = processObject.attributes.name[0].toUpperCase() + processObject.attributes.name.slice(1).toLowerCase();

                this[index].processGroupCode = processObject.attributes.code.substring(0, 1);
                processGroupName = processGroups.find(processGroup => processGroup.attributes.code == this[index].processGroupCode).attributes.name;
                this[index].processGroupName = processGroupName[0].toUpperCase() + processGroupName.slice(1).toLowerCase();
            }, flows);
        }

        return flows
    },
}