// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract NodeIdentityRegistry is AccessControl {
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    struct NodeIdentity {
        bytes32 pcIdentityHash;
        bytes32 peaqHumanIdHash;
        string peaqMachineDid;
        address operator;
        uint64 registeredAt;
        bool active;
    }

    mapping(bytes32 => NodeIdentity) private nodes;
    mapping(address => bytes32) public operatorToNodeId;

    event NodeRegistered(bytes32 indexed nodeId, address indexed operator, bytes32 pcIdentityHash, bytes32 peaqHumanIdHash, string peaqMachineDid);
    event NodeStatusChanged(bytes32 indexed nodeId, bool active);

    constructor(address admin, address initialAttester) {
        require(admin != address(0), "admin=0");
        require(initialAttester != address(0), "attester=0");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ATTESTER_ROLE, initialAttester);
    }

    function registerNode(
        bytes32 nodeId,
        bytes32 pcIdentityHash,
        bytes32 peaqHumanIdHash,
        string calldata peaqMachineDid,
        address operator
    ) external onlyRole(ATTESTER_ROLE) {
        require(nodeId != bytes32(0), "node=0");
        require(pcIdentityHash != bytes32(0), "pc=0");
        require(peaqHumanIdHash != bytes32(0), "human=0");
        require(bytes(peaqMachineDid).length > 0, "did=empty");
        require(operator != address(0), "operator=0");
        require(nodes[nodeId].registeredAt == 0, "exists");
        require(operatorToNodeId[operator] == bytes32(0), "operator used");

        nodes[nodeId] = NodeIdentity({
            pcIdentityHash: pcIdentityHash,
            peaqHumanIdHash: peaqHumanIdHash,
            peaqMachineDid: peaqMachineDid,
            operator: operator,
            registeredAt: uint64(block.timestamp),
            active: true
        });
        operatorToNodeId[operator] = nodeId;

        emit NodeRegistered(nodeId, operator, pcIdentityHash, peaqHumanIdHash, peaqMachineDid);
    }

    function setNodeActive(bytes32 nodeId, bool active) external onlyRole(ATTESTER_ROLE) {
        require(nodes[nodeId].registeredAt != 0, "missing");
        nodes[nodeId].active = active;
        emit NodeStatusChanged(nodeId, active);
    }

    function getNode(bytes32 nodeId) external view returns (NodeIdentity memory) {
        require(nodes[nodeId].registeredAt != 0, "missing");
        return nodes[nodeId];
    }

    function isEligibleOperator(address operator) external view returns (bool) {
        bytes32 nodeId = operatorToNodeId[operator];
        return nodeId != bytes32(0) && nodes[nodeId].active;
    }
}
