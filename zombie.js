var maxMaxSpeed = 5.0;

function Zombie(position, velocity) {
	this.hunger = 0;
	this.target;
	this.maxSpeed = 3.5;
	this.position = position;
	this.velocity = velocity;
}

//Conditions
var time = 400;
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
var action1 = function(zombie) 
{
	var toSteer = steering.followLeader(zombie, game.player, game.zombies);
	toSteer = toSteer.divide(4);
	zombie.velocity = zombie.velocity.add(toSteer).truncate(zombie.maxSpeed);
};
var enter1 = function(zombie) {};
var exit1 = function(zombie) {};
var action2 = function(zombie) {};
var enter2 = function(zombie) {};
var exit2 = function(zombie) {};
var transAction = function(zombie) {};

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
	for (var act in actions) {actions[act](this);}
	//if (demoFSM.getCurrentState() == demoState) 
	//{
		//this.velocity = steering.followLeader(this, game.player);
	
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
    game.context.moveTo((this.position.x + 400), (this.position.y + 300));
    game.context.lineTo(((this.position.x + this.velocity.x + 400)*1.2), ((this.position.y + this.velocity.y + 300)*1.2));
	game.context.stroke();
	//console.log((this.position.x + this.velocity.x + 400));
}
