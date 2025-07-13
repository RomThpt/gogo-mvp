// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GOGO is Ownable, ReentrancyGuard {
    
    struct Bet {
        uint256 amount;
        bool isFanToken;
        address tokenAddress; // Address of the fan token used (0x0 for ETH)
        uint256 timestamp;
        bool processed;
        bool won;
        uint256 payout;
    }
    
    struct ClaimablePosition {
        uint256 amount;
        uint256 unlockTimestamp;
        bool claimed;
        bool restaked;
    }
    
    // Storage mappings
    mapping(address => Bet[]) public userBets;
    mapping(address => uint256) public userFreebets;
    mapping(address => uint256) public userClaimable;
    mapping(address => uint256) public userCooldownTimestamp;
    mapping(address => ClaimablePosition[]) public userPositions;
    
    // Fan token addresses
    address public psgToken;
    address public barcaToken;
    
    // Fan token exchange rate (how many tokens per 1 ETH)
    uint256 public constant TOKEN_EXCHANGE_RATE = 50; // 50 tokens = 1 ETH
    
    // Treasury and protocol settings
    address public treasury;
    uint256 public constant TREASURY_SHARE = 80; // 80%
    uint256 public constant USER_SHARE = 20; // 20%
    uint256 public constant FREEBET_PERCENTAGE = 30; // 30% of lost bet as freebets
    uint256 public constant COOLDOWN_PERIOD = 14 days;
    uint256 public constant RESTAKE_BONUS = 5; // 5% bonus for restaking
    
    // Events
    event BetPlaced(address indexed user, uint256 indexed betId, uint256 amount, bool isFanToken);
    event BetProcessed(address indexed user, uint256 indexed betId, bool won, uint256 payout);
    event StakingPositionCreated(address indexed user, uint256 amount, uint256 unlockTime);
    event FreebetsGenerated(address indexed user, uint256 amount);
    event UserShareClaimed(address indexed user, uint256 amount);
    event PositionRestaked(address indexed user, uint256 amount, uint256 bonus);
    
    constructor(address _treasury, address _psgToken, address _barcaToken) Ownable(msg.sender) {
        treasury = _treasury;
        psgToken = _psgToken;
        barcaToken = _barcaToken;
    }
    
    function placeBet(address user, uint256 amount, bool isFanToken, address tokenAddress) external payable nonReentrant {
        require(amount > 0, "Bet amount must be greater than 0");
        
        if (isFanToken) {
            require(tokenAddress == psgToken || tokenAddress == barcaToken, "Invalid fan token");
            require(msg.value == 0, "No ETH should be sent for fan token bets");
            
            // Transfer fan tokens from user to contract
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
    
    // Convenience function for ETH bets (backward compatibility)
    function placeBet(address user, uint256 amount, bool isFanToken) external payable nonReentrant {
        require(!isFanToken, "Use placeBet with tokenAddress for fan token bets");
        this.placeBet{value: msg.value}(user, amount, false, address(0));
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
            // Process loss: 80% to treasury, 20% to user claimable after cooldown
            uint256 treasuryAmount = (bet.amount * TREASURY_SHARE) / 100;
            uint256 userClaimableAmount = (bet.amount * USER_SHARE) / 100;
            
            // Transfer 80% to treasury
            if (bet.isFanToken) {
                // Convert fan tokens to ETH value for treasury and user claims
                uint256 ethValue = bet.amount / TOKEN_EXCHANGE_RATE;
                uint256 treasuryEthAmount = (ethValue * TREASURY_SHARE) / 100;
                uint256 userClaimableEthAmount = (ethValue * USER_SHARE) / 100;
                
                payable(treasury).transfer(treasuryEthAmount);
                
                // Create ETH claimable position for user (converted from fan tokens)
                userPositions[user].push(ClaimablePosition({
                    amount: userClaimableEthAmount,
                    unlockTimestamp: block.timestamp + COOLDOWN_PERIOD,
                    claimed: false,
                    restaked: false
                }));
                
                userClaimable[user] += userClaimableEthAmount;
                
                // Generate freebets in ETH (30% of ETH equivalent)
                uint256 freebetAmount = (ethValue * FREEBET_PERCENTAGE) / 100;
                userFreebets[user] += freebetAmount;
                
                emit StakingPositionCreated(user, userClaimableEthAmount, block.timestamp + COOLDOWN_PERIOD);
            } else {
                payable(treasury).transfer(treasuryAmount);
                
                // Create claimable position for user (20%)
                userPositions[user].push(ClaimablePosition({
                    amount: userClaimableAmount,
                    unlockTimestamp: block.timestamp + COOLDOWN_PERIOD,
                    claimed: false,
                    restaked: false
                }));
                
                userClaimable[user] += userClaimableAmount;
                
                // Generate freebets (30% of original bet amount)
                uint256 freebetAmount = (bet.amount * FREEBET_PERCENTAGE) / 100;
                userFreebets[user] += freebetAmount;
                
                emit StakingPositionCreated(user, userClaimableAmount, block.timestamp + COOLDOWN_PERIOD);
            }
            
            emit FreebetsGenerated(user, bet.isFanToken ? (bet.amount / TOKEN_EXCHANGE_RATE * FREEBET_PERCENTAGE) / 100 : (bet.amount * FREEBET_PERCENTAGE) / 100);
            emit BetProcessed(user, betId, false, 0);
        }
    }
    
    function claimUserShare(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position ID");
        
        ClaimablePosition storage position = userPositions[msg.sender][positionId];
        require(!position.claimed, "Position already claimed");
        require(!position.restaked, "Position already restaked");
        require(block.timestamp >= position.unlockTimestamp, "Position still locked");
        
        position.claimed = true;
        userClaimable[msg.sender] -= position.amount;
        
        payable(msg.sender).transfer(position.amount);
        emit UserShareClaimed(msg.sender, position.amount);
    }
    
    function restakePosition(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position ID");
        
        ClaimablePosition storage position = userPositions[msg.sender][positionId];
        require(!position.claimed, "Position already claimed");
        require(!position.restaked, "Position already restaked");
        require(block.timestamp >= position.unlockTimestamp, "Position still locked");
        
        position.restaked = true;
        userClaimable[msg.sender] -= position.amount;
        
        // Calculate bonus for restaking
        uint256 bonus = (position.amount * RESTAKE_BONUS) / 100;
        uint256 newAmount = position.amount + bonus;
        
        // Create new position with bonus
        userPositions[msg.sender].push(ClaimablePosition({
            amount: newAmount,
            unlockTimestamp: block.timestamp + COOLDOWN_PERIOD,
            claimed: false,
            restaked: false
        }));
        
        userClaimable[msg.sender] += newAmount;
        
        emit PositionRestaked(msg.sender, position.amount, bonus);
        emit StakingPositionCreated(msg.sender, newAmount, block.timestamp + COOLDOWN_PERIOD);
    }
    
    function getUserFreebets(address user) external view returns (uint256) {
        return userFreebets[user];
    }
    
    function getUserBets(address user) external view returns (Bet[] memory) {
        return userBets[user];
    }
    
    function getUserPositions(address user) external view returns (ClaimablePosition[] memory) {
        return userPositions[user];
    }
    
    function getClaimableAmount(address user) external view returns (uint256) {
        return userClaimable[user];
    }
    
    function getUserAvailablePositions(address user) external view returns (uint256[] memory) {
        ClaimablePosition[] memory positions = userPositions[user];
        uint256 count = 0;
        
        // Count available positions
        for (uint256 i = 0; i < positions.length; i++) {
            if (!positions[i].claimed && !positions[i].restaked && block.timestamp >= positions[i].unlockTimestamp) {
                count++;
            }
        }
        
        // Build array of available position IDs
        uint256[] memory availableIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < positions.length; i++) {
            if (!positions[i].claimed && !positions[i].restaked && block.timestamp >= positions[i].unlockTimestamp) {
                availableIds[index] = i;
                index++;
            }
        }
        
        return availableIds;
    }
    
    function mintFreebets(address user, uint256 amount) external onlyOwner {
        userFreebets[user] += amount;
        emit FreebetsGenerated(user, amount);
    }
    
    function useFreebets(address user, uint256 amount) external onlyOwner {
        require(userFreebets[user] >= amount, "Insufficient freebets");
        userFreebets[user] -= amount;
    }
    
    function updateTreasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }
    
    function updateTokenAddresses(address _psgToken, address _barcaToken) external onlyOwner {
        psgToken = _psgToken;
        barcaToken = _barcaToken;
    }
    
    function getPSGTokenAddress() external view returns (address) {
        return psgToken;
    }
    
    function getBarcaTokenAddress() external view returns (address) {
        return barcaToken;
    }
    
    function getUserTokenBalance(address user, address tokenAddress) external view returns (uint256) {
        if (tokenAddress == address(0)) {
            return user.balance;
        }
        return IERC20(tokenAddress).balanceOf(user);
    }
    
    function withdrawEmergency() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function withdrawEmergencyTokens(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        token.transfer(owner(), token.balanceOf(address(this)));
    }
    
    receive() external payable {}
}