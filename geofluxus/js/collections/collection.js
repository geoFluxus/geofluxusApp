define(["backbone-pageable", "underscore", "models/model", "app-config"],

function(PageableCollection, _, Model, config) {

    var Collection = PageableCollection.extend({

        url: function(){
            // if concrete url was passed: take this and ignore the rest
            if (this.baseurl) return this.baseurl;

            // take url from api by tag and put the required ids in
            var apiUrl = config.api[this.apiTag];
            if (this.apiIds != null && this.apiIds.length > 0)
                apiUrl = apiUrl.format(...this.apiIds);
            return apiUrl;
        },

        // by default try to fetch 'em all (should never exceed 1Mio hopefully)
        // you may reduce the pageSize to get real paginated results
        state: {
            pageSize: 1000000,
            firstPage: 1,
            currentPage: 1
        },

        filterBy: function (attributes, options) {
            var options = options || {},
                keys = Object.keys(attributes);
            var filtered = this.filter(function (model) {
                function match(key){
                    var value = model.get(key),
                        checkValue = attributes[key];
                    if (Array.isArray(checkValue)){
                        for (var i = 0; i < checkValue.length; i++){
                            if (String(value) == String(checkValue[i])) return true;
                        }
                        return false;
                    }
                    return String(value) == String(checkValue);
                }
                if (options.operator == '||')
                    return keys.some(match)
                return keys.every(match)
            });
            var ret = new this.__proto__.constructor(filtered,
                {
                    apiTag: this.apiTag,
                    apiIds: this.apiIds,
                    comparator: this.comparatorAttr
                }
            );
            return ret;
        },

        postfetch: function (options){
            options = options ? _.clone(options) : {};
            if (options.parse === void 0) options.parse = true;
            var success = options.success;
            var collection = this;
            var queryData = options.data || {},
                success = options.success,
                _this = this;
            // move body attribute to post data (will be put in body by AJAX)
            // backbone does some strange parsing of nested objects
            var data = {};
            for (var key in options.body) {
                var value = options.body[key];
                data[key] = (value instanceof Object) ? JSON.stringify(value) : value;
            }
            options.data = data;

            // response to models on success, call passed success function
            function onSuccess(response){
                var method = options.reset ? 'reset' : 'set';
                collection[method](response, options);
                if (success) success.call(options.context, _this, response, options);
                _this.trigger('sync', _this, response, options);
            }

            options.success = onSuccess;
            // unfortunately PageableCollection has no seperate function to build
            // query parameters for pagination (all done in fetch())
            queryData[this.queryParams.page || 'page'] = 1;
            queryData[this.queryParams.pageSize || 'page_size'] = this.state.pageSize;

            // GDSE API specific: signal the API that resources are requested
            // via POST method
            queryData.GET = true;

            return Backbone.ajax(_.extend({
                // jquery post does not automatically set the query params
                url: this.url() + '?' + $.param(queryData),
                method: "POST",
                dataType: "json",
            }, options));
        },

        // parameter names as used in the rest API
        queryParams: {
            pageSize: "page_size"
        },

        // called immediately after fetching, parses the response (json)
        parseRecords: function (response) {
            // paginated api urls return the models under the key 'results'
            if (response.results){
                this.count = response['count'];
                return response.results;
            }
            return response;
        },

        // function to compare models by the preset attribute (id per default) whenever you call sort
        comparator: function(model) {
            return model.get(this.comparatorAttr);
        },

        initialize: function (models, options) {
            //_.bindAll(this, 'model');
            var options = options || {};
            this.baseurl = options.url;
            this.apiTag = options.apiTag;
            this.apiIds = options.apiIds || options.apiIDs;
            this.comparatorAttr = options.comparator || 'id';
        },

        model: Model
    });

    return Collection;
}
);