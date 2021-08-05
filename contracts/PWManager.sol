pragma solidity ^0.4.17;

contract PWManager {
    mapping(string => string) passwords;

    function store(string name, string pw) public {
        require(name != "" && pw != "")
        passwords[name] = pw;
    }

    function get(string name) public view returns (string) {
        return passwords[name];
    }
}