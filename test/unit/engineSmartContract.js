const { Math } = require("@ungap/global-this");
const {convertBN, makeid} = require("../utils/index.js")

const EngineContract = artifacts.require('BetEngine');

contract('Engine Contract', (accounts)=>{
    let engineContract = null;
    beforeEach(async()=>{
     engineContract = await EngineContract.deployed();
    });
    
    it('should check if owner', async()=>{
        const isOwner = await engineContract.iamOwner();
        assert(isOwner == "yes");
    });
    
    it('should change owner to new address', async ()=>{
        const newAddress = accounts[1];
        await engineContract.changeOwner(newAddress);
        
        const isOwner = await engineContract.iamOwner();
        assert(isOwner != "yes");
        assert(isOwner == "no");

        // change back to default account
        await engineContract.changeOwner(accounts[0], {from: accounts[1]});
    });
    
    it('should check if non existent bet doesnt exists', async()=>{
        const bet = await engineContract.bets('b01');
        assert(bet['exists'] == false);
    });
    
    
    
    it('should check if bet is created on bet function', async()=>{
        const odsId = makeid(10);
        const betId = makeid(10);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId);
        
        const bet = await engineContract.bets(betId);
        assert(bet['exists'] == true);
        
    });
    
    it('should check if ods is added to bet', async()=>{
        const odsId = makeid(10);
        const betId = makeid(10);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId);
        
        const bet = await engineContract.bets(betId);
        assert(bet['ods1'] == odsId);
        
    });
    
        
    it('should check if ods are added to bet correctly', async()=>{
        const betId = makeid(10);
        const odsId = makeid(10);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:0.1*Math.pow(10,18)});
        
        const odsId2 = makeid(10);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:0.1*Math.pow(10,18), from: accounts[1]});
        
        let bet = await engineContract.bets(betId);
        
        // console.log(bet, odsId2);

        assert(bet['exists'] == true);
        assert(bet['ods1'] == odsId);
        assert(bet['ods2'] == odsId2);
        assert(bet['ods3'] == '');
        
        const odsId3 = makeid(10);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId3, {value:0.1*Math.pow(10,18), from:accounts[2]});
        
        bet = await engineContract.bets(betId);
        assert(bet['ods3'] == odsId3);
        
    });
    
    
    it('should confirm that ods pool total is incremented', async()=>{
        
        const odsId = makeid(10);
        const amount = 0.1*Math.pow(10,18);
        await engineContract.bet(makeid(10), parseInt(new Date().getTime()/1000), odsId, {value:amount});

        const addedOds = await engineContract.getOdsPoolSize(odsId);

        assert(convertBN(addedOds.toString()) == amount)
        
    });

        
    it('should confirm pool total after bets', async()=>{
        
        const odsId = makeid(10);
        const betId = makeid(10);
        const amount = 0.1*Math.pow(10,18);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:amount});

        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:amount, from: accounts[1]});

        const addedOds = await engineContract.getOdsPoolSize(odsId);
        assert(convertBN(addedOds.toString()) == amount*2)
        
    });


    it('should confirm a users bet in pool', async()=>{
        
        const odsId = makeid(10);
        const betId = makeid(10);
        const amount = 0.1*Math.pow(10,18);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:amount});

        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:amount});

        const addedOds = await engineContract.getUserTotalBetInOdsPool(odsId);
        assert(convertBN(addedOds.toString()) == amount*2)
        
    });


    it('should confirm a user cannot bet in more than one pool of a particular bet', async()=>{
        const betId = makeid(10);

        const odsId = makeid(10);
        const odsId2 = makeid(10);

        const amount = 0.1*Math.pow(10,18);
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:amount});

        try {
            await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:amount});
            assert(1==2);
        } catch (error) {
            assert(1==1);
        }
    });

    it('should set winning ods by owner', async()=>{

        const betId = makeid(10)
        const odsId = makeid(10);
        const odsId2 = makeid(10);
        const odsId3 = makeid(10);

        const choosenWinningOds = odsId2;
        const amount = 0.1*Math.pow(10,18);

        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:amount, from:accounts[1]});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:amount, from:accounts[3]});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId3, {value:amount, from:accounts[2]});

        await engineContract.setWinningOds(betId, choosenWinningOds);
        const winningOds = await engineContract.winningOds(betId);

        assert(winningOds == choosenWinningOds);

    });
    // it('', async()=>{});
    // it('', async()=>{});
    
})