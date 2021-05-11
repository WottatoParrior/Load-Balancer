const app = require('express')();
const httpServer = require("http").Server(app);
const io = require("socket.io")(httpServer);
const helpers =  require("./helpers")



// We always assume that server number 0 is our starting point
// he has no requests and is brand new

let freshStart = true // Flah is true at the start of every run, and is set false when we receive first request
let requests = 0
let activeNode = 0
let leastConnections = 100
let nodeWithLeastConnections = 0
let leastResTime = 6000
let nodeWithLeastResTime = 0
const clients = []


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

app.get("/load", (req,res) => {
	res.send("Help")
	clients[activeNode]["socket"].emit("message", "Request goes here")
	activeNode = RoundRobin(activeNode)
	console.log(activeNode, "is the active node at this moment");
	
	// activeNode = LeastConnections()
	// activeNode = WeightedResponseTime()
		
})
setInterval(() => {
	if(requests > 0){
		requests --;
		console.log(requests);
	}else if( requests === 0 && !freshStart){
		console.timeEnd("time")
		freshStart = true;
	}
	}, 400)
app.get("/loadbasic", (req,res) => {
	if(freshStart){
		freshStart = false;
		console.time("time")
	}
	res.send("Help")
	requests ++;
	
	//TODO Same as Servers func
	// activeNode = RoundRobin(activeNode)
	// activeNode = LeastConnections()
	// activeNode = WeightedResponseTime()
	
	
	
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

httpServer.listen(3000);




