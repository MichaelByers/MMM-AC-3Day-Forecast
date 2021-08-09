/* Magic Mirror Module: MMM-AC-3Day-Forecast
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/MichaelByers/
 * MIT Licensed.
 */

Module.register('MMM-AC-3Day-Forecast', {

	defaults: {
            apikey:    '',
            loc:		347810, //denver,co
			metric:		false,  //true is imperial
			lang:		'en-us',
            interval:   18000000 // Every 30 mins (50 api calls per day max)
        },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },

    start:  function() {
        Log.log('Starting module: ' + this.name);
        var self = this;

        // Set up the local values, here we construct the request url to use
        this.units = this.config.units;
        this.loaded = false;
		this.url = 'http://dataservice.accuweather.com/forecasts/v1/daily/5day/' + this.config.loc + '?apikey=' + this.config.apikey + '&metric=' + this.config.metric + '&lang=' + this.config.lang + '&details=true';
        this.forecast = [];

        // Trigger the first request
        this.getWeatherData(this);
        setInterval(function() {
            self.getWeatherData(self);
          }, self.config.interval);
    },

    getStyles: function() {
        return ['3day_forecast.css', 'font-awesome.css'];
    },


    getWeatherData: function(_this) {
        // Make the initial request to the helper then set up the timer to perform the updates
	var hour = moment().hour();

	if( (hour >= 6) && (hour <=22) ) {
            _this.sendSocketNotification('GET-AC-3DAY-FORECAST', _this.url);
        }
    },


    getDom: function() {
        // Set up the local wrapper
        var wrapper = null;


        // If we have some data to display then build the results
        if (this.loaded) {
            wrapper = document.createElement('table');
	 	    wrapper.className = 'forecast small';
            forecastRow = document.createElement('tr');
            var hour = moment().hour();
 
            // Set up the forecast for three three days
            for (var i = 0; i < 3; i++) {
                var forecastClass = '';
                var title = '';
                
                // Determine which day we are detailing
                switch (i) {
                    case 0:
                        forecastClass = 'today';
                        title = 'Today';
                        break;
                    case 1:
                        forecastClass = 'tomorrow';
                        title = 'Tomorrow';
                        break;
                    case 2:
                        forecastClass = 'dayAfter';
                        title = 'Day After';
                        break;
                }

                // Create the details for this day
                forcastDay = document.createElement('td');
                forcastDay.className = 'forecastday ' + forecastClass;

                forcastTitle = document.createElement('div');
                forcastTitle.className = 'forecastTitle';

                forecastIcon = document.createElement('img');
                forecastIcon.className = 'forecastIcon';
                forecastIcon.setAttribute('height', '50');
                forecastIcon.setAttribute('width', '75');

                forecastText = document.createElement('div');
                forecastText.className = 'forecastText horizontalView bright';

                forecastBr = document.createElement('br');

                // Create div to hold all of the detail data
                forecastDetail = document.createElement('div');
                forecastDetail.className = 'forecastDetail';

                // Build up the details regarding temprature
                tempIcon = document.createElement('img');
                tempIcon.className = 'detailIcon';
                tempIcon.setAttribute('height', '15');
                tempIcon.setAttribute('width', '15');
                tempIcon.src = './modules/MMM-AC-3Day-Forecast/images/high.png';

                tempText = document.createElement('span');
                tempText.className = 'normal';
				tempText.innerHTML = this.forecast[i].Temperature.Minimum.Value + '&deg; &#8658; ' + this.forecast[i].Temperature.Maximum.Value + '&deg;';

                tempBr = document.createElement('br');

                // Build up the details regarding precipitation %
                rainIcon = document.createElement('img');
                rainIcon.className = 'detailIcon';
                rainIcon.setAttribute('height', '15');
                rainIcon.setAttribute('width', '15');
                rainIcon.src = './modules/MMM-AC-3Day-Forecast/images/wet.png';

                rainText = document.createElement('span');
                rainBr = document.createElement('br');

                // Build up the details regarding wind
                windIcon = document.createElement('img');
                windIcon.className = 'detailIcon';
                windIcon.setAttribute('height', '15');
                windIcon.setAttribute('width', '15');
                windIcon.src = './modules/MMM-AC-3Day-Forecast/images/wind.png';

                windText = document.createElement('span');
                windBr = document.createElement('br');

                // Build up the details regarding sunset
                sunIcon = document.createElement('img');
                sunIcon.className = 'detailIcon';
                sunIcon.setAttribute('height', '15');
                sunIcon.setAttribute('width', '15');
                sunIcon.src = './modules/MMM-AC-3Day-Forecast/images/sunset.png';

                sunText = document.createElement('span');
                sunText.innerHTML = moment(this.forecast[i].Sun.Set).format('h:mm');    

                var icon = '';
                var precip = 0;
                // if at night, show tonight's details instead
                if ((hour >= 17) && (i == 0)) {
                    icon = this.forecast[i].Night.Icon;
                    if (icon < 10) {
                        icon = "0" + this.forecast[i].Night.Icon;
                    }
                    title = "Tonight";
                    forecastText.innerHTML = this.forecast[i].Night.ShortPhrase;
                    precip = this.forecast[i].Night.PrecipitationProbability;
                    windText.innerHTML = Math.round(this.forecast[i].Night.Wind.Speed.Value) + ' &#10613; ' + Math.round(this.forecast[i].Night.WindGust.Speed.Value) + '<span style="font-size: 15px"> mph</font>';
                } else {
                    icon = this.forecast[i].Day.Icon;
                    if (icon < 10) {
                        icon = "0" + this.forecast[i].Day.Icon;
                    }
                    forecastText.innerHTML = this.forecast[i].Day.ShortPhrase;
                    precip = Math.max(this.forecast[i].Day.PrecipitationProbability, this.forecast[i].Night.PrecipitationProbability);
                    windText.innerHTML = Math.round(this.forecast[i].Day.Wind.Speed.Value) + ' &#10613; ' + Math.round(this.forecast[i].Day.WindGust.Speed.Value) + '<span style="font-size: 15px"> mph</font>';
                }
                forecastIcon.src = 'https://developer.accuweather.com/sites/default/files/' + icon + '-s.png';
                rainText.innerHTML = precip + '%';
                forcastTitle.innerHTML = title;

                // Now assemble the details
                forecastDetail.appendChild(tempIcon);
                forecastDetail.appendChild(tempText);
                forecastDetail.appendChild(tempBr);
                forecastDetail.appendChild(rainIcon);
                forecastDetail.appendChild(rainText);
                forecastDetail.appendChild(rainBr);
                forecastDetail.appendChild(windIcon);
                forecastDetail.appendChild(windText);
                forecastDetail.appendChild(windBr);
                forecastDetail.appendChild(sunIcon);
                forecastDetail.appendChild(sunText);

                forcastDay.appendChild(forcastTitle);
                forcastDay.appendChild(forecastIcon);
                forcastDay.appendChild(forecastText);
                forcastDay.appendChild(forecastBr);
                forcastDay.appendChild(forecastDetail);

                // Now assemble the final output
                forecastRow.appendChild(forcastDay);
	            wrapper.appendChild(forecastRow);
			}
        } else {
            // Otherwise lets just use a simple div
            wrapper = document.createElement('div');
            wrapper.innerHTML = this.translate('LOADING');
        }

        return wrapper;
    },


    socketNotificationReceived: function(notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-AC-3DAY-FORECAST' && payload.url === this.url) {
                // we got some data so set the flag, stash the data to display then request the dom update
                if(payload.forecast.length > 0) {
                    this.loaded = true;
                    this.forecast = payload.forecast;
                }
                this.updateDom(1000);
            }
        }
    });
