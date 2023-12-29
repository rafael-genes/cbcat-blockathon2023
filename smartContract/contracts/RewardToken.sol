// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken
 * @dev ERC20 token allowing rewards, enabling minting and burning tokens.
 */
contract RewardToken is ERC20, ERC20Permit, Ownable {
    // Mapping to track the whitelisted minters.
    mapping(address => bool) public minters;

    event Minted(address indexed from, address indexed to, uint256 amount);
    event Burned(address indexed from, address indexed to, uint256 amount);
    event MintersUpdated(address indexed minter, bool isAllowed);

    modifier onlyAllowed() {
        require(msg.sender == owner() || minters[msg.sender], "not_allowed");
        _;
    }

    /**
     * @dev Initializes the token with a name and symbol.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _owner The owner of the token.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _owner
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(_owner) {}

    /**
     * @dev Mints a specific amount of tokens to an address.
     * @param _to The address receiving the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @notice Only minters and owner can mint tokens.
     * @notice Minters can't mint for themselves tokens, but Owner can mint to minters.
     */
    function mint(address _to, uint256 _amount) external onlyAllowed {
        require(
            !minters[_to] || msg.sender == owner(),
            "can-not-mint-to-minter"
        );
        _mint(_to, _amount);
        emit Minted(address(0x0), _to, _amount);
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param _amount The amount of tokens to burn.
     * @notice Only minters and owner can burn tokens.
     */
    function burn(uint256 _amount) external onlyAllowed {
        _burn(msg.sender, _amount);
        emit Burned(msg.sender, address(0x0), _amount);
    }

    /**
     * @dev Updates the whitelist for minters.
     * @param _minter The minter to update.
     * @param _isAllowed The status to set for the minter.
     * (False will remove privileges, and True will grant privileges)
     * @notice Only minters and owner can burn tokens.
     */
    function updateMinters(
        address _minter,
        bool _isAllowed
    ) external onlyOwner {
        minters[_minter] = _isAllowed;
        emit MintersUpdated(_minter, _isAllowed);
    }
}
