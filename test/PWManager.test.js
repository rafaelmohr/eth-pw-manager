const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const compileResult = require('../compile');

//get abi using dynamic variable name because interface is a reserved keyword
const abi = compileResult['interface'];
const bytecode = compileResult.bytecode;

const web3 = new Web3(ganache.provider());

let accounts, contract;

beforeEach(async () => {
    //get accounts list
    accounts = await web3.eth.getAccounts();

    //deploy contract
    contract = await new web3.eth.Contract(JSON.parse(abi))
        .deploy({
            data: bytecode
        })
        .send({from: accounts[0], gas: '1000000'});
})

describe('PW-Manager Contract Tests', () => {
    it('gets deployed', () => {
        assert.ok(contract.options.address);
    });

    it('can store and access a pw', async () => {

        const name = 'testName', pw = 'test1234';

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
                const name = 'testName', pw = 'test1234';

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

    it('can change an existing password', async () => {

        const name = 'testName', pw = 'test1234', newPw = 'test2929';

        await contract.methods
            .store(name, pw)
            .send({from: accounts[0]});

        let fetchedPw = await contract.methods.get(name).call();
        assert.strictEqual(pw, fetchedPw);

        await contract.methods
            .store(name, newPw)
            .send({from: accounts[0]});

        fetchedPw = await contract.methods.get(name).call();
        assert.strictEqual(newPw, fetchedPw);
    });
    
    it('can remove a password', async () => {
        const name = 'testName', pw = 'test1234';

        await contract.methods
            .store(name, pw)
            .send({from: accounts[0]});

        await contract.methods
            .remove(name)
            .send({from: accounts[0]});

        const fetchedPw = await contract.methods.get(name).call();

        assert.strictEqual('', fetchedPw);
    });
})

