const feedingRange = 400;
const caughtDist = 70;
const humanInertia = 50;

function Human (position, velocity) {
	this.maxSpeed = 2;
	this.position = position;
	this.velocity = velocity;
	this.size = 65;
	this.counter = 250;
	this.status = 'live';
	
	var thisHuman = this;

	// Conditions
	var closeToZombie = new Condition();
	closeToZombie.test = function() {
		for (zombie in game.zombies){
			if (euclideanDistance(thisHuman.position, game.zombies[zombie].position) < feedingRange)
				return true;
			return false;
		}
	}
	
	var farFromZombie = new Condition();
	farFromZombie.test = function() {
		for(zombie in game.zombies){
			if (euclideanDistance(thisHuman.position, game.zombies[zombie].position) >= feedingRange)
				return true;
			return false;
		}
	}
	
	var caughtByZombie = new Condition();
	caughtByZombie.test = function() {
		for(zombie in game.zombies){
			if (euclideanDistance(thisHuman.position, game.zombies[zombie].position) <= caughtDist)
				return true;
			}
		return false;
	}
	
	var timeOut = new Condition();
	timeOut.test = function() {
		if (thisHuman.counter == 0)
			return true;
		else
			return false;
	}

	// Actions
	var wanderAction = function() {
		var toSteer = steering.wander(thisHuman).add(steering.separate(thisHuman, game.player, game.humans));
		toSteer = toSteer.truncate(thisHuman.maxSpeed);
		toSteer = toSteer.divide(humanInertia);
		thisHuman.velocity = (thisHuman.velocity.add(toSteer)).truncate(thisHuman.maxSpeed);
	}
	var runAction = function() {
		var quarry = findClosest(thisHuman, game.zombies);
		var toSteer = steering.runAway(thisHuman, game.zombies).add(steering.separate(thisHuman, game.player, game.humans));
		toSteer = toSteer.truncate(thisHuman.maxSpeed);
		toSteer = toSteer.divide(humanInertia);
		thisHuman.velocity = (thisHuman.velocity.add(toSteer)).truncate(thisHuman.maxSpeed);
	}
	var beingEatenAction = function() {
		thisHuman.maxSpeed = .5;
		var toSteer = steering.wander(thisHuman);
		toSteer = toSteer.truncate(thisHuman.maxSpeed);
		toSteer = toSteer.divide(humanInertia);
		thisHuman.velocity = (thisHuman.velocity.add(toSteer)).truncate(0.1);
		thisHuman.counter--;
	}
	var deathAction = function() {
		game.zombies.push(new Zombie(thisHuman.position, new Vector(Math.sqrt(2), Math.sqrt(2))));
		thisHuman.status = 'dead';
	}	
	var nullAction = function() {}

	// States
	var wanderState = new State();
	wanderState.setAction(wanderAction);
	wanderState.setEntryAction(nullAction);
	wanderState.setExitAction(nullAction);
	
	var runState = new State();
	runState.setAction(runAction);
	runState.setEntryAction(nullAction);
	runState.setExitAction(nullAction);
	
	var beingEatenState = new State();
	beingEatenState.setAction(beingEatenAction);
	beingEatenState.setEntryAction(nullAction);
	beingEatenState.setExitAction(deathAction);
	
	var deadState = new State();
	deadState.setAction(nullAction);
	deadState.setEntryAction(nullAction);
	deadState.setExitAction(nullAction);

	// Transitions
	var closeTrans = new Transition();
	closeTrans.setTargetState(runState);
	closeTrans.setAction(nullAction);
	closeTrans.setCondition(closeToZombie);
	
	var farTrans = new Transition();
	farTrans.setTargetState(wanderState);
	farTrans.setAction(nullAction);
	farTrans.setCondition(farFromZombie);
	
	var caughtTrans = new Transition();
	caughtTrans.setTargetState(beingEatenState);
	caughtTrans.setAction(nullAction);
	caughtTrans.setCondition(caughtByZombie);
	
	var deadTrans = new Transition();
	deadTrans.setTargetState(deadState);
	deadTrans.setAction(nullAction);
	deadTrans.setCondition(timeOut);
	
	// Transition Lists
	var wanderTransitions = new Array();
	var runTransitions = new Array();
	var beingEatenTransitions = new Array();
	var deadTransitions = new Array();
	
	wanderTransitions.push(closeTrans);
	
	runTransitions.push(farTrans);
	runTransitions.push(caughtTrans);
	
	beingEatenTransitions.push(deadTrans);
	
	wanderState.setTransitions(wanderTransitions);
	runState.setTransitions(runTransitions);
	beingEatenState.setTransitions(beingEatenTransitions);
	deadState.setTransitions(deadTrans);

	// State Machine
	this.humanFSM = new StateMachine();
	this.humanFSM.setCurrentState(wanderState);
}

Human.prototype.update = function(game){
	var actions = this.humanFSM.update();
	for (var act in actions) {actions[act]();}
}