function getRandomInRange(min, max) {
	return Math.random() * (max - min) + min;
  }
function removeFirstElement(pool) {
	pool.items.shift();
	pool["length"] = pool.items.length
}


module.exports = {
	getRandomInRange,removeFirstElement
}
