const helpers =  require("./helpers")

const io = require("socket.io-client");

const socket=io("http://127.0.0.1:3000/")
const pool = {items : [], length : 0}

let freshStart = true



socket.on("connect", () => {
	console.log('Connected server 3');

	
})


socket.on("disconnect", () => {
	console.log('Socket 3 disconnected');

	
})

socket.on("message",(data) => {

	if(freshStart){
		freshStart = false;
		console.time("time")
	}
	pool.items.push({createdAt: Date.now(), value: data})
	pool["length"] = pool.items.length

})
socket.on("make_passive_check", () => {
	socket.emit("response_of_check" , pool.length)
})

setInterval(() => {
	if(pool.length > 0){
		helpers.removeFirstElement(pool)

	}else if(pool.length == 0 && !freshStart){
		console.timeEnd("time")
		freshStart = true;

	}
	},helpers.getRandomInRange(400,700)
)
setInterval(() => {
	console.log(pool);
	
},300)