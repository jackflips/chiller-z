function euclideanDistance(point1, point2) { //returns distance between 2 points or hypoteneuse of 1 point
	if (point2)
		return (Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)));
	else
		return Math.sqrt(Math.pow(point1.x, 2) + Math.pow(point1.y, 2));
}

function toDirection(vector)  //returns angle in radians of the given vector from 0,0
{
	return Math.atan2(vector.y, vector.x);
}

function toVector(direction)  //returns a unit vector pointing in the specified angle in radians from 0,0
{
	return new Vector(Math.cos(direction), Math.sin(direction));
}

function findClosest(closestTo, list)
{
	var minDistance = 52560000;
	var ownPosition = closestTo.position;
	var closest;
	for(agent in list)
	{
		var dist = euclideanDistance(ownPosition, list[agent].position);
		if(dist < minDistance)
		{
			minDistance = dist;
			closest = list[agent];
		}
	}
	return closest;
}

function getTile(point)
{
	
}

function getRect(tileX, tileY)
{
	
}