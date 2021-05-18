const app = require('express')();
const server = app.listen(4000);
const io = require('socket.io')(server);
const helpers =  require("./helpers")



// We always assume that server number 0 is our starting point
// he has no requests and is brand new

let freshStart = true // Flag is true at the start of every run, and is set false when we receive first request
let pool = {items:[], length : 0}
let activeNode = 0
let leastConnections = 100
let nodeWithLeastConnections = 0
let leastResTime = 6000
let nodeWithLeastResTime = 0
const loadBalancing = false //Change this to enable load balancing, or no load balancing
const clients = []
console.log('Load Balancing is turned', loadBalancing);


io.on("connection", (socket) => {
	// We push in the client array, each new client connection along with some details we will need later
	clients.push({socket, connectionNum : null, resTime : null});
	console.log('Connected with client ' + socket.id)

	socket.on('disconnect', function () {
		console.log('disconnected');
	 });
	// We set up a passive check on each application server to occur every N ms
	// the server emits a response of check event that we use to update the
	// details of each individual server
	setInterval(() => socket.emit("make_passive_check"), 500)
	socket.on("response_of_check",(data) => updateSocketInfo(socket, data) )
	
});

app.get("/", (req,res) => {
	if(loadBalancing){
		clients[activeNode]["socket"].emit("message", "Request goes here")
		console.log(activeNode, "is the active node at this moment");
		// activeNode = LeastConnections()
		// activeNode = WeightedResponseTime()
		activeNode = RoundRobin(activeNode)
	}else{
		pool.items.push({createdAt: Date.now(), value: "Request goes here"})
		pool["length"] = pool.items.length
		if(freshStart){
			console.time("time")
			let randInterval = helpers.getRandomInRange(400,600)
			removeElementFromPool(randInterval)
			freshStart = false;
		}
	
	}
	
	
	
		
})


function updateSocketInfo(socket, data){
	clients.map( (client,index) => {
		if(client.socket.id === socket.id){ //filter impleme TODO
			client.connectionNum = data 
		}
		if(client.connectionNum < leastConnections ){
			leastConnections = client.connectionNum
			nodeWithLeastConnections = index
		}
		return client
	})

}
function RoundRobin(activeNode){
	activeNode = activeNode + 1
	if(activeNode === clients.length){
		activeNode = 0
	}
	return activeNode
}
function LeastConnections(){

	// clients.map( (client, index) => {
	// 	if(client.connectionNum < least ){
	// 		least = client.connectionNum
	// 		nodeWithLeast = index
	// 	}
	// })

	return nodeWithLeastConnections
}
function AntColony(){

}
function WeightedResponseTime(){
	return nodeWithLeastResTime
}

// This is enabled only on loadBalancer  === false



setInterval(() => {
	console.log(pool);
	
},300)

// We create the debounce function to measure the active time we receive quests,
// when we receive the first request the timer starts and then when we have not 
// received requests for 1000ms, the timer stops and displays how long we have been receiving requests
// const debounce = helpers.debounce(function(){
// 	if(pool.length === 0 && !freshStart){
// 	  console.timeEnd("time")
// 	}
//   }, 500);
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
