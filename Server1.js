const helpers =  require("./helpers")

// !*********************************************************!

// The process explained below,
// is the same for each server with minor changes

// !*********************************************************!


const io = require("socket.io-client");
//---------------------------------------------------------------------------------------------------//


//---------------------------------------------------------------------------------------------------//
// Initialize the socket on the appropriate
// port, displaying the messages for 
// connecting and disconnecting

const socket=io("https://project-balancer-1.appspot.com/")


// We represent the pool of requests
// that this server has to deal with,
// via an array. A function is called
// every n ms , which checks if our pool
// has an entry and then removes the older
// entry, in other words a timed FIFO
const pool = {items : [], length : 0}
let freshStart = true

socket.on("connect", () => {
	console.log('Connected server 1');
	
	
})
socket.on("disconnect", () => {
	console.log('Socket 1 disconnected');
	
	
})

//---------------------------------------------------------------------------------------------------//

// Server 1 listens to balance1 data
// and displays the data accordingly,
// it then adds a record to this server's
// pool of requests

socket.on("message",(data) => {
	
	
	// Everytime we receive a request we push it to our pool array along with additional details
	pool.items.push({createdAt: Date.now(), value: data})
	pool["length"] = pool.items.length
	if(freshStart){
		console.time("time")
		let randInterval = helpers.getRandomInRange(400,600)
		removeElementFromPool(randInterval)
		freshStart = false;
	}

	
	
})
socket.on("make_passive_check", () => {
	socket.emit("response_of_check" , pool.length)
})

// It's a timed interval function to remove the first element of our pool , simulating
// the copletion of a request
// setInterval(() => {
// 	if(pool.length > 0){
// 		helpers.removeFirstElement(pool)

// 	}else if(pool.length == 0 && !freshStart){
// 		console.timeEnd("time")
// 		freshStart = true;
// 	}
// 	},helpers.getRandomInRange(400,700));
// setInterval(() => {
// 	console.log(pool);
	
// },300)
function removeElementFromPool(randInterval) {
	setTimeout(() => {
		if(pool.length > 0){
			helpers.removeFirstElement(pool)
			let newRandInterval = helpers.getRandomInRange(400,600)
			removeElementFromPool(newRandInterval)
		}else{
			console.timeEnd("time")
		}
	}, randInterval)
}