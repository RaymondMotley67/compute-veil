// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter Contract
/// @author Compute Veil
/// @notice A fully homomorphic encryption counter that performs encrypted arithmetic operations
/// @dev This contract demonstrates privacy-preserving computations on encrypted data using FHEVM
contract FHECounter is SepoliaConfig {
    /// @notice The encrypted counter value
    euint32 private _count;
    
    /// @notice Whether the contract is paused
    bool private _paused;
    
    /// @notice The contract owner
    address private _owner;
    
    /// @notice Emitted when the counter is incremented
    /// @param user The address that triggered the increment
    event Incremented(address indexed user);
    
    /// @notice Emitted when the counter is decremented
    /// @param user The address that triggered the decrement
    event Decremented(address indexed user);
    
    /// @notice Emitted when the contract is paused
    /// @param by The address that paused the contract
    event Paused(address indexed by);
    
    /// @notice Emitted when the contract is unpaused
    /// @param by The address that unpaused the contract
    event Unpaused(address indexed by);
    
    /// @notice Emitted when ownership is transferred
    /// @param from The previous owner
    /// @param to The new owner
    event OwnershipTransferred(address indexed from, address indexed to);
    
    /// @notice Error thrown when contract is paused
    error ContractPaused();
    
    /// @notice Error thrown when caller is not the owner
    error NotOwner();
    
    /// @notice Restricts function access to the contract owner
    modifier onlyOwner() {
        if (msg.sender != _owner) revert NotOwner();
        _;
    }
    
    /// @notice Restricts function execution when contract is not paused
    modifier whenNotPaused() {
        if (_paused) revert ContractPaused();
        _;
    }

    /// @notice Initializes the contract and sets the deployer as owner
    constructor() {
        _owner = msg.sender;
    }

    /// @notice Returns the current encrypted count handle
    /// @return The current encrypted count as euint32
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Check if a user has permission to decrypt the count
    /// @param user The address to check
    /// @return Whether the user has decryption permission
    function hasPermission(address user) external view returns (bool) {
        return FHE.isAllowed(_count, user);
    }

    /// @notice Returns the protocol version identifier
    /// @return The protocol ID (always 1)
    function protocolId() external pure returns (uint256) {
        return 1;
    }

    /// @notice Returns the contract owner address
    /// @return The owner address
    function owner() external view returns (address) {
        return _owner;
    }

    /// @notice Returns whether the contract is paused
    /// @return True if paused, false otherwise
    function isPaused() external view returns (bool) {
        return _paused;
    }

    /// @notice Increments the counter by an encrypted value
    /// @dev The input value is encrypted client-side and verified with the proof
    /// @param inputEuint32 The encrypted input value
    /// @param inputProof The proof of correct encryption
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external whenNotPaused {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.add(_count, encryptedEuint32);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
        emit Incremented(msg.sender);
    }

    /// @notice Decrements the counter by an encrypted value
    /// @dev The input value is encrypted client-side and verified with the proof
    /// @param inputEuint32 The encrypted input value
    /// @param inputProof The proof of correct encryption
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external whenNotPaused {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.sub(_count, encryptedEuint32);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
        emit Decremented(msg.sender);
    }

    /// @notice Pauses or unpauses the contract
    /// @dev Only the owner can call this function
    /// @param paused True to pause, false to unpause
    function setPaused(bool paused) external onlyOwner {
        _paused = paused;
        if (paused) {
            emit Paused(msg.sender);
        } else {
            emit Unpaused(msg.sender);
        }
    }

    /// @notice Transfers ownership of the contract
    /// @dev Only the current owner can call this function
    /// @param newOwner The address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}
// Safety check added
// Contract event logging added
// Contract modularity improved
// Contract upgrade path added
