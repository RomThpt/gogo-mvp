// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BarcaToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10 million tokens max
    
    constructor() ERC20("FC Barcelona Fan Token", "BAR") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    // Function to allow users to buy BAR tokens with ETH
    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        // 1 ETH = 50 BAR tokens (as per the frontend display)
        uint256 tokenAmount = msg.value * 50;
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        _mint(msg.sender, tokenAmount);
    }
    
    // Function to allow users to sell BAR tokens for ETH
    function sellTokens(uint256 tokenAmount) external {
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient BAR balance");
        
        uint256 ethAmount = tokenAmount / 50; // 50 BAR = 1 ETH
        require(address(this).balance >= ethAmount, "Insufficient contract balance");
        
        _burn(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethAmount);
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
    
    // Owner can withdraw ETH from contract
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}