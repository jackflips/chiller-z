
var game;
var sprites = [];
var debugCounter = 0;

var g = 0;

var MOVEMENT_RATE = 4;

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
	this.humans = [];
	this.player;
	this.zoomLevel = 1;
}

function Player() {
	this.health = 100;
	this.position;
	this.velocity = new Vector(0, 0);
	this.size = 97;
}



function clip(point, size) {
	if (point.x > game.center.x - (game.canvas.width/2 + size)*game.zoomLevel &&
		point.x < game.center.x + (game.canvas.width/2)*game.zoomLevel &&
		point.y > game.center.y - (game.canvas.height/2 + size)*game.zoomLevel &&
		point.y < game.center.y + (game.canvas.height/2)*game.zoomLevel)
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

function Sprite(image, pos, size, rotation, isCharacter, shouldZoom) {
	if (debugCounter % 100 == 0) {
	}
	if (image == 0) {
		this.image = "images/grass.png";
	}
	else if (image == 1) {
		this.image = "images/dirt.png";
	}
	else if (image == 2) {
		this.image = "images/rock.jpg";
	}
	else {
		this.image = image;
	}
    this.pos = pos;
    this.size = size;
    this.rotation = rotation;
    this.isCharacter = isCharacter;
    this.shouldZoom = shouldZoom;
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
                  this.size[0] / (this.shouldZoom ? game.zoomLevel : 1), this.size[1] / (this.shouldZoom ? game.zoomLevel : 1));
}

//both draws and updates
function draw() {

	//update positions
	//----------------
	//update position of viewport and necromancer
	if (game.currentTarget) {
		if (euclideanDistance(game.currentTarget, game.center) < 5) {
			game.player.velocity = new Vector(0, 0);
		} else {
			var triangleFactor = euclideanDistance(game.targetOffset) / MOVEMENT_RATE;
			game.player.velocity = game.targetOffset.divide(triangleFactor);
			game.center = game.center.add(game.player.velocity);
			game.player.position.x = game.center.x - 32;
			game.player.position.y = game.center.y - 32;
		}
	}

	//update positions of npcs
	for (zombie in game.zombies) {
			game.zombies[zombie].update(game);
	}

	//update position of zombies per frame based on velocity vector
	for (zombie in game.zombies) {
		var thisZombie = game.zombies[zombie];
		thisZombie.position.x += thisZombie.velocity.x;
		thisZombie.position.y += thisZombie.velocity.y;
	}
	
	//update position of humans per frame based on direction and speed
	for (human in game.humans) {
		var thisHuman = game.humans[human];
		thisHuman.position.x += thisHuman.velocity.x;
		thisHuman.position.y += thisHuman.velocity.y;
	}

	//game.zoomLevel = 1 + (.02 * game.zombies.length);
	game.zoomLevel = 1;

	//now draw
	//--------

	//draw world
	sprites.length = 0;
	var tileWidth = 96 / game.zoomLevel;
	var firstRowToDraw = Math.floor(game.center.x / 96);
	var firstColToDraw = Math.floor(game.center.y / 96);

	for (i=firstRowToDraw; i<firstRowToDraw + Math.ceil(game.canvas.width / tileWidth) + 1; i++) {
		for (j=firstColToDraw; j<firstColToDraw + Math.ceil(game.canvas.height / tileWidth) + 1; j++) {
			sprites.push(new Sprite(game.map[i][j], [(i*96 - game.center.x) / game.zoomLevel, (j*96 - game.center.y) / game.zoomLevel], [96, 96], false, false, true));
		}
	}

	//draw characters
	//---------------
	//draw necromancer
	var necroDirection = Math.atan2(game.targetOffset.y, game.targetOffset.x);
	sprites.push(new Sprite("images/necromancer.png", [game.canvas.width/2 - 48.5, game.canvas.height/2 - 48.5], [97, 97], necroDirection, false, true));

	//draw zombies
	for (zombie in game.zombies) {
		if (clip(game.zombies[zombie].position, game.zombies[zombie].size)) {
			var prevPos = zombiePos;
			var zombiePos = new Point(game.zombies[zombie].position.x - game.center.x, game.zombies[zombie].position.y - game.center.y);
			var zombieDir = Math.atan2(game.zombies[zombie].velocity.y, game.zombies[zombie].velocity.x);
			sprites.push(new Sprite("images/zombie1.png", [zombiePos.x / game.zoomLevel, zombiePos.y / game.zoomLevel], [65, 65], zombieDir, true, true));
		}
	}
	
	//draw humans
	for (human in game.humans) {
		if (clip(game.humans[human].position, new Point(80, 80))) {
			var lastPos = humanPos;
			var humanPos = new Point(game.humans[human].position.x - game.center.x, game.humans[human].position.y - game.center.y);
			var humanDir = Math.atan2(game.humans[human].velocity.y, game.humans[human].velocity.x);
			sprites.push(new Sprite("images/human.png", [humanPos.x, humanPos.y], [80, 80], humanDir, true));
			}
	}
	
	for (sprite in sprites) {
		sprites[sprite].staticRender(game.context);
	}
	
	//draw zombie velocity vectors
	//for (zombie in game.zombies) {
	//	game.zombies[zombie].drawVelocityVectors();
	//}

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
	for (i=0; i<7; i++) {
    	game.zombies.push(new Zombie(new Point(i*20, i*10), new Vector(Math.sqrt(2), Math.sqrt(2))));
	}
	game.humans.push(new Human(new Point(50, 50), new Vector(0,0)));
    resources.load([
    	'images/grass.png',
    	'images/dirt.png',
    	'images/car.png',
    	'images/zombie1.png',
		'images/rock.jpg',
		'images/necromancer.png',
		'images/human.png'
   	]);
    resources.onReady(animate);
    bindKeys();
});