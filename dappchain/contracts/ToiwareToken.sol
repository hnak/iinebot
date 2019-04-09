pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract ToiwareToken is ERC20, ERC20Mintable, ERC20Burnable, ERC20Detailed {
    string private _name = "toiware";
    string private _symbol = "TOI";
    uint8 private _decimals = 18;

    uint value = 1000000;

    constructor()
        ERC20Detailed(_name, _symbol, _decimals)
        ERC20Burnable()
        ERC20Mintable()
        ERC20()
        public
    {
        _mint(msg.sender, value);
    }
}