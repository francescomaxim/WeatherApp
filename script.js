const apiKey = '7ae2efad2b828e477d4dc2bc0ec945b3';

const bigContainer = document.querySelector('.bigcontainer');
const notFoundContainer = document.querySelector('.bclass');
const searchingContainer = document.querySelector('.aclass');

const myInput = document.getElementById("searchcity");
const myButton = document.getElementById("search");
const citySection = document.querySelector(".location");
const weatherSection = document.querySelector(".weather");
const humiditySection = document.querySelector(".humidity");
const mainImg = document.getElementById("mainImg");
const date = document.getElementById('currentD');
const nextWeathers = document.querySelector('.forecastcontainer');

myButton.addEventListener('click', () => {
    if(myInput.value.trim() != ''){
        weather(myInput.value);
        myInput.value = '';
        myInput.blur();
    }
});

myButton.addEventListener('keydown', (event) => {
    if(event.key == 'Enter'){
        if(myInput.value.trim() != ''){
            weather(myInput.value);
            myInput.value = '';
            myInput.blur();
        }
    }
});

function showDisplayContainer(container){
    [searchingContainer, notFoundContainer, bigContainer]
    .forEach(container => container.style.display = 'none');
    container.style.display = 'block';
}

async function weather(city){
    const data = await getFetchData('weather', city);
    if(data.cod != 200){
        showDisplayContainer(notFoundContainer);
        return
    }

    showDisplayContainer(bigContainer);

    const {
        name : country,
        main : {
            temp, humidity
        },
        weather : [{id, main}],
        wind : speed
    } = data;
    citySection.querySelector('h1').innerHTML = country;
    const tempeture = Math.round(Number(temp));
    weatherSection.querySelector('h1').innerHTML = tempeture + "°C";
    weatherSection.querySelector('h2').innerHTML = main;
    humiditySection.querySelector('h3').innerHTML = "Humidity<br>" + humidity + "%";
    mainImg.src = `assets/weather/${getWeatherIcon(id)}`;
    document.getElementById("windspeed").innerHTML = "Wind Speed<br>" + speed.speed + "M/s";
    date.innerText = getCurrentDate();

    await updateForecastsInfo(city);
}

async function updateForecastsInfo(city){
    const forecastData = await getFetchData('forecast', city);

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    nextWeathers.innerHTML = '';
    forecastData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)){
            updateForecastItems(forecastWeather);
        }
    });
    
}

function updateForecastItems(forecastWeather){
    const {
        dt_txt: date,
        weather: [{ id }],
        main: {temp}
    } = forecastWeather;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }

    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecastitem">
                <h3>${dateResult} | ${Math.round(temp)} °C</h5>
                <img src="assets/weather/${getWeatherIcon(id)}">
        </div>
    `;

    nextWeathers.insertAdjacentHTML('beforeend', forecastItem);
}

async function getFetchData(endPoint, city){
    const url = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    return response.json();
}

function getWeatherIcon(id){
    if(id <= 232) return 'thunderstorm.svg';
    if(id <= 321) return 'drizzle.svg';
    if(id <= 531) return 'rain.svg';
    if(id <= 622) return 'snow.svg';
    if(id <= 781) return 'atmosphere.svg';
    if(id <= 800) return 'clear.svg';
    else return 'clouds.svg';
}

function getCurrentDate(){
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('en-GB', options);
}