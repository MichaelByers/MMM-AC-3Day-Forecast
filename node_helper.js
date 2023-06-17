/* Magic Mirror Module: MMM-AC-3Day-Forecast helper
 * Version: 1.0.0
 *
*/

var NodeHelper = require('node_helper');
var axios = require('axios').default;
var moment = require('moment');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-AC-3Day-Forecast helper, started...');
    },


    getWeatherData: function(payload) {

        var _this = this;
        this.url = payload;
		axios.get(this.url)
			.then(function (response) {
				// handle success
				var result;
				var forecast = []; // Clear the array
				// Check to see if we are error free and got an OK response
				if (response.status == 200) {
					for (var i=0; i < 3; i++) {
						forecast.push(response.data.DailyForecasts[i]);
					}
				} else {
					// In all other cases it's some other error
					console.log('[MMM-3Day-Forecast] ** ERROR ** ' + response.statusCode);
				}
				_this.sendSocketNotification('GOT-AC-3DAY-FORECAST', {'url': _this.url, 'forecast': forecast});
			})
			.catch(function (error) {
				// handle error
				console.log( "[MMM-3Day-Forecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + error );
			});
    },

    socketNotificationReceived: function(notification, payload) {
        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-AC-3DAY-FORECAST') {
            this.getWeatherData(payload);
        }
    }

});
