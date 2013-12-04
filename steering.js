(function() {

	const tail = 80;
	const seperationDistance = 80;
	
    function followLeader(agent, leader, horde) {
        var force = seek(agent, leader).add(separate(agent, leader, horde));
        //*/var force = seek(agent, leader)
		force = force.truncate(agent.maxSpeed);
        return force;
    }

    function seek(agent, leader) {
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
		target.truncate(agent.maxSpeed * 2);
		return target.divide(2);
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
	
	function evade(agent, pursuer)
	{
		//TODO
	}
	
	//not sure if method signature correct
	//therefore, is not in the list
	function avoid_obstacles(agent)
	{
		//TODO
	}
	
	function pursue(agent, quarry)
	{
		//TODO
	}
	
    window.steering = {
        followLeader: followLeader,
        seek: seek,
        separate: separate,
		wander: wander,
		evade: evade,
		pursue: pursue
    }
})();