function Human (position, velocity) {
	this.maxSpeed = 2;
	this.position = position;
	this.velocity = velocity;
}

// Conditions
var closeToZombie = new Condition();
closeToZombie.test = function() {
}
var caughtByZombie = new Condition();
caughtByZombie.test = function() {
}
var timeLapse = new Condition();
timeLapse.test = function() {
}

// Actions
var wanderAction = function() {}
var 


// Transition Lists

// States
var wander = new State();
var run = new State();
var beingEaten = new State();

// Transitions
var zombieClose = new Transition();
zombieClose.setTargetState(run);
zombieClose.setCondition(closeToZombie);

// State Machine
var humanFSM = new StateMachine();
humanFSM.setCurrentState(wander);

Human.prototype.update = function(game){

}