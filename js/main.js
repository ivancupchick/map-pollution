var colors = [
    '#49db54',
    '#65c955',
    '#7bb453',
    '#95a75b',
    '#ab9156',
    '#c37f5c',
    '#da6d59',
    '#f15562'
];
ymaps.ready(init);
var coordsAndWinds1 = [
// {
//   coords: [0, 0],
//   wind: {
//     deg: 0,
//     speed: 0
//   }
// }
];
var coordsAndWinds2 = [
// {
// coords: [0, 0],
// wind: {
//   deg: 0,
//   speed: 0
// }
// }
];
var coords2 = false;
var coords1 = true;
function init() {
    var r = document.getElementById('radius');
    var c = document.getElementById('concentrat');
    var cof = document.getElementById('cofSpeedSpread');
    if (c && r && cof) {
        c.value = '1.0';
        r.value = '1.0';
        cof.value = '1.0';
    }
    var myPlacemark;
    var map = new ymaps.Map("map", {
        center: [53.901596, 27.551975],
        zoom: 6,
        type: "yandex#map"
    });
    map.events.add('click', function (e) {
        e = e;
        var event = e; // refactor that please
        var coordsFormE = event && event.get('coords');
        var coords = coordsFormE;
        // Если метка уже создана – просто передвигаем ее.
        if (myPlacemark && myPlacemark.geometry) {
            myPlacemark.geometry.setCoordinates(coords); // refactor
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
        var weather = {};
        setTimeout(function () {
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
    function getAddress(coords) {
        // myPlacemark.properties.set('iconCaption', 'поиск...');
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
function getTwoPoints(deg, speed, coords, map) {
    var turn = deg;
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
    var distance = speed * 15;
    // startPoint, direction, distance)
    // let coordSystem = new ICoordSystem();
    var rereerer1 = ymaps.coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(1, 1, deg - 5, 1), distance);
    var rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(1, 1, deg + 5, 1), distance);
    // console.log(rereerer1, rereerer2)
    return [rereerer1.endPoint, rereerer2.endPoint];
}
function getOnePoints(deg, speed, coords, map) {
    var turn = deg;
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
    var distance = speed * 15;
    // console.log(coords);
    // console.log(distance);
    // startPoint, direction, distance)
    // let coordSystem = new ICoordSystem();
    // const cooords1 = coords.map(coord => [...coord]);
    var rrrrrrrrrr = getVectorForAngle(1, 1, turn, 0.5);
    var rereerer1 = ymaps.coordSystem.geo.solveDirectProblem(coords, [rrrrrrrrrr[0].toFixed(3), rrrrrrrrrr[1].toFixed(3)], distance);
    // let rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, myFunction(1, 1, deg + 5, 1), distance);
    return rereerer1.endPoint; //rereerer2.endPoint
}
function getVectorForAngle(xCoord, yCoord, angle, length) {
    length = typeof length !== 'undefined' ? length : 10;
    angle = angle * Math.PI / 180; // if you're using degrees instead of radians
    var firs = (length * Math.cos(angle)) + xCoord;
    var secon = (length * Math.sin(angle)) + yCoord;
    return [firs, secon];
}
function check(value) {
    return typeof value === 'string' ? +value : value;
}
function createPoligon(coords1, coords2, coords3, coords4, color) {
    if (color === void 0) { color = '#00FF0088'; }
    return new ymaps.Polygon([
        // Указываем координаты вершин многоугольника.
        // Координаты вершин внешнего контура.
        [
            coords1.slice(),
            coords2.slice(),
            coords3.slice(),
            coords4.slice()
        ],
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
    // iconCaption: 'поиск...',
    }, {
        // preset: 'islands#violetDotIconWithCaption',
        draggable: true,
        pane: 'islands#violetDotIconWithCaption'
    });
}
function getStartCoords(coords, map) {
    getWeather(coords[0], coords[1])
        .then(function (request1) {
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
        var ressss = getTwoPoints(request1.wind.deg, request1.wind.speed, coords, map);
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
            .then(function (request) {
            // let distance = request.wind.speed * 15;
            var s2 = getOnePoints(request.wind.deg, request.wind.speed, ressss[0], map);
            coordsAndWinds1.push({
                coords: s2
            });
            return getWeather(s2[0], s2[1]);
        })
            .then(function (request) {
            // let distance = request.wind.speed * 15;
            var s3 = getOnePoints(request.wind.deg, request.wind.speed, [request.coord.lon, request.coord.lat], map);
            coordsAndWinds1.push({
                coords: s3
            });
            coords1 = true;
            createPolygons(map);
            // return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${s2[0]}&lon=${s2[1]}&appid=e409a8d16fd831b64ac77fa22ebc3d8e`);
        });
        getWeather(ressss[1][0], ressss[1][1])
            .then(function (request) {
            // let distance = request.wind.speed * 15;
            // console.log((request as any).wind, ressss, map);
            var s2 = getOnePoints(request.wind.deg, request.wind.speed, ressss[1], map);
            coordsAndWinds2.push({
                coords: s2
            });
            // console.log(s2);
            return getWeather(s2[0], s2[0]);
        })
            .then(function (request) {
            // let distance = request.wind.speed * 15;
            var s3 = getOnePoints(request.wind.deg, request.wind.speed, [request.coord.lon, request.coord.lat], map);
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
function createPolygons(map) {
    if (coords1 && coords2) {
        // console.log(coordsAndWinds1, coordsAndWinds2);
        coordsAndWinds1.forEach(function (item, index, array) {
            if (index === 0) {
                return;
            }
            else {
                var polygon = createPoligon(coordsAndWinds1[index - 1].coords, coordsAndWinds2[index - 1].coords, coordsAndWinds1[index].coords, coordsAndWinds2[index].coords); // colors[index]
                map.geoObjects.add(polygon);
            }
        });
        coords1 = false;
        coords2 = false;
    }
}
// function getRegular(params) {
// }
function getWeather(lat, lon) {
    return fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=e409a8d16fd831b64ac77fa22ebc3d8e")
        .then(function (request) { return request.json(); });
}
