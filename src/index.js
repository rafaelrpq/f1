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
        let card = document.createElement('card');
        card.classList.add('card');
        card.style.borderBottom = `.5rem solid #${driver.team_colour}`;
        
        let img = document.createElement('span');
        if (driver.headshot_url !== null)
            img.style.backgroundImage = "url("+ driver.headshot_url + ")";
        img.classList.add('img');
        
        let content = document.createElement('div');
        content.classList.add('card-content');
        
        let content_driver = document.createElement ('div');
        content_driver.classList.add('driver');

        let name = document.createElement ('span')
        name.innerText = driver.full_name;
        
        let number = document.createElement ('span')
        number.innerText = driver.driver_number;
        number.style.color = `#${driver.team_colour}`;
        number.classList.add('number');
    
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
        
        content.appendChild(content_driver);
        content.appendChild(nav);
        
        nav.appendChild(radio);
        nav.appendChild(car);
        nav.appendChild(lap);
        
        
        card.append (number)
        card.appendChild(content);
        card.appendChild(img);
    
        return card;
    },

    dialog_team_radio : function (driver) {
        let radio = Dialog.create_dialog ('Team Radio');        
        clear (radio.main)
        
        let titulo = document.createElement ('p');
        titulo.innerText = driver.full_name;    
        radio.main.appendChild(titulo);
               
        OpenF1.load_team_radio(driver.driver_number).then (()=>{
            radio.loading.remove ();
            

            OpenF1.team_radio.forEach (info => {
                let audio = new Audio(info.recording_url);
                let label = document.createElement ('label');
                let data = new Date(info.date);
                label.innerText = data.toLocaleTimeString();
                audio.controls = true;
                radio.main.appendChild (audio);
                radio.main.appendChild (label);
            })
        });

        document.body.appendChild(radio.dialog);
        radio.dialog.showModal();
    },

}

const main = document.querySelector('main');
const race_control = document.querySelector('aside div.info');

const options = {
    drivers : document.querySelector ('#drivers'),
    race_control : document.querySelector ('#race_control')
}

const loading = document.createElement ('div');
loading.className = 'loading';   

let loop;

options.drivers.addEventListener ('click', () => {
    clear (main);
    clearInterval (loop);
    main.append (loading);
    menu.click()
    options.drivers.classList.add ('active');
    OpenF1.load_drivers().then (()=>{
        loading.remove ()
        OpenF1.drivers.forEach(driver => {
            let card = OpenF1.create_driver_card(driver);
            main.appendChild(card);
        });
    });
})


options.race_control.addEventListener ( 'click', () => {
    clear (main);
    clearInterval (loop);
    main.append (loading);
    menu.click()
    options.race_control.classList.add ('active');
    loop = setInterval ( () => {
        OpenF1.load_race_control().then (()=>{
            clear(main); 
            OpenF1.race_control.forEach(info => {
                main.innerHTML += `<p>${info.message}</p>`
            });
        });
    } , 1000)
})

const menu = document.querySelector('header i');
const nav = document.querySelector('body nav');

menu.addEventListener ('click', () => {
    menu.classList.toggle ('ph-x')
    menu.classList.toggle ('ph-list')
    nav.classList.toggle ('show-nav');
    for (let i in options) {
        options[i].classList.remove ( 'active')
    }

})


function clear (main) {
    main.innerHTML = '';
}


const Dialog = {
    dialog    : document.createElement('dialog'),
    header    : document.createElement ('header'),
    main      : document.createElement ('main'),
    closeBtn  : document.createElement ('i'),
    loading   : document.createElement ('div'); 

    create_dialog : (title) => {
        Dialog.header.innerText = title;
        Dialog.header.appendChild(Dialog.closeBtn);
        Dialog.dialog.appendChild(Dialog.header);

        Dialog.dialog.appendChild(Dialog.main);

        Dialog.loading.className = 'loading';
        Dialog.main.appendChild(loading);
        
        Dialog.closeBtn.classList.add('ph-bold','ph-x');
        Dialog.closeBtn.onclick = () => {
            Dialog.dialog.remove();
            Dialog.dialog.close();
        }

        return Dialog;
    },
}