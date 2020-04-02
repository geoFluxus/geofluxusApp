define(['browser-cookies'], function(cookies)
{

    class Session {

        // Properties
        constructor(options){
            var options = options || {};
            this.url = options.url || '/session';
            this.attributes = {};
        }

        // Fetch
        fetch(options){
            var _this = this;
            function success(json){
                _this.setAttributes(json);
                if (options.success){
                    options.success(_this);
                }
            }
            fetch(this.url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            }).then(response => response.json()).then(json => success(json));
        }

        // Set attribute group
        setAttributes(json){
            this.attributes = {};
            for (var key in json) {
                this.attributes[key] = json[key];
            }
        }

        // Get unique attribute
        get(attribute){
            return this.attributes[attribute];
        }

        // Set unique attribute
        setAttribute(attribute, value){
            this.attributes[attribute] = value;
        }

        // Save
        save(attributes, options){
            var _this = this,
                options = options || {};
            function success(json){
                _this.setAttribute(json);
                if (options.success){
                    options.success(_this);
                }
            }
            var attributes = attributes || this.attributes,
                csrftoken = cookies.get('csrftoken');
            fetch(this.url, {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify(attributes),
                credentials: 'include'
            }).then(response => success(response));
        }
    }

    return Session;
})