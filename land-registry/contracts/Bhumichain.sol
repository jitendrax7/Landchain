// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Bhumichain - simple land registry & marketplace with GramSabha approval
/// @notice Farmers add land (with IPFS metadata), GramSabha approves, owners list, buyers purchase and ownership transfers.
contract Bhumichain {
    address public admin; // contract deployer
    uint256 private nextLandId = 1;

    struct OwnerRecord {
        address wallet;
        uint256 at; // timestamp
    }

    struct Land {
        uint256 landId;
        address currentOwner;
        uint256 priceWei;
        bool isListed;
        bool isApproved;
        string metadataURI; // IPFS CID or URL
        string docHash;     // extra doc hash if needed
        uint256 createdAt;
        uint256 updatedAt;
        address[] previousOwners;
    }

    // storage
    mapping(uint256 => Land) private lands;
    uint256[] private allLandIds;

    // quick index for listed lands
    uint256[] private listedLandIds;
    mapping(uint256 => uint256) private listedIndex; // landId => index+1

    // GramSabha registry
    mapping(address => bool) public isGramSabha;

    // reentrancy guard
    bool private locked;

    // events
    event LandAdded(uint256 indexed landId, address indexed owner, string metadataURI);
    event LandApproved(uint256 indexed landId, address indexed approver);
    event LandListed(uint256 indexed landId, uint256 priceWei);
    event LandUnlisted(uint256 indexed landId);
    event LandBought(uint256 indexed landId, address indexed seller, address indexed buyer, uint256 priceWei);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyGramSabha() {
        require(isGramSabha[msg.sender], "Only GramSabha permitted");
        _;
    }

    modifier onlyLandOwner(uint256 _landId) {
        require(lands[_landId].landId != 0, "Land not found");
        require(msg.sender == lands[_landId].currentOwner, "Not land owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrancy");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        admin = msg.sender;
        isGramSabha[msg.sender] = true; // optionally admin is also GramSabha
    }

    /// @notice admin can set GramSabha addresses
    function setGramSabha(address _addr, bool _allowed) external onlyAdmin {
        isGramSabha[_addr] = _allowed;
    }

    /// @notice Farmer adds land. metadataURI/docHash must be prepared off-chain (IPFS)
    function addLand(string calldata metadataURI, string calldata docHash) external returns (uint256) {
        uint256 id = nextLandId++;
        Land storage L = lands[id];

        L.landId = id;
        L.currentOwner = msg.sender;
        L.priceWei = 0;
        L.isListed = false;
        L.isApproved = false;
        L.metadataURI = metadataURI;
        L.docHash = docHash;
        L.createdAt = block.timestamp;
        L.updatedAt = block.timestamp;

        allLandIds.push(id);

        emit LandAdded(id, msg.sender, metadataURI);
        return id;
    }

    /// @notice GramSabha approves a land (marks it approved so owner can list)
    function approveLand(uint256 _landId) external onlyGramSabha {
        Land storage L = lands[_landId];
        require(L.landId != 0, "Land not found");
        L.isApproved = true;
        L.updatedAt = block.timestamp;

        emit LandApproved(_landId, msg.sender);
    }

    /// @notice Owner lists approved land for sale with a price (wei)
    function listForSale(uint256 _landId, uint256 _priceWei) external onlyLandOwner(_landId) {
    Land storage L = lands[_landId];
    require(_priceWei > 0, "Price must be > 0");

    // Auto-approve when listed
    L.isApproved = true;

    L.priceWei = _priceWei;
    if (!L.isListed) {
        L.isListed = true;
        _addToListed(_landId);
    }
    L.updatedAt = block.timestamp;

    emit LandListed(_landId, _priceWei);
}

    

    /// @notice Owner can unlist
    function unlist(uint256 _landId) external onlyLandOwner(_landId) {
        Land storage L = lands[_landId];
        require(L.isListed, "Not listed");
        L.isListed = false;
        _removeFromListed(_landId);
        L.updatedAt = block.timestamp;
        emit LandUnlisted(_landId);
    }

    /// @notice Buy a listed land. Send exact price in wei.
    /// @dev Checks-Effects-Interactions pattern, nonReentrant.
    function buyLand(uint256 _landId) external payable nonReentrant {
        Land storage L = lands[_landId];
        require(L.landId != 0, "Land not found");
        require(L.isListed, "Land not for sale");
        require(msg.value == L.priceWei, "Incorrect payment");

        address seller = L.currentOwner;
        require(seller != msg.sender, "Seller cannot buy own land");

        // Effects
        L.previousOwners.push(seller);
        L.currentOwner = msg.sender;
        L.isListed = false;
        L.priceWei = 0;
        L.updatedAt = block.timestamp;
        _removeFromListed(_landId);

        // Interaction: transfer funds to seller
        (bool sent, ) = payable(seller).call{value: msg.value}("");
        require(sent, "Payment transfer failed");

        emit LandBought(_landId, seller, msg.sender, msg.value);
    }

    // -----------------------
    // Listing helpers
    // -----------------------
    function _addToListed(uint256 _landId) internal {
        if (listedIndex[_landId] == 0) {
            listedLandIds.push(_landId);
            listedIndex[_landId] = listedLandIds.length; // store index+1
        }
    }

    function _removeFromListed(uint256 _landId) internal {
        uint256 idxp1 = listedIndex[_landId];
        if (idxp1 == 0) return;
        uint256 idx = idxp1 - 1;
        uint256 lastIdx = listedLandIds.length - 1;
        if (idx != lastIdx) {
            uint256 swapId = listedLandIds[lastIdx];
            listedLandIds[idx] = swapId;
            listedIndex[swapId] = idx + 1;
        }
        listedLandIds.pop();
        listedIndex[_landId] = 0;
    }

    // -----------------------
    // Views
    // -----------------------

    /// @notice Get full land data
    function getLand(uint256 _landId)
        external
        view
        returns (
            uint256 landId,
            address currentOwner,
            uint256 priceWei,
            bool isListed,
            bool isApproved,
            string memory metadataURI,
            string memory docHash,
            uint256 createdAt,
            uint256 updatedAt,
            address[] memory previousOwners
        )
    {
        Land storage L = lands[_landId];
        require(L.landId != 0, "Land not found");
        return (
            L.landId,
            L.currentOwner,
            L.priceWei,
            L.isListed,
            L.isApproved,
            L.metadataURI,
            L.docHash,
            L.createdAt,
            L.updatedAt,
            L.previousOwners
        );
    }

    /// @notice Return all listed land ids (approved+listed)
    function getListedLandIds() external view returns (uint256[] memory) {
        return listedLandIds;
    }

    /// @notice Return all land ids (useful for indexing off-chain)
    function getAllLandIds() external view returns (uint256[] memory) {
        return allLandIds;
    }

    /// @notice total lands
    function totalLands() external view returns (uint256) {
        return allLandIds.length;
    }

    // contract can accept ETH (not used except safety)
    receive() external payable {}
    fallback() external payable {}
}
