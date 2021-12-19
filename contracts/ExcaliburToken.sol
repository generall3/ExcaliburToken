//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @author Bogdan Naida
 * @dev Реализация токена ERC20 .
 */

abstract contract ERC20Token {
    function name() virtual public view returns (string memory);
    function symbol() virtual public view returns (string memory);
    function decimals() virtual public view returns (uint8);
    function totalSupply() virtual public view returns (uint256);
    function balanceOf(address _owner) virtual public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) virtual public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) virtual public returns (bool success);
    function approve(address _spender, uint256 _value) virtual public returns (bool success);
    function allowance(address _owner, address _spender) virtual public view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract Ownable {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address _to) public {
        require(msg.sender == owner);
        newOwner = _to; 
    }

    function acceptOwnership() public {
        require(msg.sender == newOwner);
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }
}
contract ExcaliburToken is ERC20Token, Ownable {

    // Символ токена
    string public _symbol; 

    // Название токена
    string public _name; 

    // Количество цифр, которые идут после десятичного знака при отображении значений токенов на экране
    uint8 public _decimals;

    // Общее кол-во выпущенных токенов
    uint public _totalSupply;

    //массив для хранения баланса
    mapping (address => uint) balances;

    //двумерный mapping для хранения разрешений перевода
    mapping (address => mapping(address => uint)) allowances;

    // Входные значения при запуске контракта
    constructor() {
        _symbol = "ET";
        _name = "ExcaliburToken";
        _decimals = 2;
        _totalSupply = 10000;
        balances[msg.sender] = _totalSupply;
    }

    /**
     * @dev Возвращает имя токена.
     * @return Количество токенов.
     */
    function name() public override view returns (string memory) {
        return _name;
    }

    /**
     * @dev Возвращает символ токена.
     * @return Количество токенов.
     */
    function symbol() public override view returns (string memory) {
        return _symbol;

    }

    /**
     * @dev Возвращает количество знаков после запятой у токена.
     * @return Количество токенов.
     */
    function decimals() public override view returns (uint8) {
        return _decimals;

    }

    /**
     * @dev Возвращает общее количество выпущенных токенов.
     * @return Количество токенов.
     */
    function totalSupply() public override view returns (uint256) {
        return _totalSupply;

    }

    /**
     * @dev Возвращает количество токенов, которые есть на балансе.
     * @return _balance Количество токенов.
     */
    function balanceOf(address _owner) public override view returns (uint256 _balance) {
        return balances[_owner];

    }

    /**
     * @dev Перемещает токены от отправителя к получателю.
     * @param _from Адрес отправителя.
     * @param _to Адрес получателя.
     * @param _value Количество токенов.
     */
    function transferFrom(address _from, address _to, uint256 _value) virtual override public returns (bool success) {
        require(balances[_from] >= _value);
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Перемещает токены на заданный адрес.
     * @param _to адрес на который хотим отправить.
     * @param _value значение, которые хотим отправить.
     */
    function transfer(address _to, uint256 _value) virtual override public returns (bool success) {
        return transferFrom(msg.sender, _to, _value);
    }

    /**
     * @dev Устанавливает количество токенов, которые разрешено
     * потратить _spender от имени _owner.
     * @param _spender Тратящий аккаунт.
     * @param _value Количество токенов.
     */
    function approve(address _spender, uint256 _value) virtual override public returns (bool success) {
        allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Возвращает количество токенов, которые разрешено
     * потратить _spender от имени _owner.
     * @param _owner Владелец.
     * @param _spender Тратящий аккаунт.
     */
    function allowance(address _owner, address _spender) virtual override public view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }
    /**
     * @dev Функция добавления новых токенов.
     * @param amount Количество токенов.
     */
    function mint(address to, uint amount) public returns (bool) {
        _totalSupply += amount;
        balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
        return true;
    }

    /**
     * @dev Функция сжигает токены пользователя.
     * @param amount Количество токенов.
     */
    function burn(uint amount) public returns (bool) {
        require(_totalSupply >= amount, "Not enough tokens to burn");
        require(balances[msg.sender] >= amount, "Not enough tokens to burn");

        _totalSupply -= amount;
        balances[msg.sender] -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }
}   