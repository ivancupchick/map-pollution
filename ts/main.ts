// start test managment
let test = false;
// end test managment

// good functions
function pow(x: number, y: number) {
  return Math.pow(x, y)
}

function getById(id: string): HTMLInputElement | HTMLElement {
  const result = document.getElementById(id);
  return result ? result : null;
}

function getPointOnDistance(startPoint: Point, direction: number, distance: number): Point {
  const result = (ymaps as any).coordSystem.geo.solveDirectProblem(startPoint, getVectorForAngle(direction), distance);
  return result ? result.endPoint : null;
}

function getVectorForAngle(angle: number): [number, number] {
  const az1 = angle * Math.PI / 180;
  return [Math.sin(az1), Math.cos(az1)];
}

function check(value: string | number): number {
  return typeof value === 'string' ? +value : value;
}

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

let coordsAndWinds1: CoordArrayItem[] = [];
let coordsAndWinds2: CoordArrayItem[] = [];

let coords1 = false;
let coords2 = false;

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
  // let r = getById('radius') as HTMLInputElement;
  let c = getById('concentrat') as HTMLInputElement;
  let cof = getById('cofSpeedSpread') as HTMLInputElement;

  if (c && cof) { // && r
    c.value = '1.0';
    // r.value = '1.0';
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

  const modelButton = getById('button-for-modulation');
  modelButton && modelButton.addEventListener('click', (e) => {
    if (myPlacemark) {
      clearMap(map, myPlacemark);

      const coords = (myPlacemark.geometry as any).getCoordinates();

      getStartCoords(coords, map);
    }
  });

  const clearButton = getById('button-for-clear');
  clearButton && clearButton.addEventListener('click', (e) => {
    map && clearMap(map);
  });
}

function getTwoPoints(deg: number, speed: number, coords: Point, map: ymaps.Map, processer1: (value: number) => number, processer2: (value: number) => number): [Point, Point] {
  let distance = speed * 15 * 60;

  let rereerer1 = getPointOnDistance(coords, processer1(deg), distance);
  let rereerer2 = getPointOnDistance(coords, processer2(deg), distance);

  return rereerer1 && rereerer2 ? [rereerer1, rereerer2] : [null, null];
}

function getOnePoints(deg: number, speed: number, coords: Point, map: ymaps.Map, processer: (r: number) => number): Point {
  let distance = speed * 15 * 60;

  let rereerer1 = getPointOnDistance(coords, processer(deg), distance);

  return rereerer1;
}

function createPoligon(coords: Point[], color = '#00FF0088') {
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

const createPlacemark = (coords: Point) => {
  return new (ymaps.Placemark as any)(coords, {
      iconCaption: 'поиск...',
  }, {
      draggable: true,
      pane: 'islands#violetDotIconWithCaption'
  });
}

function getStartCoords(coords: Point, map: ymaps.Map) {
  if (!test) {
    if (countOfRequest > 58) {
      return;
    }
  }

  getWeather(coords[0], coords[1])
    .then( (request1: OpenWeatherMap) => {

      countOfRequest += 1;

      const concInStartPosition: number = +(getById('concentrat') as HTMLInputElement).value
      const cofSpeedSpreadF: number = +(getById('cofSpeedSpread') as HTMLInputElement).value

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

function getPromiseWeather(array: CoordArrayItem[], [lat, lon]: Point, map, controlArrayObject: boolean[], setOffset: (value: number) => number, concInStartPosition: number, cofSpeedSpreadF) {
  if (array.length === 28 || countOfRequest > 58) {
    controlArrayObject.push(true);

    let distanceFromStart = null;

    if (arrayForControllingCount.length === 2) {
      distanceFromStart = (ymaps as any).coordSystem.geo.getDistance(coordsAndWinds2[coordsAndWinds2.length - 1].coords, coordsAndWinds1[coordsAndWinds1.length - 1].coords);
    }

    createPolygons(map, distanceFromStart);

    if (test) {
      countOfRequest = 0;
    }
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
    d = 5.7; // 4.15а
  } else if (windSpeed <= 2 && windSpeed > 0.5) {
    d = 11.4 * windSpeed;  // 4.15б
  } else if (windSpeed > 2) {
    d = 16 * Math.sqrt(windSpeed);  // 4.15в
  }

  const xM = ((5 - cofSpeedSpreadF) / 4) * d * 2; // 4.13

  let s = 1;

  let cofX = distanceFromStart / xM; // X/Xm

  if (cofX <= 1) {
    s = (3 * pow(cofX, 4)) - (8 * pow(cofX, 3)) + (6 * pow(cofX, 2)) // 4.19а
  } else if (cofX > 1 && cofX <= 8) {
    s = 1.13 / ((0.13 * pow(cofX, 2)) + 1); // 4.19б
  } else if (cofX > 8) {
    if (cofSpeedSpreadF <= 1.5) {
      s = cofX / ((3.58 * pow(cofX, 2)) - (35.2 * cofX) + 120); // 4.19в
    } else if (cofSpeedSpreadF > 1.5) {
      s = 1 / ((0.1 * pow(cofX, 2)) + (2.47 * cofX) - 17.8); // 4.19г
    }
  }

  return concInStartPosition * s; // 4.18
}

function createPolygons(map: ymaps.Map, distance: number) {
  if (arrayForControllingCount.length === 2) {
    coordsAndWinds1.forEach((item, index, array) => {
      if (index === 0 || !coordsAndWinds2[index] || !coordsAndWinds1[index]) {
        return;
      } else {
        const polygon = createPoligon(
          [
            coordsAndWinds1[index - 1].coords, // 1
            coordsAndWinds1[index].coords, // 3
            coordsAndWinds2[index].coords, // 4
            coordsAndWinds2[index - 1].coords // 2
          ],
          getColor(Math.max(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc))
        );

        map.geoObjects.add(polygon);
      }

      if (index === (array.length - 1) || (!coordsAndWinds2[index + 1] || !coordsAndWinds1[index + 1])) {
        const coordsOfPoint1 = coordsAndWinds1[index].coords;
        const coordsOfPoint2 = coordsAndWinds2[index].coords;

        const angleOfPoint1 = coordsAndWinds1[index].deg;
        const angleOfPoint2 = coordsAndWinds2[index].deg;

        const coordsOfCenter: Point = [ (coordsOfPoint1[0] + coordsOfPoint2[0]) / 2, (coordsOfPoint1[1] + coordsOfPoint2[1]) / 2 ];

        const angle = ((angleOfPoint1 - 10) + (angleOfPoint2 + 10)) / 2

        const endPoint: Point = getPointOnDistance(coordsOfCenter, angle, distance / 2);

        const polygon = getFinalPolygon(coordsOfPoint1, coordsOfPoint2, endPoint, index);

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

function getWeather(lat: number, lon: number): Promise<OpenWeatherMapWind> {
  if (!test) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      .then(request => request.json());
  } else {
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
}

function getFinalPolygon(firstPoint: Point, secondPoint: Point, centerPoint: Point, index: number) {
  const result = [ firstPoint ];

  const firstLineSize = getDistanceFrom2Points(firstPoint, centerPoint);
  const secondLineSize = getDistanceFrom2Points(secondPoint, centerPoint);

  for (let i = 0; i < 1; i += 0.05) {
    const firstP = getPointOnSegment(firstPoint, centerPoint, firstLineSize * i);
    const secondP = getPointOnSegment(centerPoint, secondPoint, secondLineSize * i);

    const distanceNewLine = getDistanceFrom2Points(firstP, secondP);
    const p = getPointOnSegment(firstP, secondP, distanceNewLine * i);
    result.push(p);
  }

  result.push(secondPoint);

  return createPoligon(result, getColor(Math.max(coordsAndWinds2[index].conc, coordsAndWinds1[index].conc)));
}

function getPointOnSegment(firstPoint: Point, secondPoint: Point, distanceFromPoint): Point {
  const Xa = firstPoint[0];
  const Ya = firstPoint[1];

  const Xb = secondPoint[0];
  const Yb = secondPoint[1];

  const Rac = distanceFromPoint;

  const Rab = Math.sqrt( pow((Xb-Xa), 2) + pow((Yb-Ya),2));
  const k = Rac / Rab;
  const Xc = Xa + (Xb-Xa)*k;
  const Yc = Ya + (Yb-Ya)*k;

  return [Xc, Yc];
}

function getDistanceFrom2Points(firstPoint: Point, secondPoint: Point): number {
  const lineX = Math.abs(firstPoint[0] - secondPoint[0]);
  const lineY = Math.abs(firstPoint[1] - secondPoint[1]);

  return Math.sqrt( (lineX * lineX) + (lineY * lineY) );
}
