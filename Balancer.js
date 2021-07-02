const app = require('express')();
const server = app.listen(4000);
const io = require('socket.io')(server,{pingTimeout : 3000000});
const helpers =  require("./helpers")
const process = require('process');

// We always assume that server number 0 is our starting point
// he has no requests and is brand new

let freshStart = true // Flag is true at the start of every run, and is set false when we receive first request
let pool = {items:[], length : 0}
let activeNode = 0
let pheromoneNode = 0;
let nodeWithLeastConnections = 0;
let leastConnections = 100
let leastResTime = 6000
const loadBalancing = true //Change this to enable load balancing, or no load balancing
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
	res.send("hi");
	if(loadBalancing){
		
		clients[activeNode]["socket"].emit("message", "Request goes here")
		// activeNode = LeastConnections(nodeWithLeastConnections)
		// activeNode = RandomAlgo();
		// activeNode = WeightedResponseTime()
		activeNode = AntColony(15)
		// activeNode = RoundRobin(activeNode)
		// console.log(activeNode, "is the active node at this moment");
		
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
function LeastConnections(nodeWithLeastConnections){
	clients.map( (client, index) => {
		if(client.connectionNum < clients[nodeWithLeastConnections].connectionNum ){
			nodeWithLeastConnections = index
		}
	})
	
	return nodeWithLeastConnections
}
function AntColony(ON){
	let clientsAtMax = []
	let freeClientExists = true
	let activeNode = null;
	let i =pheromoneNode;
	let k=0
	while( i < clients.length){
		
		if(clients[i].connectionNum < ON){
			activeNode = i;
			pheromoneNode = activeNode;
			break;
		}else{
			for(client in clients){
				console.log(clients[client].connectionNum, ON);
				
				if(clients[client].connectionNum > ON){
					clientsAtMax.push(client)
				}
			}
			 
			if(clientsAtMax.length === clients.length){
				activeNode = LeastConnections(nodeWithLeastConnections);
				
				pheromoneNode = activeNode;
				i = clients.length
			}else{
				clientsAtMax = []
			}
		}
		if(i === clients.length - 1){
			i = 0
		}else{
			i++;
		}
	}
	
	
	return activeNode;
}
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
function checkClientStatus(socket, time) {
	

	setTimeout(() => {
		socket.emit("make_passive_check")
		checkClientStatus(socket)
	}, time)
}