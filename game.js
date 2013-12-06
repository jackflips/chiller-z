
var game;
var sprites = [];
var debugCounter = 0;

var g = 0;

var MOVEMENT_RATE = 4;

const tileSize = 96;
const tileOffset = -48;
const numHumans = 1;
const numZombies = 1;

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
			if ((i < -195 || i > 190) || (j < -195 || j > 190)) {
				//outer border is mountains
				map[i][j] = 2;
			} else if ((i < -192 || i > 187) || (j < -192 || j > 187)) {
				if (Math.random() < 0.4) {
					map[i][j] = 2;
				} else if (Math.random() > 0.5) {
					map[i][j] = 0;
				} else {
					map[i][j] = 1;
				}
			} else {
				map[i][j] = 0;
			}
		}
	}
	
	for (s = 0; s < 4000; s++) {
		source = map[0][0];
		var dirt = new Vector(0, source);
		dirt.x = Math.floor((Math.random()*400)-200);
		dirt.y = Math.floor((Math.random()*400)-200);
		map[dirt.x][dirt.y] = 1;
		if (dirt.x > -190 && dirt.x < 190 && dirt.y > -190 && dirt.y < 190) {
			// Because the game throws a fit if the random tile is on/near the edge
			if (Math.random() < .5) {
				map[dirt.x-1][dirt.y-1] = 1;
			}
			if (Math.random() < .6) {
				map[dirt.x][dirt.y-1] = 1;
			}
			if (Math.random() < .5) {
				map[dirt.x+1][dirt.y-1] = 1;
			}
			if (Math.random() < .4) {
				map[dirt.x-1][dirt.y] = 1;
			}
			if (Math.random() < .5) {
				map[dirt.x+1][dirt.y] = 1;
			}
			if (Math.random() < .6) {
				map[dirt.x-1][dirt.y+1] = 1;
			}
			if (Math.random() < .7) {
				map[dirt.x][dirt.y+1] = 1;
			}
			if (Math.random() < .6) {
				map[dirt.x+1][dirt.y+1] = 1;
			}
			if (Math.random() < .5) {
				map[dirt.x+2][dirt.y+1] = 1;
			}
			if (Math.random() < .3) {
				map[dirt.x+1][dirt.y+2] = 1;
			}
			if (Math.random() < .3) {
				map[dirt.x+2][dirt.y+2] = 1;
			}
			if (Math.random() < .3) {
				map[dirt.x-2][dirt.y+1] = 1;
			}
		}
	}

	var river = [];
	var directions = {up: new Vector(0,-1), down: new Vector(0,1), left: new Vector(-1,0), right: new Vector(1,0)};
	var last = directions.down;
	var start = map[0][(Math.random()*400)-200];
	var index = new Vector(0, start);
	river.push(index);
	while (index.x > -200 && index.x < 200 && index.y > -200  && index.y < 200) {
		chance = Math.random();
		if (chance < .4 && last != directions.up) {
			index = index.add(directions.down);
			map[index.x][index.y] = 5;
			last = directions.down;
		} else if (chance < .6 && last != directions.right) {
			index = index.add(directions.left);
			map[index.x][index.y] = 5;
			last = directions.left;
		} else if (chance < .8 && last != directions.left) {
			index = index.add(directions.right);
			map[index.x][index.y] = 5;
			last = directions.right;
		} else if (last != directions.down) {
			index = index.add(directions.up);
			map[index.x][index.y] = 5;
			last = directions.up;
		}
		river.push(index);
	}
	var bridgeCounter = 1;
	var lastTile = new Vector(1000, 1000); //arbitrary out of scope
	for (tile in river) {
		var riverTile = river[tile];
		if (map[riverTile.x][riverTile.y-1] < 3 && 
				map[riverTile.x][riverTile.y+1] >= 3 && 
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //top left corner
			map[riverTile.x][riverTile.y] = 12;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] >= 3 &&
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //top right corner
			map[riverTile.x][riverTile.y] = 13;
		} else if (map[riverTile.x][riverTile.y-1] >= 3 &&
				map[riverTile.x][riverTile.y+1] < 3 && 
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //bottom left corner
			map[riverTile.x][riverTile.y] = 14;
		} else if (map[riverTile.x][riverTile.y-1] >= 3 &&
				map[riverTile.x][riverTile.y+1] < 3 &&
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //bottom right corner
			map[riverTile.x][riverTile.y] = 15;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] >= 3 && 
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //top is not water
			map[riverTile.x][riverTile.y] = 9;
		} else if (map[riverTile.x][riverTile.y-1] >= 3 &&
				map[riverTile.x][riverTile.y+1] < 3 && 
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //bottom
			map[riverTile.x][riverTile.y] = 10;
		} else if (map[riverTile.x][riverTile.y-1] >= 3 &&
				map[riverTile.x][riverTile.y+1] >= 3 &&
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //left
			map[riverTile.x][riverTile.y] = 7;
		} else if (map[riverTile.x][riverTile.y-1] >= 3 &&
				map[riverTile.x][riverTile.y+1] >= 3 && 
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //right
			map[riverTile.x][riverTile.y] = 8;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] < 3 &&
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //right and left
				map[riverTile.x][riverTile.y] = 11;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] >= 3 &&
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //top and bottom
			map[riverTile.x][riverTile.y] = 6;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] >= 3 &&
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //water on three sides - top
			map[riverTile.x][riverTile.y] = 16;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] < 3 &&
				map[riverTile.x-1][riverTile.y] >= 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //water on three sides - left
			map[riverTile.x][riverTile.y] = 17;
		} else if (map[riverTile.x][riverTile.y-1] < 3 &&
				map[riverTile.x][riverTile.y+1] < 3 &&
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] >= 3) { //water on three sides - right
			map[riverTile.x][riverTile.y] = 18;
		} else if (map[riverTile.x][riverTile.y-1] >= 3 &&
				map[riverTile.x][riverTile.y+1] < 3 &&
				map[riverTile.x-1][riverTile.y] < 3 && 
				map[riverTile.x+1][riverTile.y] < 3) { //water on three sides - bottom
			map[riverTile.x][riverTile.y] = 19;
		} else { //middle of river
			map[riverTile.x][riverTile.y] = 5;
		}
		if (riverTile.subtract(lastTile).equals(directions.down) &&
			map[riverTile.x-1][riverTile.y] > 3 &&
			map[riverTile.x+1][riverTile.y] > 3) {
			if (bridgeCounter % 8 == 0) {
				map[riverTile.x][riverTile.y] = 4;
			}
			bridgeCounter++;
		}
		lastTile = river[tile];
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
	else if (image == 3) {
		this.image = "images/ocean.png";
	}
	else if (image == 4) {
		this.image = "images/bridge.png";
	}
	else if (image == 5) {
		this.image = "images/riverMid.png";
	}
	else if (image == 6) {
		this.image = "images/riverTopAndBottom.png";
	}
	else if (image == 7) {
		this.image = "images/riverLeft.png";
	}
	else if (image == 8) {
		this.image = "images/riverRight.png";
	}
	else if (image == 9) {
		this.image = "images/riverTop.png";
	}
	else if (image == 10) {
		this.image = "images/riverBottom.png";
	}
	else if (image == 11) {
		this.image = "images/riverRightAndLeft.png";
	}
	else if (image == 12) {
		this.image = "images/riverCornerUL.png";
	}
	else if (image == 13) {
		this.image = "images/riverCornerUR.png";
	}
	else if (image == 14) {
		this.image = "images/riverCornerDL.png";
	}
	else if (image == 15) {
		this.image = "images/riverCornerDR.png";
	}
	else if (image == 16) {
		this.image = "images/riverEndTop.png";
	}
	else if (image == 17) {
		this.image = "images/riverEndLeft.png";
	}
	else if (image == 18) {
		this.image = "images/riverEndRight.png";
	}
	else if (image == 19) {
		this.image = "images/riverEndBottom.png";
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
    	game.context.translate(Math.round(this.pos[0] + this.size[0]/(2 * game.zoomLevel)), Math.round(this.pos[1] + this.size[1]/(2*game.zoomLevel))); 
		game.context.rotate(this.rotation + 1.57079633); 
		this.pos[0] = (-this.size[0]/2) / game.zoomLevel;
		this.pos[1] = (-this.size[1]/2) / game.zoomLevel;
		this._staticRender(ctx);
    } else {
	    this._staticRender(ctx);
	}
	game.context.restore();
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

function requestMove(position, velocity) {
	var newPos = position.add(velocity);
	var newPosTile = newPos.divide(96);
	//console.log(map[Math.round(newPosTile.x)][Math.round(newPosTile.y)]);
	if (map[Math.round(newPosTile.x)][Math.round(newPosTile.y)] !== 2) {
		return newPos;
	} else {
		var allowedMovementX = function() {
			for (i=newPos.x; i<=newPos.x + velocity.x; i++) {
				if (i % 96 == 0) return i-newPos.x;
			}
			return velocity.x;
		}();
		var allowedMovementY = function() {
			for (i=newPos.y; i<=newPos.y + velocity.y; i++) {
				if (i % 96 == 0) return i-newPos.y;
			}
			return velocity.y;
		}();
		return new Vector(allowedMovementX, allowedMovementY);
	}
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
			//var move = requestMove(game.center, game.player.velocity);
			//console.log(move);
			game.center = game.center.add(game.player.velocity);
			game.player.position.x = game.center.x - 37.5;
			game.player.position.y = game.center.y - 37.5;
		}
	}

	//update positions of npcs
	for (zombie in game.zombies) {
		game.zombies[zombie].update(game);
	}
	for (human in game.humans) {
		game.humans[human].update(game);
		if(game.humans[human].status == "dead")
			game.humans.splice(human, 1);
		//not at all sure this will work
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
		if (clip(game.humans[human].position, game.humans[human].size)) {
			var lastPos = humanPos;
			var humanPos = new Point(game.humans[human].position.x - game.center.x, game.humans[human].position.y - game.center.y);
			var humanDir = Math.atan2(game.humans[human].velocity.y, game.humans[human].velocity.x);
			sprites.push(new Sprite("images/human.png", [humanPos.x / game.zoomLevel, humanPos.y / game.zoomLevel], [80, 80], humanDir, true, true));
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

function seedHumans() {
	var humX;
	var humY;
	for(var a = 0; a < 100; a++){
		//whole map = 19200 x 19200
		humX = (Math.random()*(2*4000) - 4000);
		humY = (Math.random()*(2*4000) - 4000);
		game.humans.push(new Human(new Point(humX, humY), new Vector(Math.sqrt(2), Math.sqrt(2))));
	}
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
	for (i=0; i<numZombies; i++) {
    	game.zombies.push(new Zombie(new Point(i*20, i*10), new Vector(Math.sqrt(2), Math.sqrt(2))));
	} 
	//seedHumans(numHumans);
    resources.load([
    	'images/grass.png',
    	'images/dirt.png',
    	'images/car.png',
    	'images/zombie1.png',
		'images/rock.jpg',
		'images/necromancer.png',
		'images/human.png',
		'images/ocean.png',
		'images/bridge.png',
		'images/riverTop.png',
		'images/riverLeft.png',
		'images/riverRight.png',
		'images/riverBottom.png',
		'images/riverRightAndLeft.png',
		'images/riverCornerUR.png',
		'images/riverCornerDL.png',
		'images/riverCornerDR.png',
		'images/riverMid.png',
		'images/riverTopAndBottom.png',
		'images/riverEndTop.png',
		'images/riverEndLeft.png',
		'images/riverEndRight.png',
		'images/riverEndBottom.png',
   	]);
    resources.onReady(animate);
    bindKeys();
});