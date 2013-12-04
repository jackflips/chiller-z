const maxMaxSpeed = 5.0;
const maxHunger = 1000;
const hungerSlowFactor = .005;
const hungerTransitionLevel = 800;

//TODO: add logic for feeding state
function Zombie(position, velocity) {
	this.hunger = 0;
	this.target;
	this.maxSpeed = 3.5;
	this.position = position;
	this.velocity = velocity;
	this.size = 50;
	
	var thisZombie = this;
	
	//Conditions
	var isHungered = new Condition();
	isHungered.test = function() {
		if(thisZombie.hunger >= hungerTransitionLevel)
			return true;
		return false;
	};
	
	var isSated = new Condition();
	isSated.test = function() {
		if(thisZombie.hunger < hungerTransitionLevel)
			return true;
		return false;
	};
	
	var humanIsNear = new Condition();
	humanIsNear.test = function() {
		return false
		//HUMANS_TODO
	};
	
	//Actions
	var follow = function() 
	{
		var toSteer = steering.followLeader(thisZombie, game.player, game.zombies);
		toSteer = toSteer.divide(4);
		thisZombie.velocity = thisZombie.velocity.add(toSteer).truncate(thisZombie.maxSpeed);
	};
	var wander = function()
	{
		//TODO
	};
	var chase = function()
	{
		//HUMANS_TODO
	};
	
	var emptyAction = function() {};

	//States
	var followState = new State();
	followState.setAction(follow);
	followState.setEntryAction(emptyAction);
	followState.setExitAction(emptyAction);
	
	var hungerState = new State();
	hungerState.setAction(wander);
	hungerState.setEntryAction(emptyAction);
	hungerState.setExitAction(emptyAction);
	
	var chasingState = new State();
	chasingState.setAction(chase);
	chasingState.setEntryAction(emptyAction);
	chasingState.setExitAction(emptyAction);

	//Transitions
	var hungryTransition = new Transition();
	hungryTransition.setTargetState(hungerState);
	hungryTransition.setAction(emptyAction);
	hungryTransition.setCondition(isHungered);
	
	var satedTransition = new Transition();
	satedTransition.setTargetState(followState);
	satedTransition.setAction(emptyAction);
	satedTransition.setCondition(isSated);
	
	var humanNearTransition = new Transition();
	humanNearTransition.setTargetState(chasingState);
	humanNearTransition.setAction(emptyAction);
	humanNearTransition.setCondition(humanIsNear);
	
	//Transition Lists
	var followTransitions = new Array();
	var hungerTransitions = new Array();
	var chasingTransitions = new Array();
	
	followTransitions.push(hungryTransition);
	followTransitions.push(humanNearTransition);
	
	hungerTransitions.push(satedTransition);
	hungerTransitions.push(humanNearTransition);
	
	//TODO: chasing transitions
	
	followState.setTransitions(followTransitions);
	hungerState.setTransitions(hungerTransitions);
	chasingState.setTransitions(chasingTransitions);

	//State Machine
	this.FSM = new StateMachine();
	this.FSM.setCurrentState(followState);
}

Zombie.prototype.update = function(game) {
	
	this.hunger++;
	this.maxSpeed = maxMaxSpeed - (this.hunger * hungerSlowFactor);

	var actions = this.FSM.update();
	for (var act in actions) {actions[act]();}
	
	
	//HUMANS_TODO: remove this
	if(this.hunger == maxHunger)
		this.hunger = 0;
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
