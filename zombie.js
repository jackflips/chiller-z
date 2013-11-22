function Zombie(position, direction) {
	this.hunger = 0;
	this.target;
	this.speed = 2;
	this.position = position;
	this.direction = direction;
}

Zombie.prototype.update = function(game) {
	//do stuff
};