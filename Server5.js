const helpers =  require("./helpers")

const io = require("socket.io-client");

const socket=io("http://127.0.0.1:4000/")
const pool = {items : [], length : 0}

let freshStart = true



socket.on("connect", () => {
	console.log('Connected server 5');

	
})


socket.on("disconnect", () => {
	console.log('Socket 5 disconnected');

	
})

socket.on("message",(data) => {

	
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

// setInterval(() => {
// 	if(pool.length > 0){
// 		helpers.removeFirstElement(pool)

// 	}else if(pool.length == 0 && !freshStart){
// 		console.timeEnd("time")
// 		freshStart = true;

// 	}
// 	},helpers.getRandomInRange(400,700)
// )
// setInterval(() => {
// 	console.log(pool);
	
// },300)
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
			freshStart = true

		}
	}, randInterval)
}