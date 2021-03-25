const Web3 = require("web3");
const GreetingContract = require("../client/src/artifacts/Greeting.json");
let web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");

const networks = GreetingContract['networks']
const contractAddress = networks[Object.keys(networks)[0]]['address'];

const Contract = new web3.eth.Contract(GreetingContract['abi'], contractAddress);
Contract.events.GreetingUpdate({
    filter: {}, // Using an array means OR: e.g. 20 or 23
    // fromBlock: 0
}, function(error, event){ })
.on('data', function(event){
    console.log(event); // same results as the optional callback above

    web3.eth.getBalance(contractAddress).then(res=>{
        console.log('Balance is :::', res/Math.pow(10,18)); 
    })

})
.on('changed', function(event){
    // remove event from local database
    console.log("changed:::::::::::::::::::::::::::::::::::::::::");
})
.on('error', console.error);


