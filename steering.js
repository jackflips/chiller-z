(function() {

    function followLeader(agent, leader, horde) {
        var force = seek(agent, leader).add(separate(agent, leader, horde));
        //*/var force = seek(agent, leader)
		if (force.length() > agent.maxSpeed)
            return force.unit().multiply(agent.maxSpeed);
        else
            return force;
    }

    function seek(agent, leader) {
		var target;
		if(leader.velocity.length() != 0)
		{
			//if leader is moving, move to a point behind
			var tv = leader.velocity.negative();
			tv = tv.unit();
			tv = tv.multiply(70); //70 is tail constant
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

		//consts
		var maxDist = 55;

		{
			var dist = euclidianDistance(agent.position, leader.position)
			if (dist < maxDist)
			{
				var diff = leader.position.subtract(agent.position);
				force = diff.unit().multiply(maxDist);
				neighborCount++;
			}
		}
		for (member in horde) {
            if (horde[member] != agent) {
				var dist = euclidianDistance(agent.position, horde[member].position)
				if (dist < maxDist)
				{
					var diff = horde[member].position.subtract(agent.position);
					force = force.add(diff.unit().multiply(maxDist));
					neighborCount++;
				}
            }
        }
        if (neighborCount == 0)
            return force;

		force = force.divide(neighborCount);
        return force.negative();
    }

    window.steering = {
        followLeader: followLeader,
        seek: seek,
        separate: separate
    }
})();