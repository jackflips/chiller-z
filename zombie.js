function Zombie(position, velocity) {
	this.hunger = 0;
	this.target;
	this.maxSpeed = 2;
	this.position = position;
	this.velocity = velocity;
}

//Conditions
var time = 100;
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
var action1 = function() {console.log("GRAAAHHH (action1 running)");};
var enter1 = function() {console.log("entering state 1");};
var exit1 = function() {console.log("exiting action 1");};
var action2 = function() {console.log("guuhhhh (action2 running)");};
var enter2 = function() {console.log("entering state 2");};
var exit2 = function() {console.log("exiting action 2");};
var transAction = function() {console.log("transition action running");};

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
	this.velocity = steering.seek(this, game.player);


	/*
	var actions = demoFSM.update();
	for (var act in actions) {actions[act]();}
	if (demoFSM.getCurrentState() == demoState) {this.direction+=0.1;}
	else {this.direction-=0.1;}
	*/
};
