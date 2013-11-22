function Zombie(position, velocity) {
	this.hunger = 0;
	this.target;
	this.maxSpeed = 2;
	this.position = position;
	this.velocity = velocity;
}

Zombie.prototype.update = function(game) {
	this.velocity = steering.seek(this, game.player);
};