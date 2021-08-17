const fs = require('fs-extra');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

//get compileresult from file
const compileResult = require('../ethereum/build/PWManager.json');
//get abi using dynamic variable name because interface is a reserved keyword
const abi = compileResult['interface'];
const bytecode = compileResult.bytecode;


let accounts, contract;
//testing data
const name = 'testName', pw = 'test1234', newPw = 'test2929';

beforeEach(async () => {
    //get accounts list
    accounts = await web3.eth.getAccounts();

    //deploy contract
    contract = await new web3.eth.Contract(JSON.parse(abi))
        .deploy({
            data: bytecode,
            arguments: ['test']
        })
        .send({from: accounts[0], gas: '1000000'});
})

describe('PW-Manager Contract Tests', () => {
    it('gets deployed', () => {
        assert.ok(contract.options.address);
    });

    it('can store and access a pw', async () => {
        await contract.methods
            .store(name, pw)
            .send({from: accounts[0]});

        const fetchedPw = await contract.methods.get(name).call();

        assert.strictEqual(pw, fetchedPw);
    });
    
    it('can only be accessed owner', async () => {
        //check if only the owner of the contract can access it
        assert.rejects(
            async () => {
                await contract.methods
                    .store(name, pw)
                    .send({from: accounts[1]});
            },
            {
                name: 'c',
                message: 'VM Exception while processing transaction: revert Only owner can call this function.'
            }
        );
    });

    it('doesnt\'t allow emtpy strings', async () => {
        //check if storing an empty string and password throw an error
        assert.rejects(
            async () => {
                await contract.methods
                    .store('', '')
                    .send({from: accounts[0]});
            },
            {
                name: 'c',
                message: 'VM Exception while processing transaction: revert'
            }
        );
    });

    it('can only set a password, when the key doesn\'t exist yet', async () => {
        await contract.methods
            .store(name, pw)
            .send({from: accounts[0]});

        assert.rejects(
            async () => {
                await contract.methods
                    .store(name, newPw)
                    .send({from: accounts[0]});
            },
            {
                name: 'c',
                message: 'VM Exception while processing transaction: revert'
            }
        );
    });

    it('can update an existing password', async () => {
        await contract.methods
            .store(name, pw)
            .send({from: accounts[0]});

        let fetchedPw = await contract.methods.get(name).call();
        assert.strictEqual(pw, fetchedPw);

        await contract.methods
            .update(name, newPw)
            .send({from: accounts[0]});

        fetchedPw = await contract.methods.get(name).call();
        assert.strictEqual(newPw, fetchedPw);
    });

    it('can only change an existing password, when it has been previously set', async () => {
        assert.rejects(
            async () => {
                await contract.methods
                    .update(name, pw)
                    .send({from: accounts[0]});
            },
            {
                name: 'c',
                message: 'VM Exception while processing transaction: revert'
            }
        );
    });
    
    it('can remove a password', async () => {
        await contract.methods
            .store(name, pw)
            .send({from: accounts[0]});

        await contract.methods
            .remove(name)
            .send({from: accounts[0]});

        const fetchedPw = await contract.methods.get(name).call();

        assert.strictEqual('', fetchedPw);
    });

    it('can only remove an existing password', async () => {
        assert.rejects(
            async () => {
                await contract.methods
                    .remove(name)
                    .send({from: accounts[0]});
            },
            {
                name: 'c',
                message: 'VM Exception while processing transaction: revert'
            }
        );
    });
})

