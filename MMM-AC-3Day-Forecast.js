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
			metric:		false,  //defualt is imperial
			lang:		'en-us',
            interval:   18000000 // Every 30 mins (50 api calls per day max)
        },


    start:  function() {
        Log.log('Starting module: ' + this.name);

        // Set up the local values, here we construct the request url to use
        this.units = this.config.units;
        this.loaded = false;
		this.url = 'http://dataservice.accuweather.com/forecasts/v1/daily/5day/' + this.config.loc + '?apikey=' + this.config.apikey + '&metric=' + this.config.metric + '&lang=' + this.config.lang + '&details=true';
        this.forecast = [];

        // Trigger the first request
        this.getWeatherData(this);
        },


    getStyles: function() {
        return ['3day_forecast.css', 'font-awesome.css'];
        },


    getWeatherData: function(_this) {
        // Make the initial request to the helper then set up the timer to perform the updates
        _this.sendSocketNotification('GET-AC-3DAY-FORECAST', _this.url);
        setTimeout(_this.getWeatherData, _this.config.interval, _this);
        },


    getDom: function() {
        // Set up the local wrapper
        var wrapper = null;


        // If we have some data to display then build the results
        if (this.loaded) {
            wrapper = document.createElement('table');
	 	    wrapper.className = 'forecast small';
            forecastRow = document.createElement('tr');

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
                forcastTitle.innerHTML = title;

                forecastIcon = document.createElement('img');
                forecastIcon.className = 'forecastIcon';
                forecastIcon.setAttribute('height', '50');
                forecastIcon.setAttribute('width', '50');
                var icon = this.forecast[i].Day.Icon;
                if (icon < 10) {
                    icon = "0" + this.forecast[i].Day.Icon;
                }
                forecastIcon.src = 'https://developer.accuweather.com/sites/default/files/' + icon + '-s.png';

                forecastText = document.createElement('div');
                forecastText.className = 'forecastText horizontalView bright';
                forecastText.innerHTML = this.forecast[i].Day.ShortPhrase;

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
				tempText.innerHTML = this.forecast[i].Temperature.Maximum.Value + '&deg;';

                tempBr = document.createElement('br');

                // Build up the details regarding precipitation %
                rainIcon = document.createElement('img');
                rainIcon.className = 'detailIcon';
                rainIcon.setAttribute('height', '15');
                rainIcon.setAttribute('width', '15');
                rainIcon.src = './modules/MMM-AC-3Day-Forecast/images/wet.png';

                rainText = document.createElement('span');
                var precip = Math.max(this.forecast[i].Day.PrecipitationProbability, this.forecast[i].Night.PrecipitationProbability);
                rainText.innerHTML = precip + '%';

                rainBr = document.createElement('br');

                // Build up the details regarding wind
                windIcon = document.createElement('img');
                windIcon.className = 'detailIcon';
                windIcon.setAttribute('height', '15');
                windIcon.setAttribute('width', '15');
                windIcon.src = './modules/MMM-AC-3Day-Forecast/images/wind.png';

                windText = document.createElement('span');
                windText.innerHTML = Math.round(this.forecast[i].Day.Wind.Speed.Value) + ' ' + this.forecast[i].Day.Wind.Direction.Localized;

                // Now assemble the details
                forecastDetail.appendChild(tempIcon);
                forecastDetail.appendChild(tempText);
                forecastDetail.appendChild(tempBr);
                forecastDetail.appendChild(rainIcon);
                forecastDetail.appendChild(rainText);
                forecastDetail.appendChild(rainBr);
                forecastDetail.appendChild(windIcon);
                forecastDetail.appendChild(windText);

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
                this.loaded = true;
                this.forecast = payload.forecast;
                this.updateDom(1000);
            }
        }
    });
