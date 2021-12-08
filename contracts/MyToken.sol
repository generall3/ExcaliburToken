//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @author Bogdan Naida
 * @dev Реализцация токена ERC20 .
 */

}
contract MyToken {

    // Название токена
    string public constant name = "MyToken";

    // Символ токена
    string public constant symbol = "MT";

    // Количество цифр, которые идут после десятичного знака при отображении значений токенов на экране
    uint8 public constant decimals = 8;

    // Общее кол-во выпущенных токенов
    uint public totalSupply;

    //массив для хранения баланса
    mapping (address => uint) balances;

    //двумерный mapping для хранения разрешений перевода
    mapping (address => mapping(address => uint)) allowed

    event Transfer(address indexed _from, address indexed _to, uint _value);
    
    event Approval(address indexed _fromm address indexed _to, uint _value);

    /**
     * @dev Функция эмиссии.
     * @param _to Адрес.
     * @param _value Количество токенов.
     */
    function mint(address _to, uint _value) public {
        require(totalSupply + _value >= totalSupply && balances[_to] + _value >= balances[_to]);
        balances[_to] += _value;
        totalSupply += _value;
    }

    /**
     * @dev Возвращает количество токенов, которые есть на `account`.
     * @return Количество токенов.
     */
    function balanceOf(address owner) public view returns(uint) {
        return balances[owner];
    }

    
    /**
     * @dev Возвращает оставшееся количество токенов, которые разрешено
     * потратить _spender от имени _owner.
     * @param _owner Владелец.
     * @param _spender Тратящий аккаунт.
     */
    function allowance(address _owner, address _spender) public view returns(uint){
        return allowed[_owner][_spender];
    }

    /**
     * @dev Перемещает токены от одного адреса к другому
     * @param _to адрес на который хотим отправить.
     * @param _value значение, которые хотим отправить.
     */
    function transfer(address _to, uint _value) public {
        require(balances[msg.sender] >= _value && balances[_to] + _value >= balances[_to]);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
    }

    /**
     * @dev Перемещает токены от `sender` к `recipient`.
     * @param _from Адрес отправителя.
     * @param _to Адрес получателя.
     * @param _value Количество токенов.
     */
    function transferFrom(address _from, address _to, uint _value) public {
        require(balances[_from] >= _value && balances[_to] + _value >= balances[_to] && allowed[_from][msg.sender] >= _value);
        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][msg.sender] -= _value;
        emit Transfer(msg.sender, _to, _value);
    }

     /**
     * @dev Устанавливает количество токенов, которые разрешено
     * потратить _spender от имени _owner.
     * @param _spender Тратящий аккаунт.
     * @param _value Количество токенов.
     */
    function approve(address _spender, uint _value) public {
        allowed[msg.sender][_spender] = value;
        emit Approval(msg.sender, _spender, _value);
    }
}   