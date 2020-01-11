const API_KEY = 'a2266dd2d09145f3da82a4194a6b4b14';
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
function getColor(conc) {
    if (conc > 0.1 && conc <= 5) {
        return colors[7];
    }
    else if (conc > 0.005 && conc <= 0.1) {
        return colors[6];
    }
    else if (conc > 0.001 && conc <= 0.005) {
        return colors[5];
    }
    else if (conc > 0.0005 && conc <= 0.001) {
        return colors[4];
    }
    else if (conc > 0.0003 && conc <= 0.0005) {
        return colors[3];
    }
    else if (conc > 0.0001 && conc <= 0.0003) {
        return colors[2];
    }
    else if (conc > 0.00004 && conc <= 0.0001) {
        return colors[1];
    }
    else if (conc > 0.00001 && conc <= 0.00004) {
        return colors[0];
    }
    return '#ffffff';
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
let coordsAndWinds1 = [];
let coordsAndWinds2 = [];
let coords2 = false;
let coords1 = false;
let arrayForControllingCount = [];
let myPlacemark;
function clearMap(map, placemark) {
    map.geoObjects.removeAll();
    if (placemark) {
        map.geoObjects.add(placemark);
    }
    else {
        myPlacemark = null;
    }
}
function init() {
    let r = document.getElementById('radius');
    let c = document.getElementById('concentrat');
    let cof = document.getElementById('cofSpeedSpread');
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
        e = e;
        let event = e;
        const coordsFormE = event && event.get('coords');
        const coords = coordsFormE;
        if (myPlacemark && myPlacemark.geometry) {
            myPlacemark.geometry.setCoordinates(coords);
        }
        else {
            myPlacemark = new ymaps.Placemark(coords, {
                iconCaption: 'Точка загрязнения',
            }, {
                draggable: true,
            });
            map.geoObjects.add(myPlacemark);
        }
        clearMap(map, myPlacemark);
    });
    const modelButton = document.getElementById('button-for-modulation');
    modelButton && modelButton.addEventListener('click', (e) => {
        if (myPlacemark) {
            clearMap(map, myPlacemark);
            const coords = myPlacemark.geometry.getCoordinates();
            getStartCoords(coords, map);
        }
    });
    const clearButton = document.getElementById('button-for-clear');
    clearButton && clearButton.addEventListener('click', (e) => {
        map && clearMap(map);
    });
    function getAddress(coords) {
        ymaps.geocode(coords).then((res) => {
            var firstGeoObject = res.geoObjects.get(0);
            myPlacemark.properties
                .set({
                iconCaption: [
                    firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                    firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                ].filter(Boolean).join(', '),
                balloonContent: firstGeoObject.getAddressLine()
            }, {});
        });
    }
}
function getTwoPoints(deg, speed, coords, map, processer1, processer2) {
    let turn = deg;
    let distance = speed * 15 * 60;
    let rereerer1 = ymaps.coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(processer1(deg)), distance);
    let rereerer2 = ymaps.coordSystem.geo.solveDirectProblem(coords, getVectorForAngle(processer2(deg)), distance);
    return [rereerer1.endPoint, rereerer2.endPoint];
}
function getOnePoints(deg, speed, coords, map, processer) {
    let turn = deg;
    let distance = speed * 15 * 60;
    const rrrrrrrrrr = getVectorForAngle(processer(turn));
    let rereerer1 = ymaps.coordSystem.geo.solveDirectProblem(coords, [rrrrrrrrrr[0], rrrrrrrrrr[1]], distance);
    return rereerer1.endPoint;
}
function getVectorForAngle(angle) {
    const az1 = angle * Math.PI / 180;
    const dir1 = [Math.sin(az1), Math.cos(az1)];
    return dir1;
}
function check(value) {
    return typeof value === 'string' ? +value : value;
}
function createStepConusPoligon(coords1, coords2, coords3, coords4, color = '#00FF0088') {
    if (color.length < 9) {
        color += '88';
    }
    return new ymaps.Polygon([
        [
            [...coords1],
            [...coords3],
            [...coords4],
            [...coords2],
        ],
    ], {
        hintContent: "Многоугольник"
    }, {
        fillColor: color,
        strokeColor: color.slice(0, -2),
        strokeWidth: 1
    });
}
function createPoligon(coords, color = '#00FF0088') {
    if (color.length < 9) {
        color += '88';
    }
    return new ymaps.Polygon([
        [
            ...coords
        ],
    ], {
        hintContent: "Многоугольник"
    }, {
        fillColor: color,
        strokeColor: color.slice(0, -2),
        strokeWidth: 1
    });
}
const createPlacemark = (coords) => {
    return new ymaps.Placemark(coords, {
        iconCaption: 'поиск...',
    }, {
        draggable: true,
        pane: 'islands#violetDotIconWithCaption'
    });
};
function getStartCoords(coords, map) {
    getWeather(coords[0], coords[1])
        .then((request1) => {
        countOfRequest += 1;
        const concInStartPosition = +document.getElementById('concentrat').value;
        const cofSpeedSpreadF = +document.getElementById('cofSpeedSpread').value;
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
        getPromiseWeather(coordsAndWinds1, [ressss[0][0], ressss[0][1]], map, arrayForControllingCount, (r) => (r - 10), concInStartPosition, cofSpeedSpreadF);
        getPromiseWeather(coordsAndWinds2, [ressss[1][0], ressss[1][1]], map, arrayForControllingCount, (r) => (r + 10), concInStartPosition, cofSpeedSpreadF);
    });
}
function getPromiseWeather(array, [lat, lon], map, controlArrayObject, setOffset, concInStartPosition, cofSpeedSpreadF) {
    if (array.length === 28 || countOfRequest > 58) {
        controlArrayObject.push(true);
        let distanceFromStart = null;
        if (arrayForControllingCount.length === 2) {
            distanceFromStart = ymaps.coordSystem.geo.getDistance(coordsAndWinds2[coordsAndWinds2.length - 1].coords, coordsAndWinds1[coordsAndWinds1.length - 1].coords);
        }
        createPolygons(map, distanceFromStart);
        countOfRequest = 0;
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
    });
}
function calculateConc(array, currentPoint, concInStartPosition, windSpeed, cofSpeedSpreadF) {
    const distanceFromStart = ymaps.coordSystem.geo.getDistance(array[0].coords, currentPoint);
    let d;
    if (windSpeed <= 0.5) {
        d = 5.7;
    }
    else if (windSpeed <= 2 && windSpeed > 0.5) {
        d = 11.4 * windSpeed;
    }
    else if (windSpeed > 2) {
        d = 16 * Math.sqrt(windSpeed);
    }
    const xM = ((5 - cofSpeedSpreadF) / 4) * d * 2;
    let s = 1;
    let cofX = distanceFromStart / xM;
    if (cofX <= 1) {
        s = (3 * Math.pow(cofX, 4)) - (8 * Math.pow(cofX, 3)) + (6 * Math.pow(cofX, 2));
    }
    else if (cofX > 1 && cofX <= 8) {
        s = 1.13 / ((0.13 * Math.pow(cofX, 2)) + 1);
    }
    else if (cofX > 8) {
        if (cofSpeedSpreadF <= 1.5) {
            s = cofX / ((3.58 * Math.pow(cofX, 2)) - (35.2 * cofX) + 120);
        }
        else if (cofSpeedSpreadF > 1.5) {
            s = 1 / ((0.1 * Math.pow(cofX, 2)) + (2.47 * cofX) - 17.8);
        }
    }
    return concInStartPosition * s;
}
function createPolygons(map, distance) {
    if (arrayForControllingCount.length === 2) {
        coordsAndWinds1.forEach((item, index, array) => {
            if (index === 0 || !coordsAndWinds2[index] || !coordsAndWinds1[index]) {
                return;
            }
            else {
                const polygon = createStepConusPoligon(coordsAndWinds1[index - 1].coords, coordsAndWinds2[index - 1].coords, coordsAndWinds1[index].coords, coordsAndWinds2[index].coords, getColor(Math.max(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc)));
                map.geoObjects.add(polygon);
            }
            if (index === (array.length - 1) || (!coordsAndWinds2[index + 1] || !coordsAndWinds1[index + 1])) {
                const coordsOfPoint1 = coordsAndWinds1[index].coords;
                const coordsOfPoint2 = coordsAndWinds2[index].coords;
                const angleOfPoint1 = coordsAndWinds1[index].deg;
                const angleOfPoint2 = coordsAndWinds2[index].deg;
                const coordsOfCenter = [(coordsOfPoint1[0] + coordsOfPoint2[0]) / 2, (coordsOfPoint1[1] + coordsOfPoint2[1]) / 2];
                const angle = ((angleOfPoint1 - 10) + (angleOfPoint2 + 10)) / 2;
                console.log(distance / 10);
                const endPoint = ymaps.coordSystem.geo.solveDirectProblem(coordsOfCenter, getVectorForAngle(angle), distance / 6).endPoint;
                const polygon = createPoligon([coordsOfPoint1, coordsOfPoint2, endPoint], getColor(Math.max(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc)));
                map.geoObjects.add(polygon);
            }
        });
        arrayForControllingCount = [];
        coordsAndWinds1 = [];
        coordsAndWinds2 = [];
    }
}
let degStart = 127;
let speedStart = 4.68;
function getWeather(lat, lon) {
    return new Promise((resolve, reject) => {
        const newWindData = {
            wind: {
                deg: degStart++,
                speed: speedStart
            }
        };
        speedStart += 0.1;
        resolve(newWindData);
    });
}
//# sourceMappingURL=main.js.map