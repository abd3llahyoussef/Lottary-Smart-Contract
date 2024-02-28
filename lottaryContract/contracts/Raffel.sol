// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

//to interact with VRF Contract
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
//to convert it VRF
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
//to use ChainLink Keepers
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";
//    event Withdrawal(uint amount, uint when);       emit Withdrawal(address(this).balance, block.timestamp);
error Raffle__NotEnoughETH();
error Raffle__TranserFailed();
error Raffle__UpkeepNotNeeded(uint256 currentBalance ,uint256 numPlayer,uint256 raffleState);
error Raffle__RaffleNotOpen();
// convert our contract to VRF
contract Raffle is VRFConsumerBaseV2,AutomationCompatibleInterface{
    //Type Decleration
    enum RaffleState{
        OPEN,
        CALCULATING
    }
    
    /*State Variables*/
    //Make a Minimum Fee To process
    uint256 private immutable i_entranceFee;
    //Make a List for Players
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant Request_confirmations =3;
    uint32 private constant NUM_WORDS = 1;

    //Lottary Variables
    address private s_winner;
    uint256 private immutable i_interval;
    uint256 private s_lastTimeStamp;
    RaffleState private s_raffleState;

    /* Events */
    event RaffleEnter (address indexed player);
    event RequestRaffleWinner(uint256 indexed requestId);
    event winnerPicked (address indexed winner); 

    constructor(address vrfCoordinatorV2,uint256 entranceFee,bytes32 gasLane,uint64 subscriptionId,uint32 callbackGasLimit,uint256 interval) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;//keyHash
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;

    }

    function enterRaffle() public payable {
        if(msg.value<i_entranceFee){revert Raffle__NotEnoughETH();}
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
        }
        s_players.push(payable(msg.sender));
        //Event Activate
        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep (bytes memory /* checkData */) public view override returns (bool upkeepNeeded,bytes memory /* performData */){
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp)> i_interval);
        bool hasPlayer = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasBalance && hasPlayer);
        return (upkeepNeeded,"0x0");
    }


    function performUpkeep(bytes calldata /*performData*/) external override{
        (bool upkeepNeeded,) = checkUpkeep("");
        if(!upkeepNeeded){
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        //Request a Random Number 
        // do something with it 
        // 2 transaction process
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
                    i_gasLane,
                    i_subscriptionId,
                    Request_confirmations,
                    i_callbackGasLimit,
                    NUM_WORDS
                );
        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(uint256 /*requestId*/,uint[] memory randomWords) internal override{
        //random number % players list size = index of winner
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable winner = s_players[indexOfWinner];
        s_winner = winner;
        s_players = new address payable[](0);
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        (bool success,) = winner.call{value:address(this).balance}("");
        if(!success){revert Raffle__TranserFailed();}
        emit winnerPicked(winner);
    }

    function getEntranceFee () public view returns(uint256){
        return i_entranceFee;
    }

    function getPlayer (uint256 index) public view returns(address){
        return s_players[index];
    }

    function getWinner () public view returns (address){
        return s_winner;
    }

    function getRaffleState () public view returns (RaffleState){
        return s_raffleState;
    }

    function getRequestConfirmations () public pure returns (uint16){
        return Request_confirmations;
    }


    function getNumWords () public pure returns (uint32){
        return NUM_WORDS;
    }

    function getNumberOfPlayers () public view returns (uint256){
        return s_players.length;
    }

    function getInterval () public view returns (uint256){
        return i_interval;
    }

    function getLastTimeStamp () public view returns (uint256){
        return s_lastTimeStamp;
    }
}
