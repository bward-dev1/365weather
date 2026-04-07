const weatherBtn = document.getElementById('show-weather-btn');
const resultDiv = document.getElementById('weather-result');
const cityInput = document.getElementById('city-input');

// Maps Open-Meteo WMO codes to your specific SVG filenames
function getWeatherDetails(code) {
  const mapping = {
    0: { text: "Clear Sky", icon: "clear-day.svg" },
    1: { text: "Mainly Clear", icon: "partly-cloudy-day.svg" },
    2: { text: "Partly Cloudy", icon: "partly-cloudy-day.svg" },
    3: { text: "Overcast", icon: "overcast.svg" },
    45: { text: "Fog", icon: "fog.svg" },
    48: { text: "Rime Fog", icon: "fog.svg" },
    51: { text: "Light Drizzle", icon: "drizzle.svg" },
    53: { text: "Moderate Drizzle", icon: "partly-cloudy-day-drizzle.svg" },
    55: { text: "Dense Drizzle", icon: "drizzle.svg" },
    61: { text: "Slight Rain", icon: "partly-cloudy-day-rain.svg" },
    63: { text: "Moderate Rain", icon: "rain.svg" },
    65: { text: "Heavy Rain", icon: "rain.svg" },
    71: { text: "Slight Snow", icon: "partly-cloudy-day-snow.svg" },
    73: { text: "Moderate Snow", icon: "snow.svg" },
    75: { text: "Heavy Snow", icon: "snow.svg" },
    77: { text: "Snow Grains", icon: "snow.svg" },
    80: { text: "Slight Rain Showers", icon: "rain.svg" },
    81: { text: "Moderate Rain Showers", icon: "rain.svg" },
    82: { text: "Violent Rain Showers", icon: "rain.svg" },
    85: { text: "Slight Snow Showers", icon: "snow.svg" },
    86: { text: "Heavy Snow Showers", icon: "snow.svg" },
    95: { text: "Thunderstorm", icon: "thunderstorms.svg" },
    96: { text: "Thunderstorm with Hail", icon: "thunderstorms-day-rain.svg" },
    99: { text: "Heavy Thunderstorm", icon: "thunderstorms-2.svg" }
  };
  return mapping[code] || { text: "Cloudy", icon: "cloudy.svg" };
}

function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city.</p>";
    return;
  }

  resultDiv.innerText = "Searching...";

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(response => response.json())
    .then(geoData => {
      if (!geoData.results || geoData.results.length === 0) {
        resultDiv.innerHTML = "<p>City not found.</p>";
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Fetch weather using coordinates including weather_code
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code`;

      return fetch(url)
        .then(response => response.json())
        .then(weatherData => {
          const temp = weatherData.current.temperature_2m;
          const feelsLike = weatherData.current.apparent_temperature;
          const details = getWeatherDetails(weatherData.current.weather_code);

          resultDiv.innerHTML = `
            <h3>Weather in ${name}, ${country}</h3>
            <img src="${details.icon}" alt="${details.text}" class="weather-icon">
            <p><strong>${details.text}</strong></p>
            <p>Temperature: <strong>${temp}°C</strong></p>
            <p>Feels like: <strong>${feelsLike}°C</strong></p>
          `;
        });
    })
    .catch(error => {
      resultDiv.innerText = "Error loading weather.";
      console.error("Error:", error);
    });
}

weatherBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

