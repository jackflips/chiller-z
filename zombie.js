const maxMaxSpeed = 5.0;
const maxHunger = 10000;
const hungerSlowFactor = .0005;
const hungerTransitionLevel = 8000;
const zombieInertia = 10;
const humanProximityStartChase = 500;
const humanProximityEndChase = 700;
const feedAmountPerFrame = 20;
//caughtDist is in human.js

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
		for(human in game.humans)
		{
			if(euclideanDistance(thisZombie.position, game.humans[human].position) < humanProximityStartChase)
			{
				return true;
			}
		}
		return false;
	};
	
	var humanIsFar = new Condition();
	humanIsFar.test = function() {
		for(human in game.humans)
		{
			if(euclideanDistance(thisZombie.position, game.humans[human].position) < humanProximityEndChase)
			{
				return false;
			}
		}
		return true;
	};
	
	//Actions
	var follow = function() 
	{
		var toSteer = steering.followLeader(thisZombie, game.player, game.zombies).add(steering.avoid(thisZombie));
		toSteer = toSteer.truncate(thisZombie.maxSpeed);
		toSteer = toSteer.divide(zombieInertia);
		thisZombie.velocity = thisZombie.velocity.add(toSteer).truncate(thisZombie.maxSpeed);
	};
	var wander = function()
	{
		var toSteer = steering.wander(thisZombie).add(steering.separate(thisZombie, game.player, game.zombies)).add(steering.avoid(thisZombie));
		toSteer = toSteer.truncate(thisZombie.maxSpeed);
		toSteer = toSteer.divide(zombieInertia);
		thisZombie.velocity = (thisZombie.velocity.add(toSteer)).truncate(thisZombie.maxSpeed);
	};
	var chase = function()
	{
		var quarry = findClosest(thisZombie, game.humans);
		var toSteer = steering.pursue(thisZombie, quarry).add(steering.separate(thisZombie, game.player, game.zombies)).add(steering.avoid(thisZombie));
		toSteer = toSteer.truncate(thisZombie.maxSpeed);
		toSteer = toSteer.divide(zombieInertia);
		thisZombie.velocity = (thisZombie.velocity.add(toSteer)).truncate(thisZombie.maxSpeed);
		
		//also eat
		if(euclideanDistance(thisZombie.position, quarry.position) < caughtDist)
		{
			thisZombie.hunger = thisZombie.hunger - feedAmountPerFrame;
			if(thisZombie.hunger < 0)
				thisZombie.hunger = 0;
		}
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
	
	var humanFarTransition = new Transition();
	humanFarTransition.setTargetState(followState);
	humanFarTransition.setAction(emptyAction);
	humanFarTransition.setCondition(humanIsFar);
	
	//Transition Lists
	var followTransitions = new Array();
	var hungerTransitions = new Array();
	var chasingTransitions = new Array();
	
	followTransitions.push(hungryTransition);
	followTransitions.push(humanNearTransition);
	
	hungerTransitions.push(satedTransition);
	hungerTransitions.push(humanNearTransition);
	
	chasingTransitions.push(humanFarTransition);
	
	//TODO: improve chasing transitions
	
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
	
	
	if(this.hunger == maxHunger)
	{
		game.zombies.splice(game.zombies.indexOf(this), 1);
	}
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
