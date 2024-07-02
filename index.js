const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially vairables need????
//Basically jb site open hogi to ye dikhegi.
let oldTab = userTab;
//jo bhi site open hogi usme css properties add kr denge.
oldTab.classList.add("current-tab");

const API_KEY = "e30377dd830d2e34bcd15fdd1ca2b1b2";

//agr phle se corridinate present ho to direct UI pr render krke dikha dega.
getfromSessionStorage();

function switchTab(newTab) {
    //ab agr jis tab pr the usi pr click kra to kuch nhi agr different ho to ye kro.
    if(newTab != oldTab) {
        //phle to old tab se css property hta do.
        oldTab.classList.remove("current-tab");
        //ab old tab ,new tab k braber hi gya.
        oldTab = newTab;
        //isme same css bali properties add krdo.
        oldTab.classList.add("current-tab");


        //kya search form wala container is invisible, if yes then make it visible
        if(!searchForm.classList.contains("active")) {
            //and jo phle se visible unhe remove krdo.
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            //ise visible kra do.
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there to use UI pr show krao.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    //first-->check local corrdinate present h ?
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        //grant access bali UI dikha do.
        grantAccessContainer.classList.add("active");
    }
    else {
        //agr local corrdinate pde hai to use kro-->using API call
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

//ab corrdinate (latitude and logitude) hai to inf o show krao API call krke.
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        //ab data aa gya ab UI pr dalo un value ko.
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements --> optional chaining operator. 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}

//Get location --> geolocation API se krenge.
function getLocation() {
    //if support avaliable
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("Support Not available");
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    //session storage m store(set) kr denge.
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    //NOW UI pr dikhane k liye.
    fetchUserWeatherInfo(userCoordinates);

}

//agr corrdinate phle se nhi pde hote to grant access bala UI dikh rha hota.
const grantAccessButton = document.querySelector("[data-grantAccess]");
//now jb bhi ispe click kre to current location find out kro using geolocation API and session storage m save kra dena.
grantAccessButton.addEventListener("click", getLocation);



const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    //submit krne m jo bhi default method hai unhe hta do.
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})


async function fetchSearchWeatherInfo(city) {
    //loader ko active kra do mtlb dikha do.
    loadingScreen.classList.add("active");
    //purana jo bhi use bhi hta do.
    userInfoContainer.classList.remove("active");
    //grant access bala hi hta do.
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        // Check if the response status is 404
        if (response.status === 404) {
            loadingScreen.classList.remove("active");
            alert("City not found. Please enter a valid city name.");
            return;
        }

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        alert("An error occurred. Please try again.");
    }
}