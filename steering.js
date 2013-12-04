(function() {

	const tail = 80;				//distance of tail behind leader
	const tailFalloffFactor = 10;
	const seperationDistance = 100;
	const anticipateFactor = 3;
	const evadeFrameSeek = 10;
	const evadeSideMagnitude = 100;
	
    function followLeader(agent, leader, horde) {
        var force = follow(agent, leader).add(separate(agent, leader, horde));
        //*/var force = seek(agent, leader)
		force = force.truncate(agent.maxSpeed);
        return force;
    }

    function follow(agent, leader) {
		var target;
		if(leader.velocity.length() != 0)
		{
			//if leader is moving, move to a point behind
			var tv = leader.velocity.negative();
			tv = tv.unit();
			tv = tv.multiply(tail); //70 is tail constant
			target = leader.position.add(tv);
		}
		else
		{
			//otherwise, move to the leader's position
			target = leader.position;
		}
		target = target.subtract(agent.position);
		target.truncate(agent.maxSpeed * tailFalloffFactor);
		return target.divide(tailFalloffFactor);
    }

    function separate(agent, leader, horde) {
        var force = new Vector(0, 0);
        var neighborCount = 0;

		{
			var dist = euclideanDistance(agent.position, leader.position)
			if (dist < seperationDistance)
			{
				var diff = leader.position.subtract(agent.position);
				force = diff.unit().multiply(seperationDistance);
				neighborCount++;
			}
		}
		for (member in horde) {
            if (horde[member] != agent) {
				var dist = euclideanDistance(agent.position, horde[member].position)
				if (dist < seperationDistance)
				{
					var diff = horde[member].position.subtract(agent.position);
					force = force.add(diff.unit().multiply(seperationDistance));
					neighborCount++;
				}
            }
        }
        if (neighborCount == 0)
            return force;

		//force = force.divide(neighborCount);
        return force.negative();
    }

	function wander(agent)
	{
		var prevDirection = toDirection(agent.velocity);
		var outDirection = prevDirection + (Math.random() - .5) * 2;
		return toVector(outDirection);
	}
	
	//combines evade with flee, runs over an array
	function runAway(agent, horde)
	{
		var force = new Vector(0,0);
		for(pursuer in horde)
		{
			force = force.add(flee(agent, horde[pursuer]));
			force = force.add(evade(agent, horde[pursuer]));
		}
		force.truncate(agent.maxSpeed);
	}
	
	function flee(agent, scarything)
	{
		var target;
		target = scarything.position;
		target = target.subtract(agent.position);
		target = target.unit().multiply(agent.maxSpeed );
		target = target.negative();
		return target;
	}
	
	function evade(agent, pursuer)
	{
		var projection = pursuer.velocity.unit().multiply(agent.velocity.dot(pursuer.velocity.unit()));
		if((projection.x > 0 && pursuer.velocity.x > 0)
		    || (projection.x < 0 && pursuer.velocity.x < 0))
		{
			if(projection.length() < pursuer.velocity.lenghth * evadeFrameSeek)
			{
				var rejection = agent.velocity.subtract(projection);
				if(rejection.length() < evadeSideMagnitude)
				{
					var magnitude = evadeSideMagnitude - rejection.length();
					return rejection.unit().multiply(magnitude);
				}
			}
		}
		
		return new Vector(0,0);
	}
	
	//not sure if method signature correct
	//therefore, is not in the list
	function avoid_obstacles(agent)
	{
		//TODO
	}
	
	function pursue(agent, quarry)
	{
		var target;
		if(quarry.velocity.length() != 0)
		{
			//if quarry is moving, move to a point ahead
			//how far ahead should really vary with distance
			//but whatever
			var anticept = quarry.velocity;
			anticept = anticept.multiply(anticipateFactor);
			target = quarry.position.add(anticept);
		}
		else
		{
			//otherwise, move to the quarry's position
			target = quarry.position;
		}
		target = target.subtract(agent.position);
		target.truncate(agent.maxSpeed * 2);
		return target.divide(2);
	}
	
    window.steering = {
        followLeader: followLeader,
        follow: follow,
        separate: separate,
		wander: wander,
		evade: evade,
		pursue: pursue,
		runAway: runAway,
		flee: flee
    }
})();