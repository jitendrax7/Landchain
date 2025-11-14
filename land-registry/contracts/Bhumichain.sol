// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Bhumichain {
    address public owner; 
    uint256 private nextLandId = 1;

    struct Land {
        uint256 landId;
        address currentOwner;
        uint256 price;
        bool isListed;
        bool isApproved;         // now always true by default
        string metadataURI;
        string docHash;
        string geoHash;
        uint256 createdAt;
        uint256 updatedAt;
        address[] previousOwners;
    }

    mapping(uint256 => Land) private lands;
    uint256[] private allLandIds;

    uint256[] private listedLandIds;
    mapping(uint256 => uint256) private listedIndex;

    bool private _locked;

    event LandAdded(uint256 landId, address owner, string metadataURI);
    event LandListed(uint256 landId, uint256 price);
    event LandUnlisted(uint256 landId);
    event LandBought(uint256 landId, address seller, address buyer, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner");
        _;
    }

    modifier onlyLandOwner(uint256 landId) {
        require(lands[landId].landId != 0, "Land not found");
        require(msg.sender == lands[landId].currentOwner, "Not land owner");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrancy");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    // ---------------------------
    // ADD LAND (Auto-approved)
    // ---------------------------
    function addLand(
        string calldata metadataURI,
        string calldata docHash,
        string calldata geoHash
    ) external returns (uint256) {
        uint256 lid = nextLandId++;

        Land storage L = lands[lid];
        L.landId = lid;
        L.currentOwner = msg.sender;
        L.price = 0;
        L.isListed = false;

        // ✔ Auto-approved
        L.isApproved = true;

        L.metadataURI = metadataURI;
        L.docHash = docHash;
        L.geoHash = geoHash;

        L.createdAt = block.timestamp;
        L.updatedAt = block.timestamp;

        allLandIds.push(lid);

        emit LandAdded(lid, msg.sender, metadataURI);
        return lid;
    }

    // ---------------------------
    // UPDATE METADATA
    // ---------------------------
    function updateMetadata(
        uint256 landId,
        string calldata metadataURI,
        string calldata docHash,
        string calldata geoHash
    ) external onlyLandOwner(landId) {
        Land storage L = lands[landId];

        L.metadataURI = metadataURI;
        L.docHash = docHash;
        L.geoHash = geoHash;
        L.updatedAt = block.timestamp;
    }

    // ---------------------------
    // LIST FOR SALE
    // ---------------------------
    function listForSale(uint256 landId, uint256 price) external onlyLandOwner(landId) {
        require(price > 0, "Price must be > 0");

        Land storage L = lands[landId];
        L.price = price;

        if (!L.isListed) {
            L.isListed = true;
            _addToListed(landId);
        }

        L.updatedAt = block.timestamp;
        emit LandListed(landId, price);
    }

    // ---------------------------
    // UNLIST
    // ---------------------------
    function unlist(uint256 landId) external onlyLandOwner(landId) {
        Land storage L = lands[landId];
        require(L.isListed, "Not listed");

        L.isListed = false;
        _removeFromListed(landId);
        L.updatedAt = block.timestamp;

        emit LandUnlisted(landId);
    }

    // ---------------------------
    // BUY LAND (Ownership transfer)
    // ---------------------------
    function buyLand(uint256 landId) external payable nonReentrant {
        Land storage L = lands[landId];

        require(L.isListed, "Not for sale");
        require(msg.value == L.price, "Incorrect amount");

        address seller = L.currentOwner;
        require(seller != msg.sender, "Cannot buy your own land");

        L.previousOwners.push(seller);
        L.currentOwner = msg.sender;

        L.isListed = false;
        L.price = 0;
        L.updatedAt = block.timestamp;

        _removeFromListed(landId);

        (bool sent, ) = payable(seller).call{value: msg.value}("");
        require(sent, "Payment failed");

        emit LandBought(landId, seller, msg.sender, msg.value);
    }

    // ---------------------------
    // LISTING HELPERS
    // ---------------------------
    function _addToListed(uint256 landId) internal {
        if (listedIndex[landId] == 0) {
            listedLandIds.push(landId);
            listedIndex[landId] = listedLandIds.length;
        }
    }

    function _removeFromListed(uint256 landId) internal {
        uint256 idxp1 = listedIndex[landId];
        if (idxp1 == 0) return;

        uint256 idx = idxp1 - 1;
        uint256 lastIdx = listedLandIds.length - 1;

        if (idx != lastIdx) {
            uint256 swapId = listedLandIds[lastIdx];
            listedLandIds[idx] = swapId;
            listedIndex[swapId] = idx + 1;
        }

        listedLandIds.pop();
        listedIndex[landId] = 0;
    }

    // ---------------------------
    // VIEW FUNCTIONS
    // ---------------------------
    function getLand(uint256 landId)
        external
        view
        returns (
            uint256,
            address,
            uint256,
            bool,
            bool,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            address[] memory
        )
    {
        Land storage L = lands[landId];
        return (
            L.landId,
            L.currentOwner,
            L.price,
            L.isListed,
            L.isApproved,
            L.metadataURI,
            L.docHash,
            L.geoHash,
            L.createdAt,
            L.updatedAt,
            L.previousOwners
        );
    }

    function getAllLandIds() external view returns (uint256[] memory) {
        return allLandIds;
    }

    function getListedLandIds() external view returns (uint256[] memory) {
        return listedLandIds;
    }

    receive() external payable {}
    fallback() external payable {}
}
