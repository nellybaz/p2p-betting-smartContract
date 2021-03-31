const { Math, parseInt, Date } = require("@ungap/global-this");
const {makeid} = require("../utils/index.js")

const EngineContract = artifacts.require('BetEngine');

contract('Engine Contract Integration', (accounts)=>{
    let engineContract = null;
    beforeEach(async()=>{
     engineContract = await EngineContract.deployed();
    });
    
    it('should check that a single user gets total amount on disburse after betting', async()=>{
        const betId = makeid(10);
        const odsId = makeid(10);
        const odsId2 = makeid(10);
        const odsId3 = makeid(10);
        
        const choosenWinningOds = odsId;
        
        const ods2PoolAmount = 0.5*Math.pow(10,18);
        
        const ods3PoolAmount = 0.5*Math.pow(10,18);
        
        const userBetAmount = 0.2*Math.pow(10,18);
        
        // winner is accounts index 0
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:userBetAmount});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:ods2PoolAmount, from: accounts[1]});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId3, {value:ods3PoolAmount, from: accounts[2]});
        
        const bet = await engineContract.bets(betId);
        assert(bet['exists'] == true);
        
        await engineContract.setWinningOds(betId, choosenWinningOds);
        const winningOds = await engineContract.winningOds(betId);

        assert(winningOds == choosenWinningOds);

        
        await engineContract.disburse(betId);
        
        const paidAmount = await engineContract.getEarnedAmount(betId);
        // console.log({paidAmount: parseInt(paidAmount.toString())/Math.pow(10,18)});
        const expectedAmount = ods2PoolAmount + ods3PoolAmount + userBetAmount;
        assert(paidAmount == expectedAmount, `${expectedAmount} is not equal to ${paidAmount}`);
    
    });
    
    it('should not disburse when date is not reached', async()=>{
        const betId = makeid(10);
        const odsId = makeid(10);
        const odsId2 = makeid(10);
        const odsId3 = makeid(10);
        
        const choosenWinningOds = odsId;
        
        const ods2PoolAmount = 0.5*Math.pow(10,18);
        
        const ods3PoolAmount = 0.5*Math.pow(10,18);
        
        const userBetAmount = 0.2*Math.pow(10,18);
        
        // winner is accounts index 0
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000)*2, odsId, {value:userBetAmount});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:ods2PoolAmount, from: accounts[1]});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId3, {value:ods3PoolAmount, from: accounts[2]});
        
        const bet = await engineContract.bets(betId);
        assert(bet['exists'] == true);
        
        await engineContract.setWinningOds(betId, choosenWinningOds);
        const winningOds = await engineContract.winningOds(betId);

        assert(winningOds == choosenWinningOds);
        
       try {
        await engineContract.disburse(betId);
        assert(1==2);
       } catch (error) {
        assert(error.message.includes("You cannot disburse before set time"))  
       }
    });
    
    
    it('should not disburse more than once to user', async()=>{
        const betId = makeid(10);
        const odsId = makeid(10);
        const odsId2 = makeid(10);
        const odsId3 = makeid(10);
        
        const choosenWinningOds = odsId;
        
        const ods2PoolAmount = 0.5*Math.pow(10,18);
        
        const ods3PoolAmount = 0.5*Math.pow(10,18);
        
        const userBetAmount = 0.2*Math.pow(10,18);
        
        // winner is accounts index 0
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:userBetAmount});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:ods2PoolAmount, from: accounts[1]});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId3, {value:ods3PoolAmount, from: accounts[2]});
        
        const bet = await engineContract.bets(betId);
        assert(bet['exists'] == true);
        
        await engineContract.setWinningOds(betId, choosenWinningOds);
        const winningOds = await engineContract.winningOds(betId);

        assert(winningOds == choosenWinningOds);
        
        // first accepted disbursement
        await engineContract.disburse(betId);
        
        
        // second disbursement not allowed
        try {
        await engineContract.disburse(betId);
        assert(1==2);
        } catch (error) {
        assert(error.message.includes("User already paid"))  
        }
    });
    
    
    
    it('should check that a user gets the fraction amount on disburse after betting', async()=>{
        const betId = makeid(10);
        const odsId = makeid(10);
        const odsId2 = makeid(10);
        const odsId3 = makeid(10);
        
        const choosenWinningOds = odsId;
        
        const ods2PoolAmount = 0.5*Math.pow(10,18);
        
        const ods3PoolAmount = 0.5*Math.pow(10,18);
        
        const userBetAmount = 0.2123*Math.pow(10,18);
        
        const secondAmountInWinningOds = 0.3456*Math.pow(10,18);
        
        const totalAmountInWiningOds = userBetAmount + secondAmountInWinningOds;
        
        // winner is accounts index 0
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:userBetAmount});
        
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId, {value:secondAmountInWinningOds, from: accounts[3]});
        
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId2, {value:ods2PoolAmount, from: accounts[1]});
        await engineContract.bet(betId, parseInt(new Date().getTime()/1000), odsId3, {value:ods3PoolAmount, from: accounts[2]});
        
        const bet = await engineContract.bets(betId);
        assert(bet['exists'] == true);
        
        await engineContract.setWinningOds(betId, choosenWinningOds);
        const winningOds = await engineContract.winningOds(betId);

        assert(winningOds == choosenWinningOds);

        
        await engineContract.disburse(betId);
        
        const paidAmount = await engineContract.getEarnedAmount(betId);
        // console.log({paidAmount: parseInt(paidAmount.toString())/Math.pow(10,18)});
        
        const userFractionInWinningOds = userBetAmount/totalAmountInWiningOds;
        
        console.log(new Date().getTime());
        const expectedAmount = (ods2PoolAmount + ods3PoolAmount) * userFractionInWinningOds + userBetAmount;
        assert(paidAmount == expectedAmount, `${expectedAmount} is not equal to ${paidAmount}`);
    
    });
})