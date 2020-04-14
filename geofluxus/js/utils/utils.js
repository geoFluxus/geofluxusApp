var d3 = require('d3');

//var color = "" //d3.scale.category20();

var color = d3.scaleOrdinal(d3.schemeCategory10);

module.exports = {

    // loader shown in center of given div as spinning circle when activated
    // options.disable disables given div while loader is active
    Loader: function (div, options) {
        var loaderDiv = document.createElement('div');
        loaderDiv.className = 'loader';
        var backdropDiv = document.createElement('div');
        backdropDiv.className = 'modal-backdrop in';

        this.activate = function (opt) {
            var opt = opt || {};
            loaderDiv.style.top = null;
            if (options != null && options.disable)
                div.classList.add('disabled');
            if (opt.offsetX != null) loaderDiv.style.top = opt.offsetX;
            div.appendChild(loaderDiv);
            div.appendChild(backdropDiv);
        }

        this.deactivate = function () {
            if (options != null && options.disable)
                div.classList.remove('disabled');
            try {
                div.removeChild(loaderDiv);
                div.removeChild(backdropDiv);
            } catch (err) {
                console.log(err.message)
            }
        }
    },

    // success: function (data, textStatus, jqXHR)
    // error: function(response)
    uploadForm: function (data, url, options) {
        var options = options || {},
            method = options.method || 'POST',
            success = options.success || function () {},
            error = options.error || function () {};
        var formData = new FormData();
        for (var key in data) {
            if (data[key] instanceof Array) {
                data[key].forEach(function (d) {
                    formData.append(key, d);
                })
            } else
                formData.append(key, data[key]);
        }
        $.ajax({
            type: method,
            timeout: 3600000,
            url: url,
            data: formData,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: success,
            error: error
        });
    },
    colorByName: function (name) {
        name = String(name);
        return color(name.replace(/ .*/, ""));
    },
    returnMonthString: function (monthNumber) {
        monthNumber = parseInt(monthNumber) - 1;
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[monthNumber]
    },

    returnD3plusFormatLocale: function () {
        return {
            separator: "",
            suffixes: ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "B", "t", "q", "Q", "Z", "Y"],
            grouping: [3],
            delimiters: {
                thousands: " ",
                decimal: ","
            },
            currency: ["€", ""]
        }
    },
}