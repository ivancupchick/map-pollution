const colors = [
  '#49db54',
  '#65c955',
  '#7bb453',
  '#95a75b',
  '#ab9156',
  '#c37f5c',
  '#da6d59',
  '#f15562'
];

type InputElem = HTMLInputElement | null;

interface OpenWeatherMap {
  base: string; // 'model'
  clouds: {
    all: number;
  }
  cod: number;
  coord: {
    lat: number;
    lon: number;
  }
  dt: number;
  id: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  }
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  }
  timezone: number;
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string; // Clouds
  }[];
  wind: {
    deg: number;
    speed: number;
  }
}

interface CoordArrayItem {
  coords: [number, number];
}

ymaps.ready(init);

const coordsAndWinds1: CoordArrayItem[] = [
  // {
  //   coords: [0, 0],
  //   wind: {
  //     deg: 0,
  //     speed: 0
  //   }
  // }
];

const coordsAndWinds2: CoordArrayItem[] = [
  // {
  // coords: [0, 0],
  // wind: {
  //   deg: 0,
  //   speed: 0
  // }
// }
];



let coords2 = false;
let coords1 = true;



function init() {
  let r = document.getElementById('radius') as InputElem;
  let c = document.getElementById('concentrat') as InputElem;
  let cof = document.getElementById('cofSpeedSpread') as InputElem;

  if (c && r && cof) {
    c.value = '1.0';
    r.value = '1.0';
    cof.value = '1.0';
  }


  let myPlacemark: ymaps.Placemark;
  const map = new ymaps.Map("map", {
        center: [53.901596, 27.551975],
        zoom: 6,
        type: "yandex#map"
      });


  map.events.add('click', (e) => {
    e = e as ymaps.IEvent;
    let event: ymaps.IEvent | null = e as ymaps.IEvent; // refactor that please
    const coordsFormE = event && event.get('coords');

    const coords = (coordsFormE as [number, number]);

    // Если метка уже создана – просто передвигаем ее.
    if (myPlacemark && myPlacemark.geometry) {
        (myPlacemark.geometry as any).setCoordinates(coords); // refactor
    }
    // Если нет – создаем.
    else {
        myPlacemark = createPlacemark(coords);
        map.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        // myPlacemark.events.add('dragend', function () {
        //   if (myPlacemark.geometry) {
        //     getAddress((myPlacemark.geometry as any).getCoordinates() as [number, number]);
        //   }
        // });
    }

    // getAddress(coords);

    let weather = {};
    setTimeout(() => {
      getStartCoords(coords, map);
    }, 1000);

    // fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`)
    //   .then( request => request.json())
    //   .then( (request) => {
    //     console.log(request);

    //     // let wind = request.wind;

    //     weather = makeFormat(request);
    //     // Map.balloon.open(coords, {
    //     //   contentHeader: weather.temperature
    //     // });

    //     createRadius(request.wind, coords, Map);
    //   });
  });

  function getAddress(coords: [number, number]) { // refactor that please
    // myPlacemark.properties.set('iconCaption', 'поиск...');
    (ymaps as any).geocode(coords).then((res: { geoObjects: { get: (arg0: number) => any; }; }) => {
        var firstGeoObject = res.geoObjects.get(0);

        myPlacemark.properties
            .set({
                // Формируем строку с данными об объекте.
                iconCaption: [
                    // Название населенного пункта или вышестоящее административно-территориальное образование.
                    firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                    // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                    firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                ].filter(Boolean).join(', '),
                // В качестве контента балуна задаем строку с адресом объекта.
                balloonContent: firstGeoObject.getAddressLine()
            }, {});
    });
  }
    // Map.geoObjects
    //    .add(myGeoObject);
}

// function makeFormat(forecast) {
//   let weather = {};
//   weather.temperature = (forecast.main.temp - 273.15).toFixed(0);
//   return weather;
// }

function getTwoPoints(deg: number, speed: number, coords: [number, number], map: ymaps.Map): [[number, number], [number, number]] {
  let turn = deg;

  // let r = document.getElementById('radius');
  // console.log(r.value);
  // if (!r || !r.value) {
  //   alert('Введите радиус');
  // }
  // r = check(r);


  // let c = document.getElementById('concentrat');
  // console.log(c.value);
  // if (!c || !c.value) {
  //   alert('Введите концентрацию');
  // }
  // c = check(c);


  // let cof = document.getElementById('cofSpeedSpread');
  // console.log(cof.value);
  // if (!cof || !cof.value) {
  //   alert('Введите коэффициент');
  // }
  // cof = check(cof);


  let distance = speed * 15;

  // startPoint, direction, distance)

  // let coordSystem = new ICoordSystem();



  let rereerer1 = (ymaps as any).coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(1, 1, deg - 5, 1), distance);

  let rereerer2 = (ymaps as any).coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(1, 1, deg + 5, 1), distance);

  // console.log(rereerer1, rereerer2)

  return [rereerer1.endPoint, rereerer2.endPoint];
}

function getOnePoints(deg: number, speed: number, coords: [number, number], map: ymaps.Map): [number, number] {
  let turn = deg;

  // let r = document.getElementById('radius');
  // console.log(r.value);
  // if (!r || !r.value) {
  //   alert('Введите радиус');
  // }
  // r = check(r);


  // let c = document.getElementById('concentrat');
  // console.log(c.value);
  // if (!c || !c.value) {
  //   alert('Введите концентрацию');
  // }
  // c = check(c);


  // let cof = document.getElementById('cofSpeedSpread');
  // console.log(cof.value);
  // if (!cof || !cof.value) {
  //   alert('Введите коэффициент');
  // }
  // cof = check(cof);


  let distance = speed * 15;

  // console.log(coords);
  // console.log(distance);

  // startPoint, direction, distance)

  // let coordSystem = new ICoordSystem();

  // const cooords1 = coords.map(coord => [...coord]);

  const rrrrrrrrrr = getVectorForAngle(1, 1, turn, 0.5);


  let rereerer1: { endPoint: [number, number] } = (ymaps as any).coordSystem.geo.solveDirectProblem(coords, [rrrrrrrrrr[0].toFixed(3), rrrrrrrrrr[1].toFixed(3)], distance);

  // let rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, myFunction(1, 1, deg + 5, 1), distance);

  return rereerer1.endPoint; //rereerer2.endPoint
}

function getVectorForAngle(xCoord: number, yCoord: number, angle: number, length: number) {
  length = typeof length !== 'undefined' ? length : 10;
  angle = angle * Math.PI / 180; // if you're using degrees instead of radians

  const firs = (length * Math.cos(angle)) + xCoord;
  const secon = (length * Math.sin(angle)) + yCoord;
  return [firs, secon];
}

function check(value: string | number) {
  return typeof value === 'string' ? +value : value;
}

function createPoligon(coords1: [number, number], coords2: [number, number], coords3: [number, number], coords4: [number, number], color = '#00FF0088') {
  return new ymaps.Polygon([
    // Указываем координаты вершин многоугольника.
    // Координаты вершин внешнего контура.
    [
        [...coords1],
        [...coords2],
        [...coords3],
        [...coords4]
        // [55.75, 37.70],
        // [55.70, 37.70],
        // [55.70, 37.50]
    ],
    // Координаты вершин внутреннего контура.
    // [
    //     [55.75, 37.52],
    //     [55.75, 37.68],
    //     [55.65, 37.60]
    // ]
  ], {
      // Описываем свойства геообъекта.
      // Содержимое балуна.
      hintContent: "Многоугольник"
  }, {
      // Задаем опции геообъекта.
      // Цвет заливки.
      fillColor: color,
      // Ширина обводки.
      strokeWidth: 1
  });
}


function createPlacemark(coords: [number, number]) {
  return new ymaps.Placemark(coords, {
      // iconCaption: 'поиск...',
  }, {

      // preset: 'islands#violetDotIconWithCaption',
      draggable: true,
      pane: 'islands#violetDotIconWithCaption'
  });
}

function getStartCoords(coords: [number, number], map: ymaps.Map) {
  getWeather(coords[0], coords[1])
    .then( (request1: OpenWeatherMap) => {
      console.log(request1);

      // let wind = request.wind;

      // weather = makeFormat(request);
      // Map.balloon.open(coords, {
      //   contentHeader: weather.temperature
      // });

      // let distance = request1.wind.speed * 15;

      coordsAndWinds1.push({
        coords: coords
      });
      coordsAndWinds2.push({
        coords: coords
      });

      // console.log(coords);



      const ressss = getTwoPoints(request1.wind.deg, request1.wind.speed, coords, map);

      // console.log(ressss);

      coordsAndWinds1.push({
        coords: ressss[0]
      });
      coordsAndWinds2.push({
        coords: ressss[1]
      });
      // const nyPlacemark = createPlacemark(ressss[0]);
      // map.geoObjects.add(nyPlacemark);
      // // console.log(Map.geoObjects);

      // const nyPlacemark2 = createPlacemark(ressss[1]);
      // map.geoObjects.add(nyPlacemark2);

       // getOnePoints
      // console.log(ressss);
      getWeather(ressss[0][0], ressss[0][1])
        .then(request => {
          // let distance = request.wind.speed * 15;
          const s2 = getOnePoints(request.wind.deg, request.wind.speed, ressss[0], map);
          coordsAndWinds1.push({
            coords: s2
          });
          return getWeather(s2[0], s2[1]);
        })
        .then(request => {
          // let distance = request.wind.speed * 15;
          const s3 = getOnePoints(request.wind.deg, request.wind.speed, [request.coord.lon, request.coord.lat], map);
          coordsAndWinds1.push({
            coords: s3
          });
          coords1 = true;
          createPolygons(map);
          // return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0]}&lon=${s2[1]}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        });

      getWeather(ressss[1][0] ,ressss[1][1])
        .then(request => {
          // let distance = request.wind.speed * 15;
          // console.log((request as any).wind, ressss, map);
          const s2 = getOnePoints(request.wind.deg, request.wind.speed, ressss[1], map);
          coordsAndWinds2.push({
            coords: s2
          });

          // console.log(s2);
          return getWeather(s2[0], s2[0]);
        })
        .then(request => {
          // let distance = request.wind.speed * 15;
          const s3 = getOnePoints(request.wind.deg, request.wind.speed, [request.coord.lon, request.coord.lat], map);
          coordsAndWinds2.push({
            coords: s3
          });
          coords2 = true;
          createPolygons(map);
          // return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0]}&lon=${s2[1]}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        });

      // map.geoObjects.add(createPoligon(coords, coords, ressss[0], ressss[1]));
    });
}

function createPolygons(map: ymaps.Map) {
  if (coords1 && coords2) {
    // console.log(coordsAndWinds1, coordsAndWinds2);
    coordsAndWinds1.forEach((item, index, array) => {
      if (index === 0) {
        return;
      } else {
        const polygon = createPoligon(
          coordsAndWinds1[index - 1].coords,
          coordsAndWinds2[index - 1].coords,
          coordsAndWinds1[index].coords,
          coordsAndWinds2[index].coords,
          ); // colors[index]

        map.geoObjects.add(polygon);
      }
    });

    coords1 = false;
    coords2 = false;
  }
}

// function getRegular(params) {

// }

function getWeather(lat: number, lon: number): Promise<OpenWeatherMap> {
  return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`)
    .then(request => request.json())
}
