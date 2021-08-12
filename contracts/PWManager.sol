pragma solidity ^0.4.17;

contract PWManager {
    address owner;
    string public title;
    mapping(string => string) passwords;

    constructor(string t) public {
        require(bytes(t).length > 0);

        title = t;
        owner = msg.sender;
    }

    function store(string name, string pw) public onlyOwner {
        //ensure no value is set already at key
        require(bytes(passwords[name]).length == 0);
        //check if name or pw argument is empty
        require(bytes(name).length != 0 && bytes(pw).length != 0);

        passwords[name] = pw;
    }

    function update(string name, string pw) public onlyOwner {
        //check if value is already set at key
        require(bytes(passwords[name]).length > 0);
        //check if name or pw argument is empty
        require(bytes(name).length != 0 && bytes(pw).length != 0);

        passwords[name] = pw;
    }

    function get(string name) public view returns (string) {
        return passwords[name];
    }

    function remove(string name) public onlyOwner {
        require(bytes(passwords[name]).length > 0);

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