// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract ReverseDutchAuction {
    address public seller;
    address public token;
    uint256 public startPrice;
    uint256 public reservePrice;
    uint256 public priceDrop;
    uint256 public duration;
    uint256 public startTime;
    bool public auctionEnded;

    event AuctionStarted(uint256 startPrice, uint256 reservePrice, uint256 duration);
    event AuctionEnded(address buyer, uint256 finalPrice);

    constructor(
        address _token,
        uint256 _startPrice,
        uint256 _reservePrice,
        uint256 _priceDrop,
        uint256 _duration
    ) {
        require(_startPrice > _reservePrice, "Start price must be greater than reserve price");
        require(_priceDrop > 0, "Price drop must be positive");
        require(_duration > 0, "Duration must be greater than zero");

        seller = msg.sender;
        token = _token;
        startPrice = _startPrice;
        reservePrice = _reservePrice;
        priceDrop = _priceDrop;
        duration = _duration;
        startTime = block.timestamp;
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 elapsedTime = block.timestamp - startTime;
        uint256 drops = elapsedTime / 1 minutes; // Adjust per minute drop
        uint256 discount = drops * priceDrop;
        return (startPrice > discount) ? startPrice - discount : reservePrice;
    }

   function buy() public payable {
    require(!auctionEnded, "Auction already ended");
    require(block.timestamp <= startTime + duration, "Auction time expired"); // ADD THIS LINE

    uint256 currentPrice = getCurrentPrice();
    require(msg.value >= currentPrice, "Insufficient funds");

    auctionEnded = true;
    payable(seller).transfer(msg.value);

    emit AuctionEnded(msg.sender, currentPrice);
}


    receive() external payable {
        buy();
    }
}
