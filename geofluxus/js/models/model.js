define(["backbone", "utils/utils", "app-config"],
function(Backbone, utils, config) {

    var Model = Backbone.Model.extend({

        idAttribute: "id",

        urlRoot: function(){
            // if concrete url was passed: take this and ignore the rest
            if (this.baseurl) return this.baseurl;

            // take url from api by tag and put the required ids in
            var apiUrl = config.api[this.apiTag]
            if (this.apiIds != null && this.apiIds.length > 0)
                apiUrl = apiUrl.format(...this.apiIds);
            return apiUrl;
        },

        initialize: function (attributes, options) {
            var options = options || {};
            this.baseurl = options.url;
            this.apiTag = options.apiTag;
            this.apiIds = options.apiIds || options.apiIDs;
            this.fileAttributes = options.fileAttributes || [];
        },

        save: function(data, options){
            var _this = this,
                options = options || {},
                uploadAsForm = options.uploadAsForm || false;
            // check if one of the attributes is a file
            if (!uploadAsForm && data){
                for (key in data){
                    if (data[key] instanceof File ) {
                        uploadAsForm = true;
                        break;
                    }
                }
            }

            // if file is passed in data: upload as form
            if (uploadAsForm){
                // remove trailing slash if there is one
                var url = this.urlRoot().replace(/\/$/, "");
                // post to resource if already existing (indicated by id) else create by posting to list view
                var method = (options.patch) ? 'PATCH' : (this.id != null) ? 'PUT': 'POST'
                if (this.id != null) url += '/' + this.id;
                url += '/';
                utils.uploadForm(data, url, {
                    method: method,
                    success: function(resData, textStatus, jqXHR){
                        // set attributes corresponding to response
                        for(key in resData){
                            _this.attributes[key] = resData[key];
                        }
                        if (options.success) options.success(_this);
                    },
                    error: options.error
                })
            }
            else return Model.__super__.save.apply(this, [data, options]);
        },

    });
    return Model;
}
)