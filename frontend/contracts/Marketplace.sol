// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 priceInWei;
        bool isAvailable;
        address payable owner;
        address payable seller;
        uint256 createdAt;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public userProperties;

    event PropertyAdded(
        uint256 indexed id,
        string name,
        string location,
        uint256 priceInWei,
        address indexed seller
    );
    event PropertyBought(
        uint256 indexed id,
        address indexed buyer,
        address indexed seller,
        uint256 priceInWei
    );
    event PropertyRemoved(uint256 indexed id);

    constructor() {}

    // Seller adds a new property with price in wei
    function addProperty(
        string memory _name,
        string memory _location,
        uint256 _priceInWei
    ) public {
        require(_priceInWei > 0, "Price must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");

        propertyCount++;
        uint256 propertyId = propertyCount;

        properties[propertyId] = Property(
            propertyId,
            _name,
            _location,
            _priceInWei,
            true,
            payable(msg.sender),
            payable(msg.sender),
            block.timestamp
        );

        userProperties[msg.sender].push(propertyId);

        emit PropertyAdded(propertyId, _name, _location, _priceInWei, msg.sender);
    }

    // Buyer purchases a property - must send exact amount in ETH
    function buyProperty(uint256 _id) public payable {
        require(_id > 0 && _id <= propertyCount, "Property does not exist");
        
        Property storage property = properties[_id];
        
        require(property.isAvailable, "Property is not available for purchase");
        require(msg.value == property.priceInWei, "Incorrect payment amount");
        require(msg.sender != property.seller, "Seller cannot buy their own property");

        // Transfer ETH to seller
        (bool success, ) = property.seller.call{value: msg.value}("");
        require(success, "Payment transfer failed");

        // Update property ownership
        property.isAvailable = false;
        property.owner = payable(msg.sender);

        // Add property to buyer's list
        userProperties[msg.sender].push(_id);

        emit PropertyBought(_id, msg.sender, property.seller, property.priceInWei);
    }

    // Get a single property
    function getProperty(uint256 _id) public view returns (Property memory) {
        require(_id > 0 && _id <= propertyCount, "Property does not exist");
        return properties[_id];
    }

    // Get all properties
    function getAllProperties() public view returns (Property[] memory) {
        Property[] memory allProperties = new Property[](propertyCount);
        for (uint256 i = 1; i <= propertyCount; i++) {
            allProperties[i - 1] = properties[i];
        }
        return allProperties;
    }

    // Get only available properties
    function getAvailableProperties() public view returns (Property[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].isAvailable) {
                count++;
            }
        }

        Property[] memory available = new Property[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].isAvailable) {
                available[index] = properties[i];
                index++;
            }
        }
        return available;
    }

    // Get user's properties
    function getUserProperties(address _user) public view returns (uint256[] memory) {
        return userProperties[_user];
    }

    // Get user's property count
    function getUserPropertyCount(address _user) public view returns (uint256) {
        return userProperties[_user].length;
    }

    // Remove property (seller only)
    function removeProperty(uint256 _id) public {
        require(_id > 0 && _id <= propertyCount, "Property does not exist");
        Property storage property = properties[_id];
        require(msg.sender == property.seller, "Only seller can remove property");
        require(property.isAvailable, "Cannot remove sold property");

        property.isAvailable = false;
        emit PropertyRemoved(_id);
    }
}
