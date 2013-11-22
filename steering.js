(function() {

    function followLeader(agent, leader) {
        sepForce = separate(agent, leader);
        console.log(sepForce);
        return seek(agent, leader).add(sepForce);
    }

    function seek(agent, leader) {
        var tv = leader.velocity.negative().unit().multiply(25); //10 is tail constant
        var behind = leader.position.add(tv);
        return behind.subtract(agent.position).unit().multiply(agent.maxSpeed);
    }

    function separate(agent, leader) {
        var force = new Vector(0, 0);
        var neighborCount = 0;
        for (zombie in game.zombies) {
            if (euclidianDistance(agent.position, game.zombies[zombie].position) <= 100) {
                force = force.subtract(game.zombies[zombie].position.subtract(agent.position));
                neighborCount++;
            }
        }

        if (neighborCount != 0) {
            force.x /= neighborCount;
            force.y /= neighborCount;
            force = force.negative();
        }
        return force.unit().multiply(300);
    }

    window.steering = {
        followLeader: followLeader,
        seek: seek,
        separate: separate
    }
})();