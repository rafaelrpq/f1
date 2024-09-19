const OpenF1 = {
    source : {
        drivers      : 'https://api.openf1.org/v1/drivers?session_key=latest',
        race_control : 'https://api.openf1.org/v1/race_control?session_key=latest',
        team_radio   : 'https://api.openf1.org/v1/team_radio?session_key=latest&driver_number=',
    },

    drivers : null,
    race_control : null,
    team_radio : null,

    get_data : async (url) => {
        console.log ("url ",url) 
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

    load_team_radio : async (driver_number) => {
        OpenF1.team_radio = await OpenF1.get_data (OpenF1.source.team_radio + driver_number); 
        OpenF1.team_radio.reverse();
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
        content_driver.style.backgroundImage = `linear-gradient(to right, #${driver.team_colour}, #fff)`

        let name = document.createElement ('span')
        name.innerText = driver.full_name;
        
        let number = document.createElement ('span')
        number.innerText = driver.driver_number;
        number.style.color = `#${driver.team_colour}`;
    
        let nav = document.createElement('nav');
        
        let radio = document.createElement ('a')
        radio.innerHTML = '<i class="ph-duotone ph-headset"></i>'
        radio.href = `javascript:void(0);`;
        radio.title = 'Radio'
        radio.onclick = () => OpenF1.dialog_team_radio(driver);
    

        let car = document.createElement ('a')
        car.innerHTML = '<i class="ph-duotone ph-steering-wheel"></i>'
        car.href = '#'
        car.title = 'Car'

        let lap = document.createElement ('a')
        lap.innerHTML = '<i class="ph-duotone ph-alarm"></i>'
        lap.href = '#'
        lap.title = 'Lap'
    
    
        content_driver.append (name)
        content_driver.append (number)

        content.appendChild(content_driver);
        content.appendChild(nav);
    
        nav.appendChild(radio);
        nav.appendChild(car);
        nav.appendChild(lap);
    
    
        card.appendChild(img);
        card.appendChild(content);
    
        return card;
    },

    dialog_team_radio : function (driver) {
        let dialog = document.createElement('dialog');

        let header = document.createElement ('header');
        header.innerText = 'Team Radio';

        let close = document.createElement ('i');
        close.classList.add('ph-duotone','ph-x-circle');
        close.onclick = () => {
            dialog.close();
            dialog.remove();
        }
        
        let dialog_main = document.createElement ('main');
        
        
        let titulo = document.createElement ('p');
        titulo.innerText = driver.full_name;
        
        let loading = document.createElement ('div');
        loading.className = 'loading';
        dialog_main.appendChild(loading);        
        
        OpenF1.load_team_radio(driver.driver_number).then (()=>{
            loading.remove ();
            
            OpenF1.team_radio.forEach (radio => {
                let audio = new Audio(radio.recording_url);
                audio.controls = true;
                dialog_main.appendChild (audio);
            })
        });

        dialog.appendChild(header);
        header.appendChild(close);

        dialog.appendChild(dialog_main);
        dialog_main.appendChild(titulo);

        document.body.appendChild(dialog);
        dialog.showModal();
    },

}

const main = document.querySelector('main');
const race_control = document.querySelector('aside div.info');


OpenF1.load_drivers().then (()=>{
    document.querySelector ('.loading').remove ()
    OpenF1.drivers.forEach(driver => {
        let card = OpenF1.create_driver_card(driver);
        main.appendChild(card);
    });
});

OpenF1.load_race_control().then (()=>{
    OpenF1.race_control.forEach(info => {
        race_control.innerHTML += `<p>${info.message}</p>`
    });
});


