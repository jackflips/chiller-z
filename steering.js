(function() {

    function follow(agent, leader) {
        var tv = leader.velocity.multiply(-1).unit * 10; //10 is tail constant
        var behind = leader.position.addPoint(new Point(tv.x, tv.y));
        var force = arrive(behind);
    }

    function seek(agent, leader) {
        return leader.position.subtract(agent.position).unit().multiply(agent.maxSpeed);
    }

    function separate(agent, leader) {

    }

    window.steering = {
        seek: seek,
        follow: follow,
        separate: separate
    }
})();