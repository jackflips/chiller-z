const maxMaxSpeed = 5.0;
const maxHunger = 1000;
const hungerSlowFactor = .005;
const hungerTransitionLevel = 400;
<<<<<<< HEAD
const zombieInertia = 10;
const humanProximityStartChase = 200;
=======
const zombieInertia = 8;
>>>>>>> 977963147773a018ca99a528f55e7917e8c61505

//TODO: add logic for feeding state
function Zombie(position, velocity) {
	this.hunger = Math.floor(Math.random() * 100);
	this.target;
	this.maxSpeed = 3.5;
	this.position = position;
	this.velocity = velocity;
	this.size = 65;
	
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
		for(human : game.humans)
		{
			if(euclideanDistance(thisZombie.position, game.humans[human].position) < humanProximityStartChase)
			{
				return true;
			}
		}
		return false;
	};
	
	//Actions
	var follow = function() 
	{
		var toSteer = steering.followLeader(thisZombie, game.player, game.zombies);
		toSteer = toSteer.divide(zombieInertia);
		thisZombie.velocity = thisZombie.velocity.add(toSteer).truncate(thisZombie.maxSpeed);
	};
	var wander = function()
	{
		var toSteer = steering.wander(thisZombie).add(steering.separate(thisZombie, game.player, game.zombies));
		toSteer = toSteer.truncate(thisZombie.maxSpeed);
		toSteer = toSteer.divide(zombieInertia);
		thisZombie.velocity = (thisZombie.velocity.add(toSteer)).truncate(thisZombie.maxSpeed);
	};
	var chase = function()
	{
		var quarry = findClosest(thisZombie, game.humans);
		var toSteer = steering.pursue(thisZombie, quarry).add(steering.separate(thisZombie, game.player, game.zombies));
		toSteer = toSteer.truncate(thisZombie.maxSpeed);
		toSteer = toSteer.divide(zombieInertia);
		thisZombie.velocity = (thisZombie.velocity.add(toSteer)).truncate(thisZombie.maxSpeed);
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
