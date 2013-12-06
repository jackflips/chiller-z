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
	var tile = new Vector(0,0);
	tile.x = Math.floor((point.x + game.canvas.width/2) / tileSize);
	tile.y = Math.floor((point.y + game.canvas.height/2) / tileSize);
	return tile;
}


function getRect(tile)
{
	var rect = new Object();
	rect.x1 = (tile.x * tileSize) - game.canvas.width/2;// + tileOffset;
	rect.x2 = rect.x1 + tileSize;
	rect.y1 = (tile.y * tileSize) - game.canvas.height/2;// + tileOffset;
	rect.y2 = rect.y1 + tileSize;
	return rect;
}

function horizontalDistance(point, tile)
{
	var rect = getRect(tile);
	if(rect.x1 > point.x)
	{
		return rect.x1 - point.x;
	}
	if(rect.x2 < point.x)
	{
		return point.x - rect.x2;
	}
	return 0;
}

function verticalDistance(point, tile)
{
	var rect = getRect(tile);
	if(rect.y1 > point.y)
	{
		return rect.y1 - point.y;
	}
	if(rect.y2 < point.y)
	{
		return point.y - rect.y2;
	}
	return 0;
}

//DOESN'T WORK and I don't care.

function isImpassible(tile)
{
	if(game.map[tile.x][tile.y] == 2)
		return true;
	if(game.map[tile.x][tile.y] == 3)
		return true;
	if(game.map[tile.x][tile.y] > 4)
		return true;
		
	return false;
}
//*/