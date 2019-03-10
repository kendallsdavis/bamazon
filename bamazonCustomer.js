
const inquirer = require("inquirer");
const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  PORT: 8000,
  user: "root",
  password: "12345",
  database: "bamazon"
});

let items = [];

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    showItems();
});

// showItems function to display id, name, price of all items for sale
function showItems(){
    connection.query("SELECT id, product_name, price, stock_quantity FROM products", function(err, results) {
    if (err) throw err;
        items = results;
        showAllItems();
        selectItem();
    })
};

function showAllItems() {
    console.log('Available Products: ');
    for (var i = 0; i < items.length; i++) {
        console.log(`ID: ${items[i].id} | Product: ${items[i].product_name} | Price: ${items[i].price}`);
    }
}

function selectItem(){
    inquirer
    .prompt({
      name: "selectItem",
      type: "list",
      message: "Please select the item you'd like to purchase",
      choices: generateChoices()
    }).then(function(answer){
        selectCount(answer.selectItem);
    })
};

function generateChoices(){
    const choices = [];
    for(var i = 0; i < items.length; i++){
        itemNames = items[i].product_name;
        choices.push(itemNames);
    }
    return choices;
}

function selectCount(itemName){
    inquirer
    .prompt({
     type: "input",
     name: "purchaseAmount",
     message: "How many would you like to purchase?",
     default: function () {
        return '1';
    }
}).then(function(itemQty){
    // define variable to capture the quantity requested by the user in the inquirer prompt
    const qty = itemQty.purchaseAmount;
    // loop through list of items to find the selected item, and then compare the qty requested to the db quantity in stock
    for(var i = 0; i<items.length; i++){
        if(itemName === items[i].product_name){  
            if(qty < items[i].stock_quantity){
                console.log("Purchase Complete");
                // update the js variable tracking the stock quantity
                items[i].stock_quantity = items[i].stock_quantity  - qty;
                // perform a database query to update the in stock inventory count
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [{stock_quantity: items[i].stock_quantity},
                    {product_name: itemName}]
                    );
                    // calculate and return the total price of the user's purchase
            const totalPurchase = items[i].price * qty;
            console.log("Your total purchase comes to: " + totalPurchase);
            } else {
                // if insufficient inventory, do not perform db update and return console log message
                console.log("Sorry, not enough inventory, please select a lower quantity");
                // allow user to select a lower quantity and attempt the purchase again
                selectCount(itemName);
            }
        }
    }
})
};


    