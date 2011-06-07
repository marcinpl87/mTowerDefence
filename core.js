function checkSquare(value)
{ //SPRAWDZAM PRAWY DOLNY ROG!!
	return Math.round(
		( value + (modelObject.squareSide/2) - 1 ) / modelObject.squareSide
	);
}

function checkSquareTwo(value)
{ //SPRAWDZAM LEWY GORNY ROG!!
	return Math.round(
		( value - (modelObject.squareSide/2) + 1 ) / modelObject.squareSide
	);
}

var enemy = function()
{
	return {
		x: 0, //x
		y: 4 * modelObject.squareSide, //y
		id: 0,
		hp: 2, //hp points
		goDown: true, //flaga mowi o tym czy moze isc na dol
		move: function()
		{ //poruszanie sie przeciwnika
			if (
				(modelObject.mapTab[checkSquareTwo(this.y)][checkSquareTwo(this.x + modelObject.enemyStep)].substr(0, 1) == '1')//lewy gorny
				&& (modelObject.mapTab[checkSquareTwo(this.y)][checkSquare(this.x + modelObject.enemyStep)].substr(0, 1) == '1')//prawy gorny
				&& (modelObject.mapTab[checkSquare(this.y)][checkSquare(this.x + modelObject.enemyStep)].substr(0, 1) == '1')//prawy dolny
				&& (modelObject.mapTab[checkSquare(this.y)][checkSquareTwo(this.x + modelObject.enemyStep)].substr(0, 1) == '1')//lewy dolny
			)
			{ //nie ma kolizji, moze tam isc (W PRAWO)
				this.x += modelObject.enemyStep;
			}
			else
			{ //jest kolizja
				if (
					(modelObject.mapTab[checkSquareTwo(this.y + modelObject.enemyStep)][checkSquareTwo(this.x)].substr(0, 1) == '1')//lewy gorny
					&& (modelObject.mapTab[checkSquareTwo(this.y + modelObject.enemyStep)][checkSquare(this.x)].substr(0, 1) == '1')//prawy gorny
					&& (modelObject.mapTab[checkSquare(this.y + modelObject.enemyStep)][checkSquare(this.x)].substr(0, 1) == '1')//prawy dolny
					&& (modelObject.mapTab[checkSquare(this.y + modelObject.enemyStep)][checkSquareTwo(this.x)].substr(0, 1) == '1')//lewy dolny
					&& (this.goDown)
				)
				{ //nie ma kolizji, moze tam isc (W DOL)
					this.y += modelObject.enemyStep;
				}
				else
				{ //jest kolizja
					this.goDown = false;
					if (
						(modelObject.mapTab[checkSquareTwo(this.y - modelObject.enemyStep)][checkSquareTwo(this.x)].substr(0, 1) == '1')//lewy gorny
						&& (modelObject.mapTab[checkSquareTwo(this.y - modelObject.enemyStep)][checkSquare(this.x)].substr(0, 1) == '1')//prawy gorny
						&& (modelObject.mapTab[checkSquare(this.y - modelObject.enemyStep)][checkSquare(this.x)].substr(0, 1) == '1')//prawy dolny
						&& (modelObject.mapTab[checkSquare(this.y - modelObject.enemyStep)][checkSquareTwo(this.x)].substr(0, 1) == '1')//lewy dolny
					)
					{ //nie ma kolizji, moze tam isc (W GORE)
						this.y -= modelObject.enemyStep;
					}
					else
					{
						this.goDown = true;
						if (modelObject.mapTab[checkSquare(this.y)][checkSquareTwo(this.x + modelObject.enemyStep)].substr(1, 1) == '1')
						{ //przeciwnik osiagnal ostatnie pole czyli koniec planszy
							delete enemyArray[this.id]; //usuwa siebie samego
							modelObject.lifeCounter--; //dekrementuje licznik zyc
							$('#sidebar #life span').text(modelObject.lifeCounter);
							if (modelObject.lifeCounter == 0)
							{ //0 zyc, player przegral
								alert('GAME OVER');
								location.reload(true);
							}
						}
					}
				}
			}
		}
	}
}

function tower()
{
	return {
		x: 2 * modelObject.squareSide, //x
		y: 5 * modelObject.squareSide, //y
		loading: 0,
		scan: function()
		{
			if (this.loading == 0)
			{
				var xRadMin = this.x - modelObject.squareSide;
				var xRadMax = this.x + modelObject.squareSide;
				var yRadMin = this.y - modelObject.squareSide;
				var yRadMax = this.y + modelObject.squareSide;
				for (i in enemyArray)
				{ //petli wiersze w tablicy obiektow zeby narysowac obiekty na mapie
					if (
						( (enemyArray[i].x >= xRadMin) && (enemyArray[i].x <= xRadMax) )
						&& ( (enemyArray[i].y >= yRadMin) && (enemyArray[i].y <= yRadMax) )
					)
					{
						shipArray[modelObject.shipId] = new ship();
						shipArray[modelObject.shipId].id = modelObject.shipId;
						shipArray[modelObject.shipId].x = this.x + modelObject.squareSide / 2;
						shipArray[modelObject.shipId].y = this.y + modelObject.squareSide / 2;
						shipArray[modelObject.shipId].destinyEnemy = enemyArray[i].id;
						modelObject.shipId++;
						this.loading = 10;
						break; //po wystrzeleniu w pierwszego wroga przerywa petle
					}
				}
			}
			else this.loading--;
		}
	}
}


var planet = function() { //klasa planety
	return {
		x: 0, //x
		y: 0, //y
		rad: 0, //promien
		popul: 1, //populacja
		color: '0, 255, 0, 1', //kolor
		colorActive: '255, 255, 255, 1', //kolor aktywnej planety
		active: false, //czy planeta jest kliknieta
		type: 0, //typ planety: 0-niczyja, 1-moja, 2-wroga
		grow: function()
		{ //wzrost populacji planety
			if (
				(this.type == 1)
				|| (this.type == 2)
			)
			{ //jesli planeta nalezy do gracza lub wroga
				this.popul += 0.001 * this.rad;
			}
		},
		sendShipsCommand: function(planetArrayKey)
		{ //polecenie wyslania statkow w przestrzen kosmiczna
			if (planetArray[modelObject.lastActive].type == 1)
			{ //jesli ostatnio aktywna planeta nalezy do gracza
				var deployShips = Math.round(planetArray[modelObject.lastActive].popul / 2);

				mapObject.sendShips(modelObject.lastActive, planetArrayKey, deployShips, 1);
				planetArray[modelObject.lastActive].popul -= deployShips;

				this.active = false;
				modelObject.lastActive = null;
			}
			else
			{ //jesli nie jest gracza
				modelObject.lastActive = null;
			}
		},
		activate: function(planetArrayKey)
		{ //aktywacja planety
			this.active = true;
			modelObject.lastActive = planetArrayKey;
		},
		checkClick: function(e, pi)
		{ //sprawdzenie czy user kliknal w jakas planete
			if (
				(e.pageX >= this.x)
				&& (e.pageX <= this.x + this.rad)
				&& (e.pageY >= this.y)
				&& (e.pageY <= this.y + this.rad)
			)
			{ //kliknal w planete
				if (
					(modelObject.lastActive !== null)
					&& (modelObject.lastActive !== pi)
				)
				{ //kliknal w inna planete niz ostatnio zaznaczona wiec chce wyslac statki
					this.sendShipsCommand(pi);
				}
				else
				{ //nie chce robic transferu wiec zaznaczam kliknieta planete jaka aktywna
					this.activate(pi);
				}
			}
			else
			{
				this.active = false;
				modelObject.emptyClick++;
			}
		}
	};
};

var ship = function() { //klasa statku kosmicznego
	return {
		x: 0,
		y: 0,
		rad: 4, //promien
		destinyEnemy: 0, //cel czyli planeta
		onGround: false, //czy statek juz wyladawal
		id: 1, //id
		landing: function()
		{ //ladawanie statku
			this.onGround = true;
			enemyArray[this.destinyEnemy].hp--;
			if (enemyArray[this.destinyEnemy].hp == 0)
			{
				//enemyArray.splice(this.destinyEnemy, 1); //usuwa przeciwnika
				delete enemyArray[this.destinyEnemy]; //usuwa przeciwnika
			}
		},
		move: function()
		{ //poruszanie sie statku
			if (enemyArray[this.destinyEnemy])
			{ //jesli cel podrozy statku jeszcze istnieje (nie zostal zniszczony przez inny)
				var destinyX = enemyArray[this.destinyEnemy].x + (modelObject.squareSide / 2) - 1;
				var destinyY = enemyArray[this.destinyEnemy].y + (modelObject.squareSide / 2) - 1;
				var xDiff = Math.abs( destinyX - this.x );
				var yDiff = Math.abs( destinyY - this.y );
				if (xDiff <= yDiff)
				{
					var wspolczynnikKierunkowy = xDiff / yDiff;
					var drugiWspolczynnik = 1 - wspolczynnikKierunkowy;
					var dx = Math.round(wspolczynnikKierunkowy * modelObject.shipStep);
					var dy = Math.round(drugiWspolczynnik * modelObject.shipStep);
				}
				else
				{
					var wspolczynnikKierunkowy = yDiff / xDiff;
					var drugiWspolczynnik = 1 - wspolczynnikKierunkowy;
					var dy = Math.round(wspolczynnikKierunkowy * modelObject.shipStep);
					var dx = Math.round(drugiWspolczynnik * modelObject.shipStep);
				}
				if (this.x > destinyX)
				{
					this.x -= dx;
				}
				if (this.x < destinyX)
				{
					this.x += dx;
				}
				if (this.y > destinyY)
				{
					this.y -= dy;
				}
				if (this.y < destinyY)
				{
					this.y += dy;
				}
				if (
					(
						(this.x >= destinyX - modelObject.shipStep)
						&& (this.x <= destinyX + modelObject.shipStep)
					)
					&& (
						(this.y >= destinyY - modelObject.shipStep)
						&& (this.y <= destinyY + modelObject.shipStep)
					)
				)
				{ //statek dolecial na miejsce
					if (!this.onGround)
					{
						this.landing();
					}
					//shipArray.splice(this.id, 1); //usuwa statek
					delete shipArray[this.id]; //usuwa statek
				}
			}
			else
			{ //nie istnieje juz cel podrozy statku wiec nie jest juz potrzebny
				//shipArray.splice(this.id, 1); //usuwa statek
				delete shipArray[this.id]; //usuwa statek
console.log('statek ' + this.id + ' bez celu!');
console.log(this.destinyEnemy);
console.log(enemyArray[this.destinyEnemy]);
			}
		}
	};
};

function map() { //klasa mapy
	return {
		generator: function()
		{ //generator planet
			var x, y, rad;
			var tempXStart;
			var tempXStop;
			var tempYStart;
			var tempYStop;
			var tempSpace = 20; //minimalna odleglosc miedzy planetami
			var generatedPlanet = new Array();
			var returnPlanet = new Array();
			var noCollision = true; //czy planeta nie ma kolizji z inna
			var firstPlanet = false; //czy pierwsza planeta nalezy do usera
			var maxPlanetCount = 20; //ile maksymalnie planet wygenerowac
			var type; //typ planety
			var popul; //populacja planety
		},
		drawObjects: function ()
		{ //rysuje wszystkie obiekty
			for (i in modelObject.mapTab)
			{ //petli wiersze w tablicy obiektow zeby narysowac obiekty na mapie
				for (j in modelObject.mapTab[i])
				{ //petli kolumny w wierszu tablicy obiektow
					var mapPoint = modelObject.mapTab[i][j];
					var absoluteX = j * modelObject.squareSide; //x absolutne
					var absoluteY = i * modelObject.squareSide; //y absolutne
					if (mapPoint.substr(0, 1) == '1')
					{ //jest zdefiniowany jakis graficzny obiekt na mapie
						viewObject.squareDraw(
							absoluteX,
							absoluteY,
							modelObject.squareSide,
							'0,0,255,1'
						);
					}
				}
			}
			for (i in enemyArray)
			{ //petli wiersze w tablicy obiektow zeby narysowac obiekty na mapie
				viewObject.squareDraw(
					enemyArray[i].x,
					enemyArray[i].y,
					modelObject.squareSide,
					'255,0,0,1',
					enemyArray[i].hp
				);
			}
			for (i in towerArray)
			{ //petli wiersze w tablicy obiektow zeby narysowac obiekty na mapie
				viewObject.squareDraw(
					towerArray[i].x,
					towerArray[i].y,
					modelObject.squareSide,
					'0,255,0,1'
				);
			}
			for(si in shipArray)
			{ //rysuje statki
				if (shipArray[si].mowner == 1)
				{
					var shipColor = '255, 255, 255, 1';
				}
				else if (shipArray[si].mowner == 2)
				{
					var shipColor = '255, 0, 0, 1';
				}
				viewObject.squareDraw(
					shipArray[si].x,
					shipArray[si].y,
					shipArray[si].rad,
					shipColor
				);
			}
		},
		sendShips: function(start, stop, count, who)
		{ //wysyla statki z planety na planete
			var squareEdge = Math.sqrt(count); //statki utworza kwadrat o takim boku
			var addCount = 1;
			for (var j = 1; j <= squareEdge; j++)
			{
				for (var i = 1; i <= squareEdge; i++)
				{
					if (addCount <= count)
					{ //jesli moze jeszcze dodawac statki
						shipArray[modelObject.shipId] = ship();
						shipArray[modelObject.shipId].x = planetArray[start].x + i * 5;
						shipArray[modelObject.shipId].y = planetArray[start].y + j * 5;
						shipArray[modelObject.shipId].destinyPlanet = stop;
						shipArray[modelObject.shipId].mowner = who;
						modelObject.shipId++;
						addCount++;
					}
				}
			}
		}
	};
};

function view() { //widok czyli klasa zajmujaca sie grafika
	return {
		squareDraw: function(x, y, edge, color, text)
		{ //rysuje oteksturowany kwadrat
			//var color = '0,0,255,1';
			modelObject.canvasHandler.fillStyle = 'rgba('+color+')';
			modelObject.canvasHandler.fillRect(x, y, edge, edge);
			if (text)
			{ //jesli na obiekcie trzeba napisac jakis tekst
				modelObject.canvasHandler.fillStyle = '#fff';
				modelObject.canvasHandler.font = 'bold 18px arial';
				modelObject.canvasHandler.textBaseline = 'top';
				modelObject.canvasHandler.fillText(text, x, y);
			}
			return true;
		},
		squareDrawImg: function(x, y, edge, texture, text)
		{ //rysuje oteksturowany kwadrat
			if(texture) {
				var myImage = new Image();
				myImage.src = 'img/' + texture + '.png';
				modelObject.canvasHandler.drawImage(
					myImage,
					x,
					y,
					edge,
					edge
				);
			}
			if (text)
			{ //jesli na obiekcie trzeba napisac jakis tekst
				modelObject.canvasHandler.fillStyle = '#fff';
				modelObject.canvasHandler.font = 'bold 18px arial';
				modelObject.canvasHandler.textBaseline = 'top';
				modelObject.canvasHandler.fillText(text, x, y);
			}
			return true;
		}
	};
};

function model() { //model czyli klasa zajmujaca sie danymi
	return {
		mapWidth: 620,
		mapHeight: 620,
		canvasHandler: null, //uchwyt canvasa
		moveSpeed: 50, //co ile rysowac, sprawdzac kolizje, wysylac dane
		squareSide: 60, //bok kwadratu
		enemyStep: 10, //krok o ktory porusza sie przeciwnik
		lastActive: null, //ostatnio zaznaczona planeta
		emptyClick: 0, //klik w puste miejsce
		shipId: 0, //klucz w tabeli statkow
		enemyId: 0, //klucz w tabeli przeciwnikow
		towerId: 0, //klucz w tabeli wiez
		showNames: false, //czy ma pokazywac id planet
		multiplayer: false, //tryb gry -> true - multi | false - single
		socket: null, //uchwyt socketa
		playerNick: null, //nickname gracza
		userPlanetPopulation: 100, //populacja planety usera
		shipStep: 20, //predkosc statku
		mapTab: new Array(), //pierwszy wymiar tablicy map
		mapTab: [ //1 liczba - czy jest sciezka czy nie | 2 liczba - wlasciwosc specjalna | 3i4 liczba - grafika
			['0000','0000','0000','0000','0000','0000','0000','0000','0000','0000'],
			['0000','0000','0000','1011','1011','1011','0000','1011','1111','0000'],
			['0000','0000','0000','1011','0000','1011','0000','1011','0000','0000'],
			['0000','0000','0000','1011','0000','1011','0000','1011','0000','0000'],
			['1011','1011','0000','1011','0000','1011','0000','1011','0000','0000'],
			['0000','1011','0000','1011','0000','1011','0000','1011','0000','0000'],
			['0000','1011','0000','1011','0000','1011','0000','1011','0000','0000'],
			['0000','1011','0000','1011','0000','1011','0000','1011','0000','0000'],
			['0000','1011','1011','1011','0000','1011','1011','1011','0000','0000'],
			['0000','0000','0000','0000','0000','0000','0000','0000','0000','0000']
		], //obiekty na mapie
		towerBuildFlag: false, //flaga budowania wiezy
		towerBuildDivX: 0, //x miejsca budowy wiezy
		towerBuildDivY: 0, //y miejsca budowy wiezy
		lifeCounter: 3 //licznik zyc
	};
};


//CORE

var modelObject = model();
var mapObject = map();
var viewObject = view();
var shipArray = new Array(); //tablica referencji obiektow statkow
var planetArray = new Array(); //tablica referencji obiektow planet
var enemyArray = new Array(); //tablica referencji obiektow przeciwnikow
var towerArray = new Array(); //tablica referencji obiektow wiez


function gameInit(universeId)
{
	$("#menu").hide();
	$("#multiplayer").hide();
	$("#game").show();
	var wbmmoCanvas = document.getElementById('canvas');
	modelObject.canvasHandler = wbmmoCanvas.getContext('2d');
	mapObject.generator(); //generuje mape
	$('#sidebar #life span').text(modelObject.lifeCounter); //ustawia licznik zyc
	setInterval(
		function()
		{
			if (modelObject.canvasHandler !== undefined)
			{ //jesli mapa jest
				for(ti in towerArray)
				{ //rozwoj
					towerArray[ti].scan();
				}
				for(si in shipArray)
				{ //poruszanie sie statkow
					shipArray[si].move();
				}
				for(ei in enemyArray)
				{ //poruszanie sie przeciwnikow
					enemyArray[ei].move();
				}
				modelObject.canvasHandler.clearRect(0, 0, modelObject.mapWidth, modelObject.mapHeight); //to jest hack
				mapObject.drawObjects(); //rysuje obiekty
				if (modelObject.towerBuildFlag)
				{
					viewObject.squareDraw(
						modelObject.towerBuildDivX,
						modelObject.towerBuildDivY,
						modelObject.squareSide,
						'0,255,0,0.3'
					);
				}
			}
		},
		modelObject.moveSpeed
	);
}


$(document).ready(function()
{
	$('#game').hide();
	$('#multiplayer').hide();
	$('#menu #single span').live('click', function()
	{ //start singleplayer game
		modelObject.multiplayer = false;
		gameInit();
		$('#game').mousemove(function (e) {
			if (modelObject.towerBuildFlag)
			{
				var xPos = e.pageX;
				var yPos = e.pageY;
				modelObject.towerBuildDivX = Math.round( (e.pageX - (modelObject.squareSide/2) ) / modelObject.squareSide ) * modelObject.squareSide;
				modelObject.towerBuildDivY = Math.round( (e.pageY - (modelObject.squareSide/2) ) / modelObject.squareSide ) * modelObject.squareSide;
			}
		});
		$('#tower').live('click', function (e) {
			if (modelObject.towerBuildFlag) modelObject.towerBuildFlag = false;
			else modelObject.towerBuildFlag = true;
		});
		$('#start').live('click', function () {
			enemyArray[modelObject.enemyId] = new enemy();
			enemyArray[modelObject.enemyId].id = modelObject.enemyId;
			modelObject.enemyId++;
		});
	});
	$('#canvas').live('click', function(e){
		if (modelObject.towerBuildFlag)
		{ //jesli moze zbudowac wieze
			var squareX = modelObject.towerBuildDivX / modelObject.squareSide;
			var squareY = modelObject.towerBuildDivY / modelObject.squareSide;
			if (modelObject.mapTab[squareY][squareX].substr(0, 1) == '0')
			{ //jesli nie buduje na trasie przeciwnikow
				towerArray[modelObject.towerId] = new tower();
				towerArray[modelObject.towerId].id = modelObject.towerId;
				towerArray[modelObject.towerId].x = modelObject.towerBuildDivX;
				towerArray[modelObject.towerId].y = modelObject.towerBuildDivY;
				modelObject.towerId++;
				modelObject.towerBuildFlag = false;
			}
		}
	});
});