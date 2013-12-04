const feedingRange = 400;
const caughtDist = 25;
const humanInertia = 10;

function Human (position, velocity) {
	this.maxSpeed = 2;
	this.position = position;
	this.velocity = velocity;
	this.size = 65;
	
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
			return false;
		}
	}
	
	var timeLapse = new Condition();
	timeLapse.test = function() {
		var timeLeft = 4000;
		while(timeLeft > 0){
			timeLeft--;
		}
		return true;
	}

	// Actions
	var wanderAction = function() {
		var toSteer = steering.wander(thisHuman).add(steering.separate(thisHuman, game.player, game.humans));
		toSteer = toSteer.truncate(thisHuman.maxSpeed);
		toSteer = toSteer.divide(humanInertia);
		thisHuman.velocity = (thisHuman.velocity.add(toSteer)).truncate(thisHuman.maxSpeed);
	}
	var runAction = function() {}
	var beingEatenAction = function() {}
	var deathAction = function() {}	
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
	
	// Transition Lists
	var wanderTransitions = new Array();
	var runTransitions = new Array();
	var beingEatenTransitions = new Array();
	
	wanderTransitions.push(closeTrans);
	
	runTransitions.push(farTrans);
	runTransitions.push(caughtTrans);
	
	wanderState.setTransitions(wanderTransitions);
	runState.setTransitions(runTransitions);
	beingEatenState.setTransitions(beingEatenTransitions);

	// State Machine
	this.humanFSM = new StateMachine();
	this.humanFSM.setCurrentState(wanderState);
}

Human.prototype.update = function(game){
	var actions = this.humanFSM.update();
	for (var act in actions) {actions[act]();}
}