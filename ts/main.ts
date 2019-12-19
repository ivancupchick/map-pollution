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

interface CoordArrayItem {
  coords: [number, number];
}

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

ymaps.ready(init);

function init(){
  let r = document.getElementById('radius');
  let c = document.getElementById('concentrat');
  let cof = document.getElementById('cofSpeedSpread');

  c.value = '1.0';
  r.value = '1.0';
  cof.value = '1.0';


  let myPlacemark,
      Map = new ymaps.Map("map", {
        center: [53.901596, 27.551975],
        zoom: 6
      });


  Map.events.add('click', function (e) {
    var coords = e.get('coords');

    // Если метка уже создана – просто передвигаем ее.
    if (myPlacemark) {
        myPlacemark.geometry.setCoordinates(coords);
    }
    // Если нет – создаем.
    else {
        myPlacemark = createPlacemark(coords);
        Map.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        myPlacemark.events.add('dragend', function () {
            getAddress(myPlacemark.geometry.getCoordinates());
        });
    }
    getAddress(coords);
  });

  function getAddress(coords) {
    myPlacemark.properties.set('iconCaption', 'поиск...');
    ymaps.geocode(coords).then(function (res) {
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
            });
    });
  }
    // Map.geoObjects
    //    .add(myGeoObject);


    Map.events.add('click', (e) => {
      let coords = e.get('coords');
      let weather = {};
      getStartCoords(coords, Map);
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
}

function makeFormat(forecast) {
  let weather = {};
  weather.temperature = (forecast.main.temp - 273.15).toFixed(0);
  return weather;
}

function getTwoPoints({ deg, speed }, coords, map) {
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

  console.log(coords);
  console.log(distance);

  // startPoint, direction, distance)

  // let coordSystem = new ICoordSystem();



  let rereerer1 = ymaps.coordSystem.geo.solveDirectProblem(coords, myFunction(1, 1, deg - 5, 1), distance);

  let rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, myFunction(1, 1, deg + 5, 1), distance);

  console.log(rereerer1, rereerer2)

  return [rereerer1.endPoint, rereerer2.endPoint];
}

function getOnePoints(deg, speed, coords, map) {
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

  console.log(coords);
  console.log(distance);

  // startPoint, direction, distance)

  // let coordSystem = new ICoordSystem();

  // const cooords1 = coords.map(coord => [...coord]);

  const rrrrrrrrrr = myFunction(1, 1, turn, 0.5);


  let rereerer1 = ymaps.coordSystem.geo.solveDirectProblem(coords, [rrrrrrrrrr[0].toFixed(3), rrrrrrrrrr[1].toFixed(3)], distance);

  // let rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, myFunction(1, 1, deg + 5, 1), distance);

  return [rereerer1.endPoint]; //rereerer2.endPoint
}

function myFunction(xCoord, yCoord, angle, length) {
  length = typeof length !== 'undefined' ? length : 10;
  angle = angle * Math.PI / 180; // if you're using degrees instead of radians

  const firs = (length * Math.cos(angle)) + xCoord;
  const secon = (length * Math.sin(angle)) + yCoord;
  return [firs, secon];
}

function check(value) {
  return typeof value === 'string' ? +value : value;
}

function createPoligon(coords1, coords2, coords3, coords4, color = '#00FF0088') {
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


function createPlacemark(coords) {
  return new ymaps.Placemark(coords, {
      // iconCaption: 'поиск...'
  }, {
      preset: 'islands#violetDotIconWithCaption',
      draggable: true
  });
}

function getStartCoords(coords, map) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords[0].toFixed(5)}&lon=${coords[1].toFixed(5)}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`)
    .then( request => request.json())
    .then( (request1) => {
      console.log(request1);

      // let wind = request.wind;

      // weather = makeFormat(request);
      // Map.balloon.open(coords, {
      //   contentHeader: weather.temperature
      // });

      let distance = request1.wind.speed * 15;

      coordsAndWinds1.push({
        coords: coords
      });
      coordsAndWinds2.push({
        coords: coords
      });

      console.log(coords);



      const ressss = getTwoPoints(request1.wind, coords, map);

      console.log(ressss);

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
      console.log(ressss);
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${ressss[0][0].toFixed(5)}&lon=${ressss[0][1].toFixed(5)}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`)
        .then(request => request.json())
        .then(request => {
          console.log(request);
          console.log(ressss);
          let distance = request.wind.speed * 15;
          console.log(request.wind, ressss, map);
          const s2 = getOnePoints(request.wind.deg, request.wind.speed, ressss[0], map);
          console.log(s2);
          coordsAndWinds1.push({
            coords: s2
          });
          return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0][0].toFixed(5)}&lon=${s2[0][0].toFixed(5)}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        })
        .then(request => request.json())
        .then(request => {
          let distance = request.wind.speed * 15;
          const s3 = getOnePoints(request.wind.deg, request.wind.speed, [request.coord.lon, request.coord.lat], map);
          coordsAndWinds1.push({
            coords: s3
          });
          coords1 = true;
          createPolygons(map);
          // return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0]}&lon=${s2[1]}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        });

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${ressss[1][0].toFixed(5)}&lon=${ressss[1][1].toFixed(5)}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`)
        .then(request => request.json())
        .then(request => {
          // let distance = request.wind.speed * 15;
          console.log(request.wind, ressss, map);
          const s2 = getOnePoints(request.wind.deg, request.wind.speed, ressss[1], map);
          coordsAndWinds2.push({
            coords: s2
          });

          console.log(s2);
          return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0][0].toFixed(5)}&lon=${s2[0][0].toFixed(5)}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        })
        .then(request => request.json())
        .then(request => {
          // let distance = request.wind.speed * 15;
          const s3 = getOnePoints(request.wind.deg, request.wind.speed, [request.coord.lon, request.coord.lat], map);
          coordsAndWinds1.push({
            coords: s3
          });
          coords2 = true;
          createPolygons();
          // return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0]}&lon=${s2[1]}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        });

      // map.geoObjects.add(createPoligon(coords, coords, ressss[0], ressss[1]));
    });
}

function createPolygons(map) {
  if (coords1 && coords2) {
    console.log(coordsAndWinds1, coordsAndWinds2);
    coordsAndWinds1.forEach((item, index, array) => {
      if (index === 0) {
        return;
      } else {
        const polygon = createPoligon(coordsAndWinds1[index - 1].coords, coordsAndWinds2[index - 1].coords, coordsAndWinds1[index], coordsAndWinds2[index], colors[index]);

        map.geoObjects.add(polygon);
      }
    })
  }
}

function getRegular(params) {

}


/*
{
"coord":{"lon":139.01,"lat":35.02},
"weather":[{"id":800,"main":"Clear",
"description":"clear sky","icon":"01n"}],
"base":"stations",
"main":{"temp":285.514,
"pressure":1013.75,"humidity":100,"temp_min":285.514,"temp_max":285.514,"sea_level":1023.22,"grnd_level":1013.75},"wind":{"speed":5.52,"deg":311},"clouds":{"all":0},"dt":1485792967,"sys":{"message":0.0025,"country":"JP","sunrise":1485726240,"sunset":1485763863},"id":1907296,"name":"Tawarano","cod":200}
*/
