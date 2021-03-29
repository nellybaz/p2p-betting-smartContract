pragma solidity ^0.5.16;


contract BetEngine{

    address private owner;

    constructor(address _owner) payable public{
        owner = _owner;
    }

    struct BetDetails {
        string ods1;
        string ods2;
        string ods3;
        bool exists;
        uint expiryDate;
        address creator;
    }


    // bets mapping to bet details struct
    mapping(string => BetDetails) public bets;

    // mapping bets to winning ods
    mapping(string => string) public winningOds;

    // betIds mapping to current number of ods in it
    mapping(string => uint) betNumberOfOds;

    // Ods mapping to total amount in it
    mapping(string => uint) public addedOds;

    // Bet ods mapping to a map of address and amount they bet
    mapping(string => mapping(address => uint)) public bettings;

     // mapping bets to paid users
    mapping(string => mapping(address => bool)) public paidUsers;


     /*****  Events start ******/

     event OwnerIsChanged(
         address oldOwner,
         address newOwner
     );

     event UserMadeBet(
         string indexed betId,
         string odsId,
         address indexed user,
         uint amount
     );

     event UserIsPaid(
         address user,
         uint amount,
         string betId
     );

      /*****  Events ends ******/



    /*****  Modifiers start ******/

    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }

    modifier isInWinningOds(string memory betId){
        string memory winningOdsId = winningOds[betId];
        mapping(address => uint) storage winningUsers = bettings[winningOdsId];
        require(winningUsers[msg.sender] > 0);
        _;
    }

    modifier isFirstBetFor(string memory betId, string memory odsId) {
        BetDetails memory bet = bets[betId];

        string memory ods1 = bet.ods1;
        string memory ods2 = bet.ods2;
        string memory ods3 = bet.ods3;
        
        string memory errorMes = "You cannot bet in different ods";
        if(bettings[ods1][msg.sender] > 0 && !compareStrings(odsId, ods1)){
            revert(errorMes);
        }
        else if(bettings[ods2][msg.sender] > 0 && !compareStrings(odsId, ods2)){
            revert(errorMes);
        }
        else if(bettings[ods3][msg.sender] > 0 && !compareStrings(odsId, ods3)){
            revert(errorMes);
        }
        
        _;
    }


   /*****  Modifiers ends ******/


    function iamOwner() public view returns (string memory) {
        if (owner == msg.sender){
            return "yes";
        }
            return "no"; 
        }
    
    // Only the current owner can change the ownership
    function changeOwner(address newOwner) public isOwner(){
        owner = newOwner;
        emit OwnerIsChanged(msg.sender, newOwner);
    }

    /**
    => Check if bet is absent add it in both bets and betNumberOfOds mappings
    => Check if ods is absent in bet, add it
    => Add user to the ods mapping
    */
    function bet(string memory betId, uint expiryDate, string memory odsId) isFirstBetFor(betId, odsId) payable public {
    
        uint amount = msg.value;

        if(!bets[betId].exists){
            BetDetails memory betDetails = BetDetails(odsId, '','', true, expiryDate, msg.sender);
            bets[betId] = betDetails;
            // addedOds[odsId] += amount;
            betNumberOfOds[betId] += 1;
        }

        // if ods is not added yet
        // add it to its right bet
        else if(addedOds[odsId] == 0){
            uint odsInBet = betNumberOfOds[betId];
            if(odsInBet == 1){
                bets[betId].ods2 = odsId;
            }
            else if(odsInBet == 2){
                 bets[betId].ods3 = odsId;
            }

            
            betNumberOfOds[betId] += 1;
        }

        addedOds[odsId] += amount;

        // Get the ref of the ods pool
        // Add user and amount to it
        mapping(address => uint) storage betsForOds = bettings[odsId];
        betsForOds[msg.sender] += amount;

        emit UserMadeBet(betId, odsId, msg.sender, amount);

    }


    function getOdsPoolSize(string memory odsId) public view returns(uint){
        return addedOds[odsId];
    }

    function getUserTotalBetInOdsPool(string memory odsId) public view returns(uint){
        mapping(address => uint) storage betsForOds = bettings[odsId];
        return betsForOds[msg.sender];
    }

    function setWinningOds(string memory betId, string memory winningOdsId) public payable isOwner() {
        winningOds[betId] = winningOdsId;
        return;
    }


    function disburse(string memory betId) public payable isInWinningOds(betId) {

        address user = msg.sender;

        BetDetails memory betDetails = bets[betId];

         mapping(address => bool) storage paidUsersForBet = paidUsers[betId];

        // Ensure that user is not already paid
        require(!paidUsersForBet[user]);

        // Ensure the bet is only disbursed on or after the expiry date.
        require(now >= betDetails.expiryDate);

        // mapping(address => uint) winningUsers = bettings[winningOds];

        string memory winningOdsId = winningOds[betId];

        uint totalBetAmountToBeWon = 0;

        string memory ods1 = bets[betId].ods1;
        string memory ods2 = bets[betId].ods1;
        string memory ods3 = bets[betId].ods1;

        string memory betIdForEvent = betId;

        if(!compareStrings(ods1, winningOdsId)){
            totalBetAmountToBeWon += addedOds[ods1];
        }
        else if(!compareStrings(ods2, winningOdsId)){
            totalBetAmountToBeWon += addedOds[ods2];
        }
        else if(!compareStrings(ods3, winningOdsId)){
            totalBetAmountToBeWon += addedOds[ods3];
        }

        uint userBetAmount = bettings[winningOdsId][user];
        uint totalAmountInWinningPool = addedOds[winningOdsId];

        // TODO: Here charge a percentage of the winner pool size [say 10%]
        uint precision = 10**18;
        uint userEarnedFraction = (userBetAmount * precision)/totalAmountInWinningPool;
        uint userEarnedAmount = (userEarnedFraction * totalBetAmountToBeWon) / precision + userBetAmount;

        paidUsersForBet[msg.sender] = true;
        msg.sender.transfer(userEarnedAmount);

        emit UserIsPaid(user, userEarnedAmount, betIdForEvent);
    }


    /**
        Utils function
     */

     function compareStrings(string memory a, string memory b) private pure returns(bool) {
         return keccak256(bytes(a)) == keccak256(bytes(b));
     }
}