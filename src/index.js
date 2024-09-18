const OpenF1 = {
    source : {
        drivers : 'https://api.openf1.org/v1/drivers?session_key=latest',
        race_control : 'https://api.openf1.org/v1/race_control?session_key=latest',

    },

    drivers : null,
    race_control : null,

    get_data : async (url) => { 
        let response = await fetch(url);
        let data = await response.json()
        return data;
    },

    load_drivers : async () => {
        OpenF1.drivers = await OpenF1.get_data (OpenF1.source.drivers); 
    },
    
    load_race_control : async () => {
        OpenF1.race_control = await OpenF1.get_data (OpenF1.source.race_control); 
        OpenF1.race_control.reverse();
    },

    create_driver_card : function (driver) {
        let card = document.createElement('div');
        card.classList.add('card');
        
        let img = new Image();
        img.src = driver.headshot_url ?? 'res/user.png';
        img.style.backgroundColor = `#${driver.team_colour}`
        
        let content = document.createElement('div');
        content.classList.add('card-content');
        
        let content_driver = document.createElement ('div');
        content_driver.classList.add('driver');
        content_driver.innerText = driver.full_name;
        content_driver.style.backgroundImage = `linear-gradient(to right, #${driver.team_colour}, #fff)`
        
    
        let nav = document.createElement('nav');
        
        let radio = document.createElement ('a')
        radio.innerHTML = '<i class="ph-duotone ph-headset"></i>'
        radio.href = '#'
        radio.title = 'Radio'

        let car = document.createElement ('a')
        car.innerHTML = '<i class="ph-duotone ph-steering-wheel"></i>'
        car.href = '#'
        car.title = 'Car'

        let lap = document.createElement ('a')
        lap.innerHTML = '<i class="ph-duotone ph-alarm"></i>'
        lap.href = '#'
        lap.title = 'Lap'
    
    
        content.appendChild(content_driver);
        content.appendChild(nav);
    
        nav.appendChild(radio);
        nav.appendChild(car);
        nav.appendChild(lap);
    
    
        card.appendChild(img);
        card.appendChild(content);
    
        return card;
    }
}

const main = document.querySelector('main');
const aside = document.querySelector('aside');


OpenF1.load_drivers().then (()=>{
    OpenF1.drivers.forEach(driver => {
        let card = OpenF1.create_driver_card(driver);
        main.appendChild(card);
    });
});

OpenF1.load_race_control().then (()=>{
    OpenF1.race_control.forEach(info => {
        aside.innerHTML += `<p>${info.message}</p>`
    });
});