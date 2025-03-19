const OpenF1 = {
  source: {
    drivers: "https://api.openf1.org/v1/drivers?session_key=latest",
    race_control: "https://api.openf1.org/v1/race_control?session_key=latest",
    team_radio: "https://api.openf1.org/v1/team_radio?session_key=latest&driver_number=",
    car_data: "https://api.openf1.org/v1/car_data?session_key=latest&driver_number=",
    weather: "https://api.openf1.org/v1/weather?session_key=latest",
  },

  drivers: null,
  race_control: null,
  team_radio: null,
  weather: null,

  get_data: async (url) => {
    let response = await fetch(url);
    let data = await response.json();
    return data;
  },


  load_drivers: async () => {
    OpenF1.drivers = await OpenF1.get_data(OpenF1.source.drivers);
  },

  load_race_control: async () => {
    OpenF1.race_control = await OpenF1.get_data(OpenF1.source.race_control);
    OpenF1.race_control.reverse();
  },

  load_team_radio: async (driver_number) => {
    OpenF1.team_radio = await OpenF1.get_data(
      OpenF1.source.team_radio + driver_number,
    );
    OpenF1.team_radio.reverse();
  },
  
  load_car_data: async (driver_number) => {
    
    let date = "&date>" + get_date();
    //console.log (date);
    OpenF1.car_data = await OpenF1.get_data (
      OpenF1.source.car_data + driver_number + date
    );
    //console.log (OpenF1.source.car_data + driver_number + date)
    OpenF1.car_data.reverse();
  },

  load_weather: async () => {
    OpenF1.weather = await OpenF1.get_data(
      OpenF1.source.weather,
    );
    OpenF1.weather.reverse();
  },

  init : async () => {
    await OpenF1.load_race_control().then (console.log ('race_control carregado'))
    await OpenF1.load_drivers().then(console.log ('drivers carregado'))
  }
}


Driver_Card = {
  create: (driver) => {
    let card = document.createElement("div");
    card.classList.add("driver");
    card.innerHTML = `
        <div class="number" style="color: #${driver.team_colour}">${driver.driver_number}</div>
        <div class="name">${driver.full_name}</div>
        <img src="${driver.headshot_url}" />
    `;
    card.addEventListener ('click', () => {
      loading ()
      dialog = create_dialog (driver.full_name, )
      document.body.appendChild (dialog)
      dialog.showModal()
      

      OpenF1.load_team_radio(driver.driver_number).then (()=>{
        let bar = document.querySelector('#loading')
        if (bar) bar.remove()
      });
    })
    return card;
  },
};


OpenF1.init().then( () => {
  setInterval ( ()=> {
    OpenF1.load_race_control()
    document.querySelector ('footer span').innerText = OpenF1.race_control[0].message;
 
  }, 1000)
  
  setInterval ( ()=> {
    OpenF1.load_weather()
    let icon = (OpenF1.weather[0].rainfall == 0) ? '<i class="ph-duotone ph-cloud-sun"></i>' : '<i class="ph-duotone ph-cloud-rain"></i>'
    document.querySelector ('header span').innerHTML = icon;
 
  }, 1000)

  OpenF1.drivers.forEach(driver => {
    document.querySelector("main").appendChild(Driver_Card.create(driver));
  })
})

function loading () {
  let div = document.createElement ('div')
  div.classList.add ('loading');
  div.setAttribute ('id', 'loading');
  document.querySelector ('body main').appendChild (div);
}

function get_date () {
  let date = new Date().setSeconds(new Date().getSeconds() - 4);
  return (new Date (date).toISOString().slice(0, -1));
}

const Icon = {
  CLOSE : 'ph-x',
  RADIO : 'ph-headset',

}
  
function create_dialog (title) {
  let dialog = document.createElement ('dialog');
  let header = document.createElement ('header');
  let main   = document.createElement ('main');
  let btn    = document.createElement ('i');
  let icon   = document.createElement ('i');


  icon.classList.add ('ph');
  icon.classList.add (Icon.RADIO);

  header.appendChild(icon);
  // header.innerText = title;
  header.appendChild (btn);
  
  btn.classList.add ('ph');
  btn.classList.add (Icon.CLOSE);
  
  dialog.appendChild (header);
  dialog.appendChild (main);

  btn.addEventListener ('click', () => {
    dialog.close();
    dialog.remove();
  })

  return dialog;
}

