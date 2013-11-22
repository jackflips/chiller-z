// StateMachine.js
// referenced implementation from textbook
// State, Transition, Finite State Machine

function State(action, entryAction, exitAction) {
	this.setAction = function(action) {this.action = action;};
	this.getAction = function() {return this.action;};
	
	this.setEntryAction = function(action) {this.entryAction = action;};
	this.getEntryAction = function() {return this.entryAction;};
	
	this.setExitAction = function(action) {this.exitAction = action;};
	this.getExitAction = function() {return this.exitAction;};
	
	this.setTransitions = function(trans) {this.transitions=trans;};
	this.getTransitions = function() {return this.transitions;};
}

function Transition() {
	this.setTargetState = function(state) {this.targetState = state;};
	this.getTargetState = function() {return this.targetState;};
	
	this.setAction = function(action) {this.action = action;};
	this.getAction = function() {return this.action;};
	
	this.setCondition = function(condition) {this.condition = condition;};
	this.isTriggered = function() {return this.condition.test();};
}

function Condition() {
	this.test = function() {return false;};
}

function StateMachine() {	
	this.update = function() {
		this.actions = new Array();
		this.transition = null;
		this.targetState;
		
		var trans = this.currentState.getTransitions();
		for(var i = 0; i < trans.length; i++) {
			if (trans[i].isTriggered()) {
				this.transition = trans[i];
				break;
			}
		}
		
		if (this.transition != null) {
			this.targetState = this.transition.getTargetState();
			if (this.currentState.getExitAction() != null) this.actions.push(this.currentState.getExitAction());
			if (this.transition.getAction() != null) this.actions.push(this.transition.getAction());
			if (this.targetState.getEntryAction() != null) this.actions.push(this.targetState.getEntryAction());
			this.currentState = this.targetState;
			return this.actions;
		}
		else {
			this.actions.push(this.currentState.getAction());
			return this.actions;
		}
	};
	
	this.setCurrentState = function(state) {this.currentState = state;};
	this.getCurrentState = function() {return this.currentState;};
}