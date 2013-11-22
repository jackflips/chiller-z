
var game;
var sprites = [];
var debugCounter = 0;

var lastCalledTime;
var fps;

var MOVEMENT_RATE = 5;

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
	this.targetOffset = new Point(0, -1);
	this.zombies = [];
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
		return (Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)));
	else
		return Math.sqrt(Math.pow(point1.x, 2) + Math.pow(point1.y, 2));
}

function clip(point, size) {
	if (point.x > game.center.x - game.canvas.width/2 - size.x &&
		point.x < game.center.x + game.canvas.width/2 &&
		point.y > game.center.y - game.canvas.height/2 - size.y &&
		point.y < game.center.y + game.canvas.height/2)
		return true;
	return false;
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

function Sprite(image, pos, size, rotation, isCharacter) {
	if (debugCounter % 100 == 0) {
	}
	if (image == 0) {
		this.image = "grass.png";
	}
	else if (image == 1) {
		this.image = "dirt.png";
	}
	else {
		this.image = image;
	}
    this.pos = pos;
    this.size = size;
    this.rotation = rotation;
    this.isCharacter = isCharacter;
}

Sprite.prototype.staticRender = function(ctx) {
	if (this.isCharacter) {
		this.pos[0] += game.canvas.width/2;
		this.pos[1] += game.canvas.height/2;
	}
    if (this.rotation) {
    	game.context.save();
    	game.context.translate(Math.round(this.pos[0] + this.size[0]/2), Math.round(this.pos[1] + this.size[1]/2)); 
		game.context.rotate(this.rotation + 1.57079633); 
		this.pos[0] = -this.size[0]/2;
		this.pos[1] = -this.size[1]/2;
		this._staticRender(ctx);
		game.context.restore();
    } else {
	    this._staticRender(ctx);
	}
}

Sprite.prototype._staticRender = function(ctx) {
	var x = Math.round(this.pos[0]);
    var y = Math.round(this.pos[1]);

    ctx.drawImage(resources.get(this.image),
                  0, 0,
                  this.size[0], this.size[1],
                  x, y,
                  this.size[0], this.size[1]);
}

function draw() {

	//update positions
	//----------------
	//update position of viewport and necromancer
	if (game.currentTarget) {
		if (euclidianDistance(game.currentTarget, game.center) < 5) {
			game.currentTarget = null;
		} else {
			var triangleFactor = euclidianDistance(game.targetOffset) / MOVEMENT_RATE;
			game.center.x += game.targetOffset.x / triangleFactor;
			game.center.y += game.targetOffset.y / triangleFactor;
		}
	}

	//update positions of npcs
	for (zombie in game.zombies) {
		game.zombies[zombie].update(game);
	}

	//update position of zombies per frame based on direction and speed. (write this now.)
	for (zombie in game.zombies) {
		var thisZombie = game.zombies[zombie];
		var newX = Math.cos(thisZombie.direction) * thisZombie.speed;
		var newY = Math.sin(thisZombie.direction) * thisZombie.speed;
		thisZombie.position.x += newX;
		thisZombie.position.y += newY;
		//thisZombie.direction += .01;
	}


	//steering behaviors and ai and stuff goes here	
	//*********************************************

	//now draw
	//--------

	//draw world
	sprites.length = 0;
	var firstRowToDraw = Math.floor(game.center.x / 96);
	var firstColToDraw = Math.floor(game.center.y / 96);

	for (i=firstRowToDraw; i<firstRowToDraw + Math.ceil(game.canvas.width / 96) + 1; i++) {
		for (j=firstColToDraw; j<firstColToDraw + Math.ceil(game.canvas.height / 96) + 1; j++) {
			sprites.push(new Sprite(game.map[i][j], [i*96 - game.center.x, j*96 - game.center.y], [96, 96]));
		}
	}

	//draw characters
	//---------------
	//draw car
	var carDirection = Math.atan2(game.targetOffset.y, game.targetOffset.x);
	sprites.push(new Sprite("car.png", [game.canvas.width/2 - 39, game.canvas.height/2 - 75], [78, 150], carDirection));

	//draw zombies
	for (zombie in game.zombies) {
		if (clip(game.zombies[zombie].position, new Point(50, 50))) {
			var zombiePos = new Point(game.zombies[zombie].position.x - game.center.x, game.zombies[zombie].position.y - game.center.y)
			sprites.push(new Sprite("zombie1.png", [zombiePos.x, zombiePos.y], [50, 50], game.zombies[zombie].direction, true));
		}
	}
 

	for (sprite in sprites) {
		sprites[sprite].staticRender(game.context);
	}

	debugCounter++;
}

function bindKeys() {

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
	game.canvas.width  = 800;
    game.canvas.height = 600;
	game.context = game.canvas.getContext('2d');
    game.screenTileWidth = Math.floor(window.innerWidth / 96) + 1;
    game.screenTileHeight = Math.floor(window.innerHeight / 96) + 1;
    game.zombies.push(new Zombie(new Point(0, 0), Math.PI/4));
    resources.load([
    	'grass.png',
    	'dirt.png',
    	'car.png',
    	'zombie1.png'
   	]);
    resources.onReady(animate);
    bindKeys();
});