/* Magic Mirror Module: MMM-AC-3Day-Forecast
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/MichaelByers/
 * MIT Licensed.
 */

Module.register('MMM-AC-3Day-Forecast', {

	defaults: {
            apikey:    '',
            office:     'BOU', //denver,co
            gridX:      66,    //denver,co
            gridY:      53,    //denver,co
            units:		'us', //imperial or metric
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
        this.loaded = false;
		this.url = 'https://api.open-meteo.com/v1/forecast?latitude=39.5517&longitude=-104.8863&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_gusts_10m_max,wind_speed_10m_max,sunrise,sunset,precipitation_probability_max&timezone=America%2FDenver&forecast_days=3&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch';
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
	 	    wrapper.className = 'threeDayforecast small';
            forecastRow = document.createElement('tr');
            let hour = moment().hour();
            const imgSize = '17';
 
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
                forcastDay.className = forecastClass;

                forcastTitle = document.createElement('div');
                forcastTitle.className = 'threeDayforecastTitle';

                forecastIcon = document.createElement('img');
                forecastIcon.className = 'threeDayforecastIcon';
                forecastIcon.setAttribute('height', '75');
                forecastIcon.setAttribute('width', '75');

                forecastText = document.createElement('div');
                forecastText.className = 'threeDayforecastText horizontalView bright';

                forecastBr = document.createElement('br');

                // Create div to hold all of the detail data
                forecastDetail = document.createElement('div');
                forecastDetail.className = 'threeDayforecastDetail';

                // Build up the details regarding temprature
                tempIcon = document.createElement('img');
                tempIcon.className = 'threeDaydetailIcon';
                tempIcon.setAttribute('height', imgSize);
                tempIcon.setAttribute('width', imgSize);
                tempIcon.src = './modules/MMM-AC-3Day-Forecast/images/high.png';

                tempText = document.createElement('span');
                tempText.className = 'normal';
				tempText.innerHTML = Math.round(this.forecast.temperature_2m_min[i]) + '&deg; &#8658; ' + Math.round(this.forecast.temperature_2m_max[i]) + '&deg;';

                tempBr = document.createElement('br');

                // Build up the details regarding precipitation %
                rainIcon = document.createElement('img');
                rainIcon.className = 'threeDaydetailIcon';
                rainIcon.setAttribute('height', imgSize);
                rainIcon.setAttribute('width', imgSize);
                rainIcon.src = './modules/MMM-AC-3Day-Forecast/images/wet.png';

                rainText = document.createElement('span');
                rainBr = document.createElement('br');

                // Build up the details regarding wind
                windIcon = document.createElement('img');
                windIcon.className = 'threeDaydetailIcon';
                windIcon.setAttribute('height', imgSize);
                windIcon.setAttribute('width', imgSize);
                windIcon.src = './modules/MMM-AC-3Day-Forecast/images/wind.png';

                windText = document.createElement('span');
                windBr = document.createElement('br');

                // Build up the details regarding sunset
                sunIcon = document.createElement('img');
                sunIcon.className = 'threeDaydetailIcon';
                sunIcon.setAttribute('height', imgSize);
                sunIcon.setAttribute('width', imgSize);
                sunIcon.src = './modules/MMM-AC-3Day-Forecast/images/sunset.png';

                sunText = document.createElement('span');
                sunText.innerHTML = moment(this.forecast.sunset[i]).format('h:mm');    

                let myIconSrc = '';
                // if at night, show tonight's details instead
                if ((hour >= 17) && (i == 0)) {
                    myIconSrc = this.iconTable[this.forecast.weather_code[i]].night.image;
                    title = "Tonight";
                } else {
                    myIconSrc = this.iconTable[this.forecast.weather_code[i]].day.image;
                }

                let shortForecast = this.iconTable[this.forecast.weather_code[i]].day.description;
                forecastText.innerHTML = shortForecast;
                forecastIcon.src = myIconSrc;

                windText.innerHTML = Math.round(this.forecast.wind_speed_10m_max[i]) + ' &#10613; ' + Math.round(this.forecast.wind_gusts_10m_max[i]) + '<span style="font-size: 15px"> mph</font>';

                rainText.innerHTML = this.forecast.precipitation_probability_max[i] + '%';
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
                if(payload.forecast.daily !== undefined) {
                    this.loaded = true;
                    this.forecast = payload.forecast.daily;
                }
            this.updateDom(1000);
        }
    },

    iconTable: {
        "0":{
            "day":{
                "description":"Sunny",
                "image":"http://openweathermap.org/img/wn/01d@2x.png"
            },
            "night":{
                "description":"Clear",
                "image":"http://openweathermap.org/img/wn/01n@2x.png"
            }
        },
        "1":{
            "day":{
                "description":"Mainly Sunny",
                "image":"http://openweathermap.org/img/wn/01d@2x.png"
            },
            "night":{
                "description":"Mainly Clear",
                "image":"http://openweathermap.org/img/wn/01n@2x.png"
            }
        },
        "2":{
            "day":{
                "description":"Partly Cloudy",
                "image":"http://openweathermap.org/img/wn/02d@2x.png"
            },
            "night":{
                "description":"Partly Cloudy",
                "image":"http://openweathermap.org/img/wn/02n@2x.png"
            }
        },
        "3":{
            "day":{
                "description":"Cloudy",
                "image":"http://openweathermap.org/img/wn/03d@2x.png"
            },
            "night":{
                "description":"Cloudy",
                "image":"http://openweathermap.org/img/wn/03n@2x.png"
            }
        },
        "45":{
            "day":{
                "description":"Foggy",
                "image":"http://openweathermap.org/img/wn/50d@2x.png"
            },
            "night":{
                "description":"Foggy",
                "image":"http://openweathermap.org/img/wn/50n@2x.png"
            }
        },
        "48":{
            "day":{
                "description":"Rime Fog",
                "image":"http://openweathermap.org/img/wn/50d@2x.png"
            },
            "night":{
                "description":"Rime Fog",
                "image":"http://openweathermap.org/img/wn/50n@2x.png"
            }
        },
        "51":{
            "day":{
                "description":"Light Drizzle",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Light Drizzle",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "53":{
            "day":{
                "description":"Drizzle",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Drizzle",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "55":{
            "day":{
                "description":"Heavy Drizzle",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Heavy Drizzle",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "56":{
            "day":{
                "description":"Light Freezing Drizzle",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Light Freezing Drizzle",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "57":{
            "day":{
                "description":"Freezing Drizzle",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Freezing Drizzle",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "61":{
            "day":{
                "description":"Light Rain",
                "image":"http://openweathermap.org/img/wn/10d@2x.png"
            },
            "night":{
                "description":"Light Rain",
                "image":"http://openweathermap.org/img/wn/10n@2x.png"
            }
        },
        "63":{
            "day":{
                "description":"Rain",
                "image":"http://openweathermap.org/img/wn/10d@2x.png"
            },
            "night":{
                "description":"Rain",
                "image":"http://openweathermap.org/img/wn/10n@2x.png"
            }
        },
        "65":{
            "day":{
                "description":"Heavy Rain",
                "image":"http://openweathermap.org/img/wn/10d@2x.png"
            },
            "night":{
                "description":"Heavy Rain",
                "image":"http://openweathermap.org/img/wn/10n@2x.png"
            }
        },
        "66":{
            "day":{
                "description":"Light Freezing Rain",
                "image":"http://openweathermap.org/img/wn/10d@2x.png"
            },
            "night":{
                "description":"Light Freezing Rain",
                "image":"http://openweathermap.org/img/wn/10n@2x.png"
            }
        },
        "67":{
            "day":{
                "description":"Freezing Rain",
                "image":"http://openweathermap.org/img/wn/10d@2x.png"
            },
            "night":{
                "description":"Freezing Rain",
                "image":"http://openweathermap.org/img/wn/10n@2x.png"
            }
        },
        "71":{
            "day":{
                "description":"Light Snow",
                "image":"http://openweathermap.org/img/wn/13d@2x.png"
            },
            "night":{
                "description":"Light Snow",
                "image":"http://openweathermap.org/img/wn/13n@2x.png"
            }
        },
        "73":{
            "day":{
                "description":"Snow",
                "image":"http://openweathermap.org/img/wn/13d@2x.png"
            },
            "night":{
                "description":"Snow",
                "image":"http://openweathermap.org/img/wn/13n@2x.png"
            }
        },
        "75":{
            "day":{
                "description":"Heavy Snow",
                "image":"http://openweathermap.org/img/wn/13d@2x.png"
            },
            "night":{
                "description":"Heavy Snow",
                "image":"http://openweathermap.org/img/wn/13n@2x.png"
            }
        },
        "77":{
            "day":{
                "description":"Snow Grains",
                "image":"http://openweathermap.org/img/wn/13d@2x.png"
            },
            "night":{
                "description":"Snow Grains",
                "image":"http://openweathermap.org/img/wn/13n@2x.png"
            }
        },
        "80":{
            "day":{
                "description":"Light Showers",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Light Showers",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "81":{
            "day":{
                "description":"Showers",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Showers",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "82":{
            "day":{
                "description":"Heavy Showers",
                "image":"http://openweathermap.org/img/wn/09d@2x.png"
            },
            "night":{
                "description":"Heavy Showers",
                "image":"http://openweathermap.org/img/wn/09n@2x.png"
            }
        },
        "85":{
            "day":{
                "description":"Light Snow Showers",
                "image":"http://openweathermap.org/img/wn/13d@2x.png"
            },
            "night":{
                "description":"Light Snow Showers",
                "image":"http://openweathermap.org/img/wn/13n@2x.png"
            }
        },
        "86":{
            "day":{
                "description":"Snow Showers",
                "image":"http://openweathermap.org/img/wn/13d@2x.png"
            },
            "night":{
                "description":"Snow Showers",
                "image":"http://openweathermap.org/img/wn/13n@2x.png"
            }
        },
        "95":{
            "day":{
                "description":"Thunderstorm",
                "image":"http://openweathermap.org/img/wn/11d@2x.png"
            },
            "night":{
                "description":"Thunderstorm",
                "image":"http://openweathermap.org/img/wn/11n@2x.png"
            }
        },
        "96":{
            "day":{
                "description":"Light Thunderstorms With Hail",
                "image":"http://openweathermap.org/img/wn/11d@2x.png"
            },
            "night":{
                "description":"Light Thunderstorms With Hail",
                "image":"http://openweathermap.org/img/wn/11n@2x.png"
            }
        },
        "99":{
            "day":{
                "description":"Thunderstorm With Hail",
                "image":"http://openweathermap.org/img/wn/11d@2x.png"
            },
            "night":{
                "description":"Thunderstorm With Hail",
                "image":"http://openweathermap.org/img/wn/11n@2x.png"
            }
        }
    },

});
