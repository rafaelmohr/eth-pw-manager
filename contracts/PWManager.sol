pragma solidity ^0.4.17;

contract PWManager {
    mapping(string => string) passwords;
    address owner;

    constructor() public {
        owner = msg.sender;
    }

    function store(string name, string pw) public onlyOwner {
        //check if name or pw is empty
        require(bytes(name).length != 0 && bytes(pw).length != 0);

        passwords[name] = pw;
    }

    function get(string name) public view returns (string) {
        return passwords[name];
    }

    function remove(string name) public onlyOwner {
        delete passwords[name];
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }
}