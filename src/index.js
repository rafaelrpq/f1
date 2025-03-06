const OpenF1 = {
  source: {
    drivers: "https://api.openf1.org/v1/drivers?session_key=latest",
    race_control: "https://api.openf1.org/v1/race_control?session_key=latest",
    team_radio: "https://api.openf1.org/v1/team_radio?session_key=latest&driver_number=",
    car_data: "https://api.openf1.org/v1/car_data?session_key=latest&driver_number=",


  },

  drivers: null,
  race_control: null,
  team_radio: null,

  get_data: async (url, signal = null) => {
    let response = await fetch(url, {signal});
    let data = await response.json();
    return data;
  },

  get_date: function () {
    let date = new Date().setSeconds(new Date().getSeconds() - 3);
    return (new Date (date).toISOString().slice(0, -1));
  },

  load_drivers: async () => {
    OpenF1.drivers = await OpenF1.get_data(OpenF1.source.drivers);
  },

  load_race_control: async (signal = null) => {
    OpenF1.race_control = await OpenF1.get_data(OpenF1.source.race_control, signal);
    OpenF1.race_control.reverse();
  },

  load_team_radio: async (driver_number) => {
    OpenF1.team_radio = await OpenF1.get_data(
      OpenF1.source.team_radio + driver_number,
    );
    OpenF1.team_radio.reverse();
  },
  
  load_car_data: async (driver_number, signal = null) => {
    
    let date = "&date>" + OpenF1.get_date();
    //console.log (date);
    OpenF1.car_data = await OpenF1.get_data (
      OpenF1.source.car_data + driver_number + date, signal
    );
    //console.log (OpenF1.source.car_data + driver_number + date)
    OpenF1.car_data.reverse();
  },

  create_driver_card: function (driver) {
    let card = document.createElement("card");
    card.classList.add("card");
    card.style.borderBottom = `.5rem solid #${driver.team_colour}`;

    // let img = document.createElement("span");
    // if (driver.headshot_url !== null)
    //   img.style.backgroundImage = "url(" + driver.headshot_url + ")";
    // img.classList.add("img");

    let img = new Image();
    img.src = driver.headshot_url;

    let content = document.createElement("div");
    content.classList.add("card-content");

    let content_driver = document.createElement("div");
    content_driver.classList.add("driver");

    let name = document.createElement("span");
    name.innerText = `${driver.first_name}`;

    let last_name = document.createElement("span");
    last_name.innerText = `${driver.last_name.toUpperCase()}`;
    last_name.style.color = `#${driver.team_colour}`; 

    let number = document.createElement("span");
    number.innerText = driver.driver_number;
    number.style.color = `#${driver.team_colour}`;
    number.classList.add("number");

    let nav = document.createElement("nav");

    let radio = document.createElement("a");
    radio.innerHTML = '<i class="ph-duotone ph-headset"></i>';
    radio.href = `javascript:void(0);`;
    radio.title = "Radio";
    radio.onclick = () => OpenF1.dialog_team_radio(driver);

    let car = document.createElement("a");
    car.innerHTML = '<i class="ph-duotone ph-steering-wheel"></i>';
    car.href = "javascript:void(0);";
    car.title = "Car";
    car.onclick = () => OpenF1.dialog_car_data(driver);

    let lap = document.createElement("a");
    lap.innerHTML = '<i class="ph-duotone ph-alarm"></i>';
    lap.href = "#";
    lap.title = "Lap";

    content_driver.append(name);
    name.append(last_name);

    content.appendChild(content_driver);
    content.appendChild(nav);

    nav.appendChild(radio);
    nav.appendChild(car);
    nav.appendChild(lap);

    card.append(number);
    card.appendChild(content);
    card.appendChild(img);

    return card;
  },

  dialog_team_radio: function (driver) {
    let radio = Dialog.create_dialog("Team Radio");

    radio.dialog.onclose = () => {
      //radio.dialog.remove();
    };

    let titulo = document.createElement("p");
    titulo.innerText = driver.full_name;
    radio.main.appendChild(titulo);

    OpenF1.load_team_radio(driver.driver_number).then(() => {

      if (OpenF1.team_radio.length === 0) {
        radio.main.innerText = 'Não há dados disponíveis';
        return;
      }

      OpenF1.team_radio.forEach((info) => {
        let audio = new Audio(info.recording_url);
        let label = document.createElement("label");
        let data = new Date(info.date);
        label.innerText = data.toLocaleTimeString();
        audio.controls = true;
        radio.main.appendChild(audio);
        radio.main.appendChild(label);
      });
    })
    .catch (error => {
      radio.main.innerHTML = error+'<p>Erro ao carregar os dados</p>';
    }).finally(() => {
      radio.loading.remove();
    });

    document.body.appendChild(radio.dialog);
    radio.dialog.showModal();
  },
  
  dialog_car_data: function (driver) {
    let car = Dialog.create_dialog("Car Data");
  
    car.dialog.onclose = () => {
      //car.dialog.remove();
    };
  
    let titulo = document.createElement("p");
    titulo.innerText = driver.full_name;
    car.main.appendChild(titulo);
  
    let pre = document.createElement("pre");
    car.main.append(pre);
    
    
    let tbl = document.createElement("table");
    
    let features = ["Speed", "Throttle", "Brake", "Gear", "RPM", "DRS"];

    for (let i=0; i<6; i++) {
      let tr = document.createElement("tr");
      let th = document.createElement("th");
      th.innerText = features[i];
      let td = document.createElement("td");
      tr.appendChild(th);
      tr.appendChild(td);
      tbl.appendChild(tr)
    }
    
    let td = tbl.querySelectorAll("td");

    abortSignal = new AbortController();
    const signal = abortSignal.signal;

    car.main.appendChild(tbl);
    tbl.style.display = "none";


    let throttle = document.createElement("meter");
    throttle.min = 0;
    throttle.max = 100;

    let brake = document.createElement("meter");
    brake.min = 0;
    brake.max = 100;
  
    let rpm = document.createElement("meter");
    rpm.min = 0;
    rpm.max = 15000;
    // rpm.low = 2500
    // rpm.high = 13000  
    // rpm.optimum = 10000

    td[1].append (throttle);
    td[2].append (brake);
    td[4].append (rpm);
    
    td[5].innerHTML = '<i class="ph-duotone ph-circle"></i>'

    loop = setInterval(() => {
      OpenF1.load_car_data(driver.driver_number, signal).then(() => {

        if (OpenF1.car_data.length === 0) {
          // car.main.innerText = 'Não há dados disponíveis';
         // return;
        }  
          let info = OpenF1.car_data[0]
          tbl.style.display = "block";

          td[0].innerText = info.speed;
          throttle.value = info.throttle;
          brake.value = info.brake;
          td[3].innerText = info.n_gear;
          rpm.value = info.rpm;
          td[5].className = (info.drs <= 1) ? 'drs_off' : (info.drs === 8) ? 'drs_avail' : (info.drs >= 10) ? 'drs_on' : 'drs_off';
      })
      .catch (error => {
         console.error (error,'Erro ao carregar os dados');
      }).finally(() => {
         car.loading.remove();
      });
    },857)
  
    document.body.appendChild(car.dialog);
    car.dialog.showModal();
  }
};


const main = document.querySelector("main");
const race_control = document.querySelector("aside div.info");

const options = {
  drivers: document.querySelector("#drivers"),
  race_control: document.querySelector("#race_control"),
};

const loading = document.createElement("div");
loading.className = "loading";

let loop;
let abortSignal = null;

options.drivers.addEventListener("click", () => {
  clear(main);
  clearInterval(loop);
  main.append(loading);
  menu.click();
  options.drivers.classList.add("active");

  if (abortSignal) {
    abortSignal.abort();
    abortSignal = null; // Limpa o controlador
  }
  
  OpenF1.load_drivers().then(() => {
    loading.remove();
    OpenF1.drivers.forEach((driver) => {
      let card = OpenF1.create_driver_card(driver);
      main.appendChild(card);
    });
  });
});

options.race_control.addEventListener("click", () => {
  clear(main);
  clearInterval(loop);
  main.append(loading);
  menu.click();
  options.race_control.classList.add("active");

  abortSignal = new AbortController();
  const signal = abortSignal.signal;

  loop = setInterval(() => {
    OpenF1.load_race_control(signal).then(() => {
      clear(main);
      OpenF1.race_control.forEach((info) => {
        main.innerHTML += `<p>${info.message}</p>`;
      });
    })
    .catch((AbortError) => {
      console.log('cancelado pelo AbortController');
    });
  }, 1000);
});

const menu = document.querySelector("header i");
const nav = document.querySelector("body nav");

menu.addEventListener("click", () => {
  menu.classList.toggle("ph-x");
  menu.classList.toggle("ph-list");
  nav.classList.toggle("show-nav");
  for (let i in options) {
    options[i].classList.remove("active");
  }
});

function clear(main) {
  main.innerHTML = "";
}

const Dialog = {
  dialog: document.createElement("dialog"),
  header: document.createElement("header"),
  main: document.createElement("main"),
  closeBtn: document.createElement("i"),
  loading: document.createElement("div"),

  create_dialog: (title) => {
    Dialog.header.innerText = title;
    Dialog.header.appendChild(Dialog.closeBtn);
    Dialog.dialog.appendChild(Dialog.header);

    Dialog.dialog.appendChild(Dialog.main);

    Dialog.loading.className = "loading";
    Dialog.main.appendChild(Dialog.loading);

    Dialog.closeBtn.classList.add("ph-bold", "ph-x");
    Dialog.closeBtn.onclick = () => {
      clear(Dialog.main);
      Dialog.dialog.close();
      if (abortSignal) {
        abortSignal.abort();
        abortSignal = null; // Limpa o controlador
        clearInterval(loop);
      }
    };

    return Dialog;
  },
};
