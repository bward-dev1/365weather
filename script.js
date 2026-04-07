const weatherBtn = document.getElementById('show-weather-btn');
const locationBtn = document.getElementById('my-location-btn');
const resultDiv = document.getElementById('weather-result');
const cityInput = document.getElementById('city-input');

// 1. Maps Open-Meteo WMO codes to your specific SVG filenames
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

// 2. Reusable function to fetch and display weather based on lat/lon
function fetchWeatherByCoords(lat, lon, name, country = "") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code`;

  return fetch(url)
    .then(response => response.json())
    .then(weatherData => {
      const temp = weatherData.current.temperature_2m;
      const feelsLike = weatherData.current.apparent_temperature;
      const details = getWeatherDetails(weatherData.current.weather_code);

      resultDiv.innerHTML = `
        <h3>Weather in ${name}${country ? ', ' + country : ''}</h3>
        <img src="${details.icon}" alt="${details.text}" class="weather-icon">
        <p><strong>${details.text}</strong></p>
        <p>Temperature: <strong>${temp}°C</strong></p>
        <p>Feels like: <strong>${feelsLike}°C</strong></p>
      `;
    })
    .catch(error => {
      resultDiv.innerText = "Error loading weather data.";
      console.error("Error:", error);
    });
}

// 3. Logic for the "Search" button (Geocoding)
function getWeatherBySearch() {
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
      fetchWeatherByCoords(latitude, longitude, name, country);
    })
    .catch(error => {
      resultDiv.innerText = "Error finding city.";
      console.error("Error:", error);
    });
}

// 4. Logic for the "My Location" button (GPS)
function getWeatherByGPS() {
  if (!navigator.geolocation) {
    resultDiv.innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    return;
  }

  resultDiv.innerText = "Locating...";

  // This triggers the browser's "Allow GPS" permission popup
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      // We label this "Current Location" as the API doesn't return a name for GPS coords
      fetchWeatherByCoords(lat, lon, "Your Current Location");
    },
    (error) => {
      let msg = "Unable to retrieve your location.";
      if (error.code === 1) msg = "Permission denied. Please allow location access.";
      resultDiv.innerHTML = `<p>${msg}</p>`;
    }
  );
}

// 5. Event Listeners
weatherBtn.addEventListener('click', getWeatherBySearch);

locationBtn.addEventListener('click', getWeatherByGPS);

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getWeatherBySearch();
});
