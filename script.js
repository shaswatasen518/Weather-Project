const apiKey = "94f3136c1cb122f1248b5a8928155b7b"; 

// DOM Elements

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

// Current weather
const temp = document.querySelector(".current-weather h2");
const desc = document.querySelector(".current-weather p:nth-child(3)");
const icon = document.querySelector(".Weather-icon img");
const dateEl = document.querySelector(".fa-calendar").parentElement;
const locationEl = document.querySelector(".fa-location").parentElement;

// Highlights
const humidityEl = document.getElementById("humidityval");
const pressureEl = document.getElementById("pressureval");
const visibilityEl = document.getElementById("visibilityval");
const windEl = document.getElementById("windspeedval");
const feelsLikeEl = document.getElementById("feelslikeval");

//  Sunrise / Sunset
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");


//  Format Time

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}


// Fetch Weather by City

async function getWeather(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();

        if (!res.ok) {
            alert("City not found");                        // Error Check res.ok - true or false
            return;
        }

        updateUI(data);
        getForecast(city);
        getAQI(data.coord.lat, data.coord.lon);            // lat-latitude and lon- longitude

    } catch (err) {
        console.error(err);
    }
}


// Fetch Forecast (5-day + hourly)

async function getForecast(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();

        const forecastContainer = document.querySelector(".day-forecast");
        forecastContainer.innerHTML = "";

        // 5-day forecast (every 8th item = 24h)

        for (let i = 0; i < data.list.length; i += 8) {                // 24 ÷ 3 = 8 entries per day
            const item = data.list[i];

            const div = document.createElement("div");
            div.classList.add("forecast-item");

            div.innerHTML = `
                <div class="icon-wraper">
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
                    <span>${Math.round(item.main.temp)}°C</span>
                </div>
                <p>${new Date(item.dt_txt).toLocaleDateString()}</p>
                <p>${item.weather[0].main}</p>                                              
            `;                                                                         // main- weather type - rain / cloud / haze etc

            forecastContainer.appendChild(div);
        }

        // Hourly forecast
        updateHourlyForecast(data);

    } catch (err) {
        console.error(err);
    }
}


// Hourly Forecast (next 24 hrs)

function updateHourlyForecast(data) {
    const container = document.querySelector(".hourly-forecast");
    if (!container) return;

    container.innerHTML = "";

    const hourlyData = data.list.slice(0, 8);

    hourlyData.forEach(item => {
        const time = new Date(item.dt_txt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <p>${time}</p>
             <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">                   
            <p>${Math.round(item.main.temp)}°C</p>
        `;                                                                                           //fill data

        container.appendChild(div);
    });
}

async function getAQI(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        const data = await res.json();

        updateAQI(data.list[0]);                    //  pass full object

    } catch (err) {
        console.error("AQI Error:", err);
    }
}

// Update UI

function updateUI(data) {
    temp.innerHTML = `${Math.round(data.main.temp)}°C`;
    desc.innerHTML = data.weather[0].description;

    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    dateEl.innerHTML = `<i class="fa-light fa-calendar"></i> ${new Date().toDateString()}`;
    locationEl.innerHTML = `<i class="fa-light fa-location"></i> ${data.name}`;

    // Highlights

    humidityEl.innerHTML = `${data.main.humidity}%`;
    pressureEl.innerHTML = `${data.main.pressure} hPa`;
    visibilityEl.innerHTML = `${data.visibility / 1000} km`;
    windEl.innerHTML = `${data.wind.speed} m/s`;
    feelsLikeEl.innerHTML = `${Math.round(data.main.feels_like)}°C`;

    // Sunrise & Sunset
    if (sunriseEl && sunsetEl) {
        sunriseEl.innerHTML = formatTime(data.sys.sunrise);
        sunsetEl.innerHTML = formatTime(data.sys.sunset);
    }
}


// Update AQI


function updateAQI(data) {
    const aqi = data.main.aqi;
    const aqiEl = document.querySelector(".air-index");

    let text = "";
    let color = "";

    switch (aqi) {
        case 1:
            text = "Good";
            color = "#4caf50";
            break;
        case 2:
            text = "Fair";
            color = "#8bc34a";
            break;
        case 3:
            text = "Moderate";
            color = "#ffc107";
            break;
        case 4:
            text = "Poor";
            color = "#ff9800";
            break;
        case 5:
            text = "Very Poor";
            color = "#f44336";
            break;
    }

    aqiEl.innerText = text;
    aqiEl.style.backgroundColor = color;
    aqiEl.style.color = "#000";

    // pollutants
    document.getElementById("pm25").innerText = data.components.pm2_5.toFixed(1);
    document.getElementById("pm10").innerText = data.components.pm10.toFixed(1);
    document.getElementById("co").innerText = data.components.co.toFixed(0);
    document.getElementById("no2").innerText = data.components.no2.toFixed(1);
}

// Get Weather by Location

function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );

        const data = await res.json();

        updateUI(data);
        getForecast(data.name);
        getAQI(latitude, longitude);
    });
}


// Events

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();                           // Trim Removes extra space

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    getWeather(city);
});

locationBtn.addEventListener("click", getLocationWeather);

// Enter key

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});