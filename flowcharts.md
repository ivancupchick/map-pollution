first flow:
=======================================================================================================
st=>start: start:>http://newscad.com
op1=>operation: API_KEY = '<API-KEY>'
colors = [все цвета]
coordsAndWinds1 = []
coordsAndWinds2 = []
coords1 = false
coords2 = false
arrayForControllingCount = []
myPlacemark
sub1=>subroutine: call function init
op2=>operation: countOfRequest = 0
cond1=>condition: прошла минута?
sub=>subroutine: вычисления
e=>end

st->op1->sub1->op2->cond1
cond1(yes)->op2
cond1(no)->sub(right)->cond1



second flow (init)
=======================================================================================================
st=>start: start:>http://newscad.com
op1=>operation: concentrat = 1.0
cofSpeedSpread = 1.0
map = new Map()
map.onclick = onMapClick()
modellingButton.onlick = onModellingButtonClick()
clearButton.onlick = onClearButtonClick()
sub1=>subroutine: call function init
op2=>operation: countOfRequest = 0
cond1=>condition: прошла минута?
sub=>subroutine: вычисления
e=>end

st->op1->e



third flow (onMapClick)
=======================================================================================================
st=>start: начало
input1=>inputoutput: event
e=>end: конец
op1=>operation: coords = event.get('coords')
op2=>operation: myPlacemark.setCoordinates(coords)
op3=>operation: myPlacemark = new Placemark(coords)
map.add(myPlacemark)
op4=>operation: clearMap(map, myPlacemark)
sub1=>subroutine: подпрограмма
cond=>condition: myPlacemark !== undefined
myPlacemark !== null

st->input1->op1->cond
cond(yes)->op3->op4->e
cond(no)->op2(right)->op4


fourth flow (modelButtonClick)
=======================================================================================================
st=>start: начало
input1=>inputoutput: event
e=>end: конец
op1=>operation: clearMap(map, myPlacemark);
coords = myPlacemark.getCoordinates();
getStartCoords(coords, map);
op2=>operation: myPlacemark setCoordinates(coords)
op3=>operation: myPlacemark = new Placemark(coords)
map.add(myPlacemark)
op4=>operation: clearMap(map, myPlacemark)
sub1=>subroutine: подпрограмма
cond=>condition: myPlacemark !== undefined
myPlacemark !== null

st->cond
cond(yes)->op1->e
cond(no)->e

fifth flow (getStartCoords)
=======================================================================================================
st=>start: начало
input1=>inputoutput: coords, map, concInStartPosition, cofSpeedSpreadF
op12=>operation: getWeather(coords[0], coords[1])
input2=>inputoutput: request1
op13=>operation: countOfRequest += 1;
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
op14=>operation: ressss = getTwoPoints(request1, coords, map);
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

op15=>operation: getPromiseWeather(coordsAndWinds1, ressss[0], map, concInS.., cof...);
getPromiseWeather(coordsAndWinds1, ressss[1], map, concInS.., cof...);

e=>end: конец
op1=>operation: clearMap(map, myPlacemark);
coords = myPlacemark.getCoordinates();
getStartCoords(coords, map);
op2=>operation: myPlacemark setCoordinates(coords)
op3=>operation: myPlacemark = new Placemark(coords)
map.add(myPlacemark)
op4=>operation: clearMap(map, myPlacemark)
sub1=>subroutine: подпрограмма
cond=>condition: myPlacemark !== undefined
myPlacemark !== null

st->input1->op12->input2->op13->op14->op15->e

sixth flow (getPromiseWeather)
=======================================================================================================
st=>start: начало
input1=>inputoutput: array, [lat, lon], map, controlArrayObject, concInStartPosition, cofSpeedSpreadF
cond=>condition: array.length === 28 или
countOfRequest > 58


e=>end: конец
cond2=>condition: arrayForControllingCount.length === 2
=>operation: controlArrayObject.push(true)
distanceFromStart = null;
op2=>operation: myPlacemark setCoordinates(coords)
op3=>operation: myPlacemark = new Placemark(coords)
map.add(myPlacemark)
op4=>operation: clearMap(map, myPlacemark)
sub1=>subroutine: подпрограмма


op123=>operation: countOfRequest++;
getWeather(lat, lon);
input123=>inputoutput: request(getWeather)
op125=>operation: s2 = getOnePoints(request.wind.deg, request.wind.speed, [lat, lon], map, setOffset);
array.push({
coords: s2,
deg: request.wind.deg,
conc: calculateConc(array, s2, concInStartPosition, request.wind.speed, cofSpeedSpreadF)
});

op786=>operation: createPolygons(map, distanceFromStart);
op124=>operation: distanceFromStart = getDistance(coordsAndWinds2[last].coords, coordsAndWinds1[last].coords);

st->input1->cond
cond(yes)->op1->cond2
cond(no)->op123->input123->op125(right)->input1
cond2(yes)->op124->op786->e
cond2(no)->op786(right)->e
