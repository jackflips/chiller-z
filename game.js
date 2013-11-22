
var game;
var sprites = [];
var debugCounter = 0;

var lastCalledTime;
var fps;

var MOVEMENT_RATE = 5;

function Point(x, y) {
	return new Vector(x, y);
}

function Game() {
	this.map;
	this.center;
	this.canvas;
	this.context;
	this.currentTarget;
	this.targetOffset = new Point(0, -1);
	this.zombies = [];
	this.player;
}

function Player() {
	this.health = 100;
	this.position;
	this.velocity = new Vector(0, 0);
	this.size = new Point(78, 150);
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
			if ((i < -195 || i > 195) || (j < -195 || j > 195)) {
				//outer border is mountains
				if (Math.random() < 0.8) {
					map[i][j] = 2;
				} else {
					map[i][j] = 1;
				}
			} else {
				//not mountains
				if (Math.random() < 0.7) {
					map[i][j] = 0;
				} else {
					map[i][j] = 1;
				}
			}
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
	else if (image == 2) {
		this.image = "rock.jpg";
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
			game.player.velocity = new Vector(0, 0);
		} else {
			var triangleFactor = euclidianDistance(game.targetOffset) / MOVEMENT_RATE;
			game.player.velocity = game.targetOffset.divide(triangleFactor);
			game.center = game.center.add(game.player.velocity);
			game.player.position = game.center;
		}
	}

	//update positions of npcs
	for (zombie in game.zombies) {
		game.zombies[zombie].update(game);
	}

	//update position of zombies per frame based on direction and speed. (write this now.)
	for (zombie in game.zombies) {
		var thisZombie = game.zombies[zombie];
		thisZombie.position.x += thisZombie.velocity.x;
		thisZombie.position.y += thisZombie.velocity.y;
	}

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
			var zombieDir = Math.atan2(game.zombies[zombie].velocity.y, game.zombies[zombie].velocity.x);
			sprites.push(new Sprite("zombie1.png", [zombiePos.x, zombiePos.y], [50, 50], zombieDir, true));
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
    		game.targetOffset = mouseOffset.subtract(new Point(canvas.width/2, canvas.height/2));
    		game.currentTarget = game.center.add(game.targetOffset);
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
	game.player = new Player();
	game.player.position = game.center;
	for (i=0; i<4; i++) {
    	game.zombies.push(new Zombie(new Point(i*250, i*10), new Vector(Math.sqrt(2), Math.sqrt(2))));
	}
    resources.load([
    	'grass.png',
    	'dirt.png',
    	'car.png',
    	'zombie1.png',
    	'bluedot.png',
		'rock.jpg'
   	]);
    resources.onReady(animate);
    bindKeys();
});