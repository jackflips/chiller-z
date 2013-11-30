(function() {

    function followLeader(agent, leader) {
        var force = seek(agent, leader).add(separate(agent, leader));
        if (force.length() > agent.maxSpeed)
            return force.unit().multiply(agent.maxSpeed);
        else
            return force;
    }

    function seek(agent, leader) {
        var tv = leader.velocity.negative().unit().multiply(2); //10 is tail constant
        var behind = leader.position.add(tv);
        return behind.subtract(agent.position).unit().multiply(agent.maxSpeed).unit();
    }

    function separate(agent, leader) {
        var v = new Vector(0, 0);
        var neighborCount = 0;

        for (zombie in game.zombies) {
            if (game.zombies[zombie] != agent) {
                if (euclidianDistance(agent.position, game.zombies[zombie].position) < 55) {
                    v.x += game.zombies[zombie].position.x - agent.position.x;
                    v.y += game.zombies[zombie].position.y - agent.position.y;
                    neighborCount++;
                }
            }
        }
        if (neighborCount == 0)
            return v;

        v.x /= neighborCount;
        v.y /= neighborCount;
        return v.negative().unit();
    }

    window.steering = {
        followLeader: followLeader,
        seek: seek,
        separate: separate
    }
})();