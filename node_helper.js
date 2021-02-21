/* Magic Mirror Module: MMM-AC-3Day-Forecast helper
 * Version: 1.0.0
 *
*/

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-AC-3Day-Forecast helper, started...');
    },


    getWeatherData: function(payload) {

        var _this = this;
        this.url = payload;

        request({url: this.url, method: 'GET'}, function(error, response, body) {
            // Lets convert the body into JSON
            var result = JSON.parse(body);
            var forecast = []; // Clear the array

            // Check to see if we are error free and got an OK response
            if (!error && response.statusCode == 200) { 
                for (var i=0; i < 3; i++) {
                    forecast.push(result.DailyForecasts[i]);
                }
            } else {
                // In all other cases it's some other error
                console.log('[MMM-3Day-Forecast] ' + result.Code);
            }

            // We have the response figured out so lets fire off the notifiction
            _this.sendSocketNotification('GOT-AC-3DAY-FORECAST', {'url': _this.url, 'forecast': forecast});
        });
    },

    socketNotificationReceived: function(notification, payload) {
        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-AC-3DAY-FORECAST') {
            this.getWeatherData(payload);
        }
    }

});
