
var game;
var sprites = [];
var debugCounter = 0;

var lastCalledTime;
var fps;

var MOVEMENT_RATE = 10;

function Point(x, y) {
	this.x = x;
	this.y = y;

	this.addPoint = function(point) {
		newPoint = new Point(0, 0);
		newPoint.x = this.x + point.x;
		newPoint.y = this.y + point.y;
		return newPoint;
	}

	this.subtractPoint = function(point) {
		return this.addPoint(new Point(-point.x, -point.y));
	}
}

function Game() {
	this.map;
	this.center;
	this.canvas;
	this.context;
	this.currentTarget;
	this.targetOffset;
}

function isoTo2D(point) {
	var tempPt = new Point(0, 0);
	tempPt.x = (2 * point.y + point.x) / 2;
	tempPt.y = (2 * point.y - point.x) / 2;
	return(tempPt);
}

function twoDToIso(point) {
	var tempPt = new Point(0, 0);
	tempPt.x = point.x - point.y;
	tempPt.y = (point.x + point.y) / 2;
	return(tempPt);
}

function euclidianDistance(point1, point2) { //returns distance between 2 points or hypoteneuse of 1 point
	if (point2)
		return (Math.sqrt(Math.pow(point2.x - point1.x, 2), Math.pow(point2.y - point1.y, 2)));
	else
		return Math.sqrt(Math.pow(point1.x, 2), Math.pow(point1.y, 2));
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function generateMap() {
	map = [];
	for (i=-200; i<200; i++) {
		map[i] = []
		for (j=-200; j<200; j++) {
			if (Math.random() < 0.7) 
	    		map[i][j] = 0;
	    	else 
	    		map[i][j] = 1;
		}
	}
	return map;
}

function animate() {
    requestAnimFrame( animate );
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    draw();
}

function Sprite(tileType, pos, size) {
	if (debugCounter % 100 == 0) {
	}
	if (tileType == 0) {
		this.tileType = "grass.png";
	}
	else {
		this.tileType = "dirt.png";
	}
    this.pos = pos;
    this.size = size;
}

Sprite.prototype.staticRender = function(ctx) {
    var x = Math.round(this.pos[0]);
    var y = Math.round(this.pos[1]);

    ctx.drawImage(resources.get(this.tileType),
                  0, 0,
                  this.size[0], this.size[1],
                  x, y,
                  this.size[0], this.size[1]);
}


function draw() {

	//update position
	sprites.length = 0;

	if (game.currentTarget) {
		if (euclidianDistance(game.currentTarget, game.center) < 5) {
			game.currentTarget = null;
		} else {
			/*
			var offsetDistance = euclidianDistance(game.targetOffset);
			var triangleRatio = MOVEMENT_RATE / offsetDistance;
			var newX = game.targetOffset.x * triangleRatio;
			var newY = game.targetOffset.y * triangleRatio;
			*/

			var newX = MOVEMENT_RATE * (game.targetOffset.x / (Math.abs(game.targetOffset.x) + Math.abs(game.targetOffset.y)));
			var newY = MOVEMENT_RATE * (game.targetOffset.y / (Math.abs(game.targetOffset.x) + Math.abs(game.targetOffset.y)));

			game.center.x += newX;
			game.center.y += newY;
		}
	}	
	var firstRowToDraw = Math.floor(game.center.x / 96);
	var firstColToDraw = Math.floor(game.center.y / 96);

	for (i=firstRowToDraw; i<firstRowToDraw + Math.ceil(game.canvas.width / 96) + 1; i++) {
		for (j=firstColToDraw; j<firstColToDraw + Math.ceil(game.canvas.height / 96) + 1; j++) {
			sprites.push(new Sprite(game.map[i][j], [i*96 - game.center.x, j*96 - game.center.y], [96, 96]));
		}
	}

	for (sprite in sprites) {
		sprites[sprite].staticRender(game.context);
	}

	debugCounter++;
}

function bindKeys() {
	$(document).keydown(function(e){
		e.preventDefault();
    	if (e.keyCode == 37) { 
    		game.center.x = game.center.x - MOVEMENT_RATE;
    	}
    	if (e.keyCode == 38) {
    		game.center.y = game.center.y - MOVEMENT_RATE;
    	}
    	if (e.keyCode == 39) {
    		game.center.x = game.center.x + MOVEMENT_RATE;
    	}
    	if (e.keyCode == 40) {	
    		game.center.y = game.center.y + MOVEMENT_RATE;
    	}
	});

	$('#canvas').on('contextmenu',function() {
		return false; //disables the right click menu on the canvas
	});

	$('#canvas').mousedown(function(e) {
		e.preventDefault();
		if (e.which == 3) {
			game.currentTarget = null;
			var offset = $(this).offset();
    		var mouseOffset = new Point(e.clientX - offset.left, e.clientY - offset.top);
    		game.targetOffset = mouseOffset.subtractPoint(new Point(canvas.width/2, canvas.height/2));
    		game.currentTarget = game.center.addPoint(game.targetOffset);
		}
	});
}

$(function() { //jquery loaded
	game = new Game();
	game.center = new Point(0, 0);
	game.map = generateMap();
	game.canvas = $("#canvas")[0];
	game.canvas.width  = window.innerWidth;
    game.canvas.height = window.innerHeight;
	game.context = game.canvas.getContext('2d');
    game.screenTileWidth = Math.floor(window.innerWidth / 96) + 1;
    game.screenTileHeight = Math.floor(window.innerHeight / 96) + 1;
    resources.load([
    	'grass.png',
    	'dirt.png',
    	'car.png'
   	]);
    resources.onReady(animate);
    bindKeys();
});