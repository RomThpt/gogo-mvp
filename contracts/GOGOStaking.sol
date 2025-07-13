// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface for Chiliz Chain Validator Staking
interface IChilizValidator {
    function delegate() external payable;
    function undelegate(uint256 amount) external;
    function getValidatorRewards(address delegator) external view returns (uint256);
    function claimRewards() external;
    function getValidatorInfo() external view returns (uint256 totalDelegated, uint256 commission, bool active);
}

contract GOGOStaking is Ownable, ReentrancyGuard {
    
    struct Bet {
        uint256 amount;
        bool isFanToken;
        address tokenAddress;
        uint256 timestamp;
        bool processed;
        bool won;
        uint256 payout;
    }
    
    struct StakingPosition {
        uint256 amount;
        uint256 unlockTimestamp;
        bool claimed;
        bool restaked;
        uint256 stakingRewards; // Rewards from Chiliz staking protocol
    }
    
    // Storage mappings
    mapping(address => Bet[]) public userBets;
    mapping(address => uint256) public userFreebets;
    mapping(address => uint256) public userClaimable;
    mapping(address => StakingPosition[]) public userPositions;
    
    // Fan token addresses
    address public psgToken;
    address public barcaToken;
    
    // Chiliz Validator integration
    IChilizValidator public chilizValidator;
    uint256 public totalStakedInProtocol;
    
    // Protocol settings
    address public treasury;
    uint256 public constant TREASURY_SHARE = 80; // 80%
    uint256 public constant USER_SHARE = 20; // 20%
    uint256 public constant FREEBET_PERCENTAGE = 30; // 30% of lost bet as freebets
    uint256 public constant COOLDOWN_PERIOD = 14 days;
    uint256 public constant RESTAKE_BONUS = 5; // 5% bonus for restaking
    uint256 public constant TOKEN_EXCHANGE_RATE = 50; // 50 tokens = 1 ETH
    
    // Events
    event BetPlaced(address indexed user, uint256 indexed betId, uint256 amount, bool isFanToken);
    event BetProcessed(address indexed user, uint256 indexed betId, bool won, uint256 payout);
    event StakingPositionCreated(address indexed user, uint256 amount, uint256 unlockTime);
    event FreebetsGenerated(address indexed user, uint256 amount);
    event UserShareClaimed(address indexed user, uint256 amount);
    event PositionRestaked(address indexed user, uint256 amount, uint256 bonus);
    event ChilizStakingRewardsDistributed(address indexed user, uint256 rewards);
    event FundsStakedInChiliz(uint256 amount);
    
    constructor(
        address _treasury, 
        address _psgToken, 
        address _barcaToken,
        address _chilizValidator
    ) Ownable(msg.sender) {
        treasury = _treasury;
        psgToken = _psgToken;
        barcaToken = _barcaToken;
        chilizValidator = IChilizValidator(_chilizValidator);
    }
    
    function placeBet(address user, uint256 amount, bool isFanToken, address tokenAddress) external payable nonReentrant {
        require(amount > 0, "Bet amount must be greater than 0");
        
        if (isFanToken) {
            require(tokenAddress == psgToken || tokenAddress == barcaToken, "Invalid fan token");
            require(msg.value == 0, "No ETH should be sent for fan token bets");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        } else {
            require(tokenAddress == address(0), "Token address should be zero for ETH bets");
            require(msg.value == amount, "Incorrect ETH amount sent");
        }
        
        userBets[user].push(Bet({
            amount: amount,
            isFanToken: isFanToken,
            tokenAddress: tokenAddress,
            timestamp: block.timestamp,
            processed: false,
            won: false,
            payout: 0
        }));
        
        uint256 betId = userBets[user].length - 1;
        emit BetPlaced(user, betId, amount, isFanToken);
    }
    
    function processResult(address user, uint256 betId, bool win) external onlyOwner nonReentrant {
        require(betId < userBets[user].length, "Invalid bet ID");
        
        Bet storage bet = userBets[user][betId];
        require(!bet.processed, "Bet already processed");
        
        bet.processed = true;
        bet.won = win;
        
        if (win) {
            // Calculate payout (with potential fan token boost)
            uint256 multiplier = bet.isFanToken ? 240 : 200; // 2.4x for fan tokens, 2x for ETH
            uint256 payout = (bet.amount * multiplier) / 100;
            bet.payout = payout;
            
            // Transfer winnings to user
            if (bet.isFanToken) {
                IERC20(bet.tokenAddress).transfer(user, payout);
            } else {
                payable(user).transfer(payout);
            }
            emit BetProcessed(user, betId, true, payout);
        } else {
            // Process loss: Stake in Chiliz protocol, then distribute after 14 days
            _processLossWithStaking(user, bet);
            emit BetProcessed(user, betId, false, 0);
        }
    }
    
    function _processLossWithStaking(address user, Bet storage bet) internal {
        uint256 treasuryAmount = (bet.amount * TREASURY_SHARE) / 100;
        uint256 userClaimableAmount = (bet.amount * USER_SHARE) / 100;
        
        if (bet.isFanToken) {
            // Convert fan tokens to ETH equivalent for staking
            uint256 ethValue = bet.amount / TOKEN_EXCHANGE_RATE;
            treasuryAmount = (ethValue * TREASURY_SHARE) / 100;
            userClaimableAmount = (ethValue * USER_SHARE) / 100;
        }
        
        // Delegate the total amount to Chiliz validator
        uint256 totalToStake = treasuryAmount + userClaimableAmount;
        if (totalToStake > 0) {
            chilizValidator.delegate{value: totalToStake}();
            totalStakedInProtocol += totalToStake;
            emit FundsStakedInChiliz(totalToStake);
        }
        
        // Create staking position for user (20% share)
        userPositions[user].push(StakingPosition({
            amount: userClaimableAmount,
            unlockTimestamp: block.timestamp + COOLDOWN_PERIOD,
            claimed: false,
            restaked: false,
            stakingRewards: 0
        }));
        
        userClaimable[user] += userClaimableAmount;
        
        // Generate freebets (30% of original bet amount)
        uint256 freebetAmount;
        if (bet.isFanToken) {
            freebetAmount = (bet.amount / TOKEN_EXCHANGE_RATE * FREEBET_PERCENTAGE) / 100;
        } else {
            freebetAmount = (bet.amount * FREEBET_PERCENTAGE) / 100;
        }
        userFreebets[user] += freebetAmount;
        
        emit StakingPositionCreated(user, userClaimableAmount, block.timestamp + COOLDOWN_PERIOD);
        emit FreebetsGenerated(user, freebetAmount);
    }
    
    function distributeStakingRewards() external onlyOwner {
        // Claim rewards from Chiliz validator
        uint256 rewardsBefore = address(this).balance;
        chilizValidator.claimRewards();
        uint256 rewards = address(this).balance - rewardsBefore;
        
        if (rewards > 0) {
            // Distribute rewards proportionally to all staking positions
            _distributeRewardsToUsers(rewards);
        }
    }
    
    function _distributeRewardsToUsers(uint256 totalRewards) internal {
        // This is a simplified distribution - in production, you'd want more sophisticated logic
        // For now, we'll distribute proportionally based on staked amounts
        
        // Calculate total staked by users (for proportional distribution)
        uint256 totalUserStaked = 0;
        // This would require iterating through all users - simplified for demo
        
        // Send treasury share (80%) immediately
        uint256 treasuryRewards = (totalRewards * TREASURY_SHARE) / 100;
        payable(treasury).transfer(treasuryRewards);
        
        // Remaining 20% gets distributed to user positions
        // Implementation would distribute to all active positions proportionally
    }
    
    function claimUserShare(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position ID");
        
        StakingPosition storage position = userPositions[msg.sender][positionId];
        require(!position.claimed, "Position already claimed");
        require(!position.restaked, "Position already restaked");
        require(block.timestamp >= position.unlockTimestamp, "Position still locked");
        
        position.claimed = true;
        userClaimable[msg.sender] -= position.amount;
        
        // Calculate total amount including staking rewards
        uint256 totalAmount = position.amount + position.stakingRewards;
        
        // Undelegate from Chiliz validator if needed
        if (totalStakedInProtocol >= totalAmount) {
            chilizValidator.undelegate(totalAmount);
            totalStakedInProtocol -= totalAmount;
        }
        
        payable(msg.sender).transfer(totalAmount);
        emit UserShareClaimed(msg.sender, totalAmount);
    }
    
    function restakePosition(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position ID");
        
        StakingPosition storage position = userPositions[msg.sender][positionId];
        require(!position.claimed, "Position already claimed");
        require(!position.restaked, "Position already restaked");
        require(block.timestamp >= position.unlockTimestamp, "Position still locked");
        
        position.restaked = true;
        userClaimable[msg.sender] -= position.amount;
        
        // Calculate bonus for restaking (5% + any staking rewards)
        uint256 bonus = (position.amount * RESTAKE_BONUS) / 100;
        uint256 newAmount = position.amount + bonus + position.stakingRewards;
        
        // Keep funds staked in Chiliz protocol
        // No need to unstake, just create new position
        
        // Create new position with bonus
        userPositions[msg.sender].push(StakingPosition({
            amount: newAmount,
            unlockTimestamp: block.timestamp + COOLDOWN_PERIOD,
            claimed: false,
            restaked: false,
            stakingRewards: 0
        }));
        
        userClaimable[msg.sender] += newAmount;
        
        emit PositionRestaked(msg.sender, position.amount, bonus);
        emit StakingPositionCreated(msg.sender, newAmount, block.timestamp + COOLDOWN_PERIOD);
    }
    
    // View functions
    function getUserFreebets(address user) external view returns (uint256) {
        return userFreebets[user];
    }
    
    function getUserBets(address user) external view returns (Bet[] memory) {
        return userBets[user];
    }
    
    function getUserPositions(address user) external view returns (StakingPosition[] memory) {
        return userPositions[user];
    }
    
    function getClaimableAmount(address user) external view returns (uint256) {
        return userClaimable[user];
    }
    
    function getTotalStakedInProtocol() external view returns (uint256) {
        return totalStakedInProtocol;
    }
    
    function getStakingRewards() external view returns (uint256) {
        return chilizValidator.getValidatorRewards(address(this));
    }
    
    function getValidatorInfo() external view returns (uint256 totalDelegated, uint256 commission, bool active) {
        return chilizValidator.getValidatorInfo();
    }
    
    // Admin functions
    function useFreebets(address user, uint256 amount) external onlyOwner {
        require(userFreebets[user] >= amount, "Insufficient freebets");
        userFreebets[user] -= amount;
    }
    
    function updateChilizValidator(address _newValidator) external onlyOwner {
        chilizValidator = IChilizValidator(_newValidator);
    }
    
    function updateTreasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }
    
    function withdrawEmergency() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}