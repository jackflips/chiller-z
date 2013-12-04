const feedingRange = 400;

function Human (position, velocity) {
	this.maxSpeed = 2;
	this.position = position;
	this.velocity = velocity;
	
	var thisHuman = this;

	// Conditions
	/*var closeToZombie = new Condition();
	closeToZombie.test = function() {
		for (zombie in game.zombies){
			//if this.euclideanDistance()
		}
	}
	
	var caughtByZombie = new Condition();
	caughtByZombie.test = function() {
	}
	
	var timeLapse = new Condition();
	timeLapse.test = function() {
		var timeLeft = 4000;
	}

	// Actions
	var wanderAction = function() {}
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
	var zombieClose = new Transition();
	zombieClose.setTargetState(run);
	zombieClose.setCondition(closeToZombie);
	
	// Transition Lists
	

	// State Machine
	var humanFSM = new StateMachine();
	humanFSM.setCurrentState(wander);*/
}

Human.prototype.update = function(game){

}