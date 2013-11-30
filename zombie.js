function Zombie(position, velocity) {
	this.hunger = 0;
	this.target;
	this.maxSpeed = 3.5;
	this.position = position;
	this.velocity = velocity;
}

//Conditions
var time = 4000;
var condition = new Condition();
condition.counter = time;
condition.test = function() {
	if (this.counter <= 0) {
		this.counter = time;
		return true;
	}
	this.counter--;
	return false;
	
};

//Actions
var action1 = function() {};
var enter1 = function() {};
var exit1 = function() {};
var action2 = function() {};
var enter2 = function() {};
var exit2 = function() {};
var transAction = function() {};

//Transition Lists
var demoTrans1 = new Array();
var demoTrans2 = new Array();

//States
var demoState = new State();
demoState.setAction(action1);
demoState.setEntryAction(enter1);
demoState.setExitAction(exit1);
var demoState2 = new State();
demoState2.setAction(action2);
demoState2.setEntryAction(enter2);
demoState2.setExitAction(exit2);

//Transitions
var trans = new Transition();
trans.setTargetState(demoState2);
trans.setAction(transAction);
trans.setCondition(condition);
var trans2 = new Transition();
trans2.setTargetState(demoState);
trans2.setAction(transAction);
trans2.setCondition(condition);

demoTrans1.push(trans);
demoTrans2.push(trans2);
demoState.setTransitions(demoTrans1);
demoState2.setTransitions(demoTrans2);

//State Machine
var demoFSM = new StateMachine();
demoFSM.setCurrentState(demoState);

Zombie.prototype.update = function(game) {
	
	/*if (euclidianDistance(this.position, game.player.position) < 40) {
		this.velocity = steering.separate(this, game.player);
	} else {
		this.velocity = steering.followLeader(this, game.player);
	}//*/

	var actions = demoFSM.update();
	for (var act in actions) {actions[act]();}
	//if (demoFSM.getCurrentState() == demoState) 
	//{
		//this.velocity = steering.followLeader(this, game.player);
		var toSteer = steering.followLeader(this, game.player).divide(25);
		this.velocity = this.velocity.add(toSteer).truncate(this.maxSpeed);
	//}
	//else
	//{
	//	this.velocity = new Vector(0,0,0);
	//}
};

Zombie.prototype.drawVelocityVectors = function(){
	game.context.lineWidth="3";
	game.context.strokeStyle="purple";
	game.context.beginPath();
    game.context.moveTo(this.position.x, this.position.y);
    game.context.lineTo((this.position.add(this.velocity)), (this.position.add(this.velocity)));
	console.log("zombie position: " + (this.position.x) + " " + (this.position.y));
	game.context.stroke();
	game.context.closePath();
}
