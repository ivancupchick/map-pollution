const API_KEY = 'a2266dd2d09145f3da82a4194a6b4b14';

const colors = [
  '#49db54', // 0.00001 - 0.00004
  '#65c955', // 0.00004 - 0.0001
  '#7bb453', // 0.0001 - 0.0003
  '#95a75b', // 0.0003 - 0.0005
  '#ab9156', // 0.0005 - 0.001
  '#c37f5c', // 0.001 - 0.005
  '#da6d59', // 0.005 - 0.1
  '#f15562' // 0.1 - 5
];

function getColor(conc: number): string {
  if (conc > 0.1 && conc <= 5) {
    return colors[7];
  } else if (conc > 0.005 && conc <= 0.1) {
    return colors[6];
  } else if (conc > 0.001 && conc <= 0.005) {
    return colors[5];
  } else if (conc > 0.0005 && conc <= 0.001) {
    return colors[4];
  } else if (conc > 0.0003 && conc <= 0.0005) {
    return colors[3];
  } else if (conc > 0.0001 && conc <= 0.0003) {
    return colors[2];
  } else if (conc > 0.00004 && conc <= 0.0001) {
    return colors[1];
  } else if (conc > 0.00001 && conc <= 0.00004) {
    return colors[0];
  }

  return '#ffffff';
}

type Point = [number, number];
type InputElem = HTMLInputElement | null;

interface OpenWeatherMap extends OpenWeatherMapWind {
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
  // wind: {
  //   deg: number;
  //   speed: number;
  // }
}

interface OpenWeatherMapWind {
  wind: {
    deg: number;
    speed: number;
  }
}

interface CoordArrayItem {
  coords: Point;
  deg: number;
  conc: number;
}

let countOfRequest = 0;

setTimeout(() => {
  countOfRequest = 0;
  setTime();
}, 60000);

function setTime() {
  setTimeout(() => {
    countOfRequest = 0;
    setTime();
  }, 60000);
}

ymaps.ready(init);

let coordsAndWinds1: CoordArrayItem[] = [
  // {
  //   coords: [0, 0],
  //   wind: {
  //     deg: 0,
  //     speed: 0
  //   }
  // }
];

let coordsAndWinds2: CoordArrayItem[] = [
  // {
  // coords: [0, 0],
  // wind: {
  //   deg: 0,
  //   speed: 0
  // }
// }
];



let coords2 = false;
let coords1 = false;

let arrayForControllingCount: boolean[] = [];

let myPlacemark: ymaps.Placemark;

function clearMap(map: ymaps.Map, placemark?: ymaps.Placemark) {
  map.geoObjects.removeAll();
  if (placemark) {
    map.geoObjects.add(placemark);
  } else {
    myPlacemark = null;
  }
}

function init() {
  let r = document.getElementById('radius') as InputElem;
  let c = document.getElementById('concentrat') as InputElem;
  let cof = document.getElementById('cofSpeedSpread') as InputElem;

  if (c && r && cof) {
    c.value = '1.0';
    r.value = '1.0';
    cof.value = '1.0';
  }

  const map = new ymaps.Map("map", {
    center: [53.901596, 27.551975],
    zoom: 6,
    type: "yandex#map"
  });


  map.events.add('click', (e) => {
    e = e as ymaps.IEvent;
    let event: ymaps.IEvent | null = e as ymaps.IEvent; // refactor that please
    const coordsFormE = event && event.get('coords');

    const coords = (coordsFormE as Point);

    // Если метка уже создана – просто передвигаем ее.
    if (myPlacemark && myPlacemark.geometry) {
        (myPlacemark.geometry as any).setCoordinates(coords); // refactor
    } else {
      myPlacemark = new (ymaps.Placemark as any)(coords, {
          iconCaption: 'Точка загрязнения',
      }, {
        // preset: 'islands#violetDotIconWithCaption',
        draggable: true,
        // pane: 'islands#violetDotIconWithCaption'
      });
      // myPlacemark = createPlacemark(coords);
      map.geoObjects.add(myPlacemark); // it's not working;
      // Слушаем событие окончания перетаскивания на метке.
      // myPlacemark.events.add('dragend', function () {
      //   if (myPlacemark.geometry) {
      //     getAddress((myPlacemark.geometry as any).getCoordinates() as Point);
      //   }
      // });
    }

    clearMap(map, myPlacemark);

    // getAddress(coords);
  });

  const modelButton = document.getElementById('button-for-modulation');
  modelButton && modelButton.addEventListener('click', (e) => {
    if (myPlacemark) {
      clearMap(map, myPlacemark);

      const coords = (myPlacemark.geometry as any).getCoordinates();

      getStartCoords(coords, map);
    }
  });

  const clearButton = document.getElementById('button-for-clear');
  clearButton && clearButton.addEventListener('click', (e) => {
    map && clearMap(map);
  });

  function getAddress(coords: Point) { // refactor that please
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

function getTwoPoints(deg: number, speed: number, coords: Point, map: ymaps.Map, processer1: (value: number) => number, processer2: (value: number) => number): [Point, Point] {
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


  let distance = speed * 15 * 60;

  // startPoint, direction, distance)

  // let coordSystem = new ICoordSystem();



  // (map.options as any).get('projection').getCoordSystem()
  let rereerer1 = (ymaps as any).coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(processer1(deg)), distance);
  let rereerer2 = (ymaps as any).coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(processer2(deg)), distance);

  // console.log(rereerer1, rereerer2)

  // map.geoObjects.add( new (ymaps as any).Placemark(rereerer1.endPoint, {
  //   iconCaption: 'поиск...',
  // }, {

  //   // preset: 'islands#violetDotIconWithCaption',
  //   draggable: true,
  //   pane: 'islands#violetDotIconWithCaption'
  // }));

  // map.geoObjects.add( new (ymaps as any).Placemark(rereerer2.endPoint, {
  //   iconCaption: 'поиск...',
  // }, {

  //   // preset: 'islands#violetDotIconWithCaption',
  //   draggable: true,
  //   pane: 'islands#violetDotIconWithCaption'
  // }));

  return [rereerer1.endPoint, rereerer2.endPoint];
}

function getOnePoints(deg: number, speed: number, coords: Point, map: ymaps.Map, processer: (r: number) => number): Point {
  let turn = deg;
  let distance = speed * 15 * 60;

  // console.log(coords);
  // console.log(distance);

  // startPoint, direction, distance)

  // let coordSystem = new ICoordSystem();

  // const cooords1 = coords.map(coord => [...coord]);

  const rrrrrrrrrr = getVectorForAngle(processer(turn));



  let rereerer1: { endPoint: Point } = (ymaps as any).coordSystem.geo.solveDirectProblem(coords, [rrrrrrrrrr[0], rrrrrrrrrr[1]], distance);

  // map.geoObjects.add( new (ymaps.Placemark as any)(rereerer1.endPoint, {
  //   iconCaption: 'поиск...',
  // }, {

  //   // preset: 'islands#violetDotIconWithCaption',
  //   draggable: true,
  //   pane: 'islands#violetDotIconWithCaption'
  // }));

  // let rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, myFunction(1, 1, deg + 5, 1), distance);

  return rereerer1.endPoint; //rereerer2.endPoint
}

function getVectorForAngle(angle: number) {
  // console.log('----');
  // console.log(angle);
  const az1 = angle * Math.PI / 180;

  // console.log(az1);
  // console.log('----');

  const dir1 = [Math.sin(az1), Math.cos(az1)];

  // console.log('----');
  // console.log(dir1);
  // console.log('----');

  return dir1;


  // length = typeof length !== 'undefined' ? length : 10;
  // angle = angle * Math.PI / 180; // if you're using degrees instead of radians

  // const firs = (length * Math.cos(angle)) + xCoord;
  // const secon = (length * Math.sin(angle)) + yCoord;
  // return [firs, secon];
}

function check(value: string | number) {
  return typeof value === 'string' ? +value : value;
}

function createStepConusPoligon(coords1: Point, coords2: Point, coords3: Point, coords4: Point, color = '#00FF0088') {
  if (color.length < 9) {
    color += '88';
  }

  return new ymaps.Polygon([
    // Указываем координаты вершин многоугольника.
    // Координаты вершин внешнего контура.
    [
        [...coords1],
        [...coords3],
        [...coords4],
        [...coords2],

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
      strokeColor: color.slice(0, -2),
      // Ширина обводки.
      strokeWidth: 1
  });
}

function createPoligon(coords: Point[], color = '#00FF0088') {
  if (color.length < 9) {
    color += '88';
  }

  return new ymaps.Polygon([
    // Указываем координаты вершин многоугольника.
    // Координаты вершин внешнего контура.
    [
      ...coords
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
      strokeColor: color.slice(0, -2),
      strokeWidth: 1
  });
}


const createPlacemark = (coords: Point) => {
  return new (ymaps.Placemark as any)(coords, {
      iconCaption: 'поиск...',
  }, {
      // preset: 'islands#violetDotIconWithCaption',
      draggable: true,
      pane: 'islands#violetDotIconWithCaption'
  });
}

function getStartCoords(coords: Point, map: ymaps.Map) {
  // comment this if for test
  // if (countOfRequest > 58) {
  //   return;
  // }

  getWeather(coords[0], coords[1])
    .then( (request1: OpenWeatherMap) => {

      countOfRequest += 1;

      // weather = makeFormat(request);
      // Map.balloon.open(coords, {
      //   contentHeader: weather.temperature
      // });

      const concInStartPosition: number = +(document.getElementById('concentrat') as HTMLInputElement).value
      const cofSpeedSpreadF: number = +(document.getElementById('cofSpeedSpread') as HTMLInputElement).value

      coordsAndWinds1.push({
        coords: coords,
        deg: request1.wind.deg,
        conc: concInStartPosition
      });
      coordsAndWinds2.push({
        coords: coords,
        deg: request1.wind.deg,
        conc: concInStartPosition
      });

      const ressss = getTwoPoints(request1.wind.deg, request1.wind.speed, coords, map, (r) => (r - 10), (r) => (r + 10));

      const conc1 = 4;
      const conc2 = 4;

      coordsAndWinds1.push({
        coords: ressss[0],
        deg: request1.wind.deg,
        conc: calculateConc(coordsAndWinds1, ressss[0], concInStartPosition, request1.wind.speed, cofSpeedSpreadF)
      });
      coordsAndWinds2.push({
        coords: ressss[1],
        deg: request1.wind.deg,
        conc: calculateConc(coordsAndWinds2, ressss[1], concInStartPosition, request1.wind.speed, cofSpeedSpreadF)
      });
      // const nyPlacemark = createPlacemark(ressss[0]);
      // map.geoObjects.add(nyPlacemark);

      // const nyPlacemark2 = createPlacemark(ressss[1]);
      // map.geoObjects.add(nyPlacemark2);

      getPromiseWeather(coordsAndWinds1, [ressss[0][0] ,ressss[0][1]], map, arrayForControllingCount, (r) => (r - 10), concInStartPosition, cofSpeedSpreadF);
      getPromiseWeather(coordsAndWinds2, [ressss[1][0] ,ressss[1][1]], map, arrayForControllingCount, (r) => (r + 10), concInStartPosition, cofSpeedSpreadF);
    });
}

function getPromiseWeather(array: CoordArrayItem[], [lat, lon]: Point, map, controlArrayObject: boolean[], setOffset: (value: number) => number, concInStartPosition: number, cofSpeedSpreadF) {
  if (array.length === 28 || countOfRequest > 58) {
    controlArrayObject.push(true);

    let distanceFromStart = null;

    if (arrayForControllingCount.length === 2) {
      distanceFromStart = (ymaps as any).coordSystem.geo.getDistance(coordsAndWinds2[coordsAndWinds2.length - 1].coords, coordsAndWinds1[coordsAndWinds1.length - 1].coords);
    }

    createPolygons(map, distanceFromStart);

    countOfRequest = 0; // for test
    return;
  }

  countOfRequest++;



  return getWeather(lat, lon)
    .then(request => {
      const s2 = getOnePoints(request.wind.deg, request.wind.speed, [lat, lon], map, setOffset);
      array.push({
        coords: s2,
        deg: request.wind.deg,
        conc: calculateConc(array, s2, concInStartPosition, request.wind.speed, cofSpeedSpreadF)
      });

      return getPromiseWeather(array, s2, map, controlArrayObject, setOffset, concInStartPosition, cofSpeedSpreadF);
    })
}

function calculateConc(array: CoordArrayItem[], currentPoint: Point, concInStartPosition: number, windSpeed: number, cofSpeedSpreadF: number) {
  const distanceFromStart = (ymaps as any).coordSystem.geo.getDistance(array[0].coords, currentPoint);

  let d: number;
  if (windSpeed <= 0.5) {
    d = 5.7;
  } else if (windSpeed <= 2 && windSpeed > 0.5) {
    d = 11.4 * windSpeed;
  } else if (windSpeed > 2) {
    d = 16 * Math.sqrt(windSpeed);
  }

  const xM = ((5 - cofSpeedSpreadF) / 4) * d * 2;

  // console.log(distanceFromStart);

  let s = 1;

  let cofX = distanceFromStart / xM;

  if (cofX <= 1) {
    s = (3 * Math.pow(cofX, 4)) - (8 * Math.pow(cofX, 3)) + (6 * Math.pow(cofX, 2))
  } else if (cofX > 1 && cofX <= 8) {
    s = 1.13 / ((0.13 * Math.pow(cofX, 2)) + 1);
  } else if (cofX > 8) {
    if (cofSpeedSpreadF <= 1.5) {
      s = cofX / ((3.58 * Math.pow(cofX, 2)) - (35.2 * cofX) + 120);
    } else if (cofSpeedSpreadF > 1.5) {
      s = 1 / ((0.1 * Math.pow(cofX, 2)) + (2.47 * cofX) - 17.8);
    }
  }

  // console.log(concInStartPosition * s);

  return concInStartPosition * s;
}

function createPolygons(map: ymaps.Map, distance: number) {
  if (arrayForControllingCount.length === 2) { // hard
    coordsAndWinds1.forEach((item, index, array) => {
      if (index === 0 || !coordsAndWinds2[index] || !coordsAndWinds1[index]) {
        return;
      } else {
        // console.log(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc);
        const polygon = createStepConusPoligon(
          coordsAndWinds1[index - 1].coords,
          coordsAndWinds2[index - 1].coords,
          coordsAndWinds1[index].coords,
          coordsAndWinds2[index].coords,
          getColor(Math.max(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc))
        ); // colors[index]

        map.geoObjects.add(polygon);
      }

      if (index === (array.length - 1) || (!coordsAndWinds2[index + 1] || !coordsAndWinds1[index + 1])) {
        const coordsOfPoint1 = coordsAndWinds1[index].coords;
        const coordsOfPoint2 = coordsAndWinds2[index].coords;

        const angleOfPoint1 = coordsAndWinds1[index].deg;
        const angleOfPoint2 = coordsAndWinds2[index].deg;

        const coordsOfCenter: Point = [ (coordsOfPoint1[0] + coordsOfPoint2[0]) / 2, (coordsOfPoint1[1] + coordsOfPoint2[1]) / 2 ];

        // map.balloon.open(coordsOfCenter, {
        //   contentHeader: '1111111'
        // });

        const angle = ((angleOfPoint1 - 10) + (angleOfPoint2 + 10)) / 2

        console.log(distance / 10);

        const endPoint: Point = (ymaps as any).coordSystem.geo.solveDirectProblem(coordsOfCenter, getVectorForAngle(angle), distance / 6).endPoint;

        const polygon = createPoligon([coordsOfPoint1, coordsOfPoint2, endPoint], getColor(Math.max(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc)));
        map.geoObjects.add(polygon);
      }
    });

    arrayForControllingCount = []; // hard

    coordsAndWinds1 = []; // hard
    coordsAndWinds2 = []; // hard
  }
}

let degStart = 127;
let speedStart = 4.68;

function getWeather(lat: number, lon: number): Promise<OpenWeatherMapWind> {

  // return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
  //   .then(request => request.json());

  return new Promise((resolve, reject) => { // for test
    const newWindData: OpenWeatherMapWind = {
      wind: {
        deg: degStart++,
        speed: speedStart
      }
    };

    speedStart += 0.1;

    resolve(newWindData);
  });
}

// function getAreaCoord(point, azimut, corner, length): Point[] { // получение координат сектора
//   var sector = [];
//   var firstSide = Math.PI * ((360 - azimut) + 90) / 180, // азимут в радианах
//   secondSide = firstSide - (Math.PI * corner / 180),
//   dir2 = [Math.sin(firstSide), Math.cos(firstSide)]; // направление по азимуту
//   sector[0] = (ymaps as any).coordSystem.geo.solveDirectProblem(point, dir2, length).endPoint;
//   var i = 1;
//   for(var sectopPoint = 5; sectopPoint <= corner; sectopPoint += 5) {
//   var middlePoint = sectopPoint;
//   var side = firstSide - (Math.PI * middlePoint / 180);
//   var dir4 = [Math.sin(side), Math.cos(side)];
//   sector[i] = (ymaps as any).coordSystem.geo.solveDirectProblem(point, dir4, length).endPoint;
//     i++
//   }
//   return sector;
// }
