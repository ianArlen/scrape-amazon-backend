const http = require('http');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const sqliteJson = require('sqlite-json');
const scrape = require ('./scrape');

app.use(express.static(__dirname + '/'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:false}));
app.use(require("cors")());

app.listen(3001);
console.log("Servidor corriendo en el puerto 3001");

//Data Base config 
const db_name = path.join(__dirname,"db","base.db");
const db = new sqlite3.Database(db_name, err => {
    if(err) return console.error(err.message);
    else    console.log('Conexion exitosa con la base de datos');
});

const exporter = sqliteJson(db_name);


//Create table 
//DROP TABLE IF EXISTS TABLE_NAME;
const sql_create= `CREATE TABLE IF NOT EXISTS 
                    Categories(category_ID INTEGER NOT NULL PRIMARY KEY, 
                    Category VARCHAR(100) NOT NULL)`;
db.run(sql_create, err => {
    if(err) return console.error(err.message);
    else    console.log('Base de datos creada exitosamente');
});

//Create table 
const table_Products = `CREATE TABLE IF NOT EXISTS 
                        Products(products_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                        Name VARCHAR(100) NOT NULL,
                        Author VARCHAR(100) NOT NULL,
                        CoverImage VARCHAR(100) NOT NULL)`;

db.run(table_Products, err => {
    if(err) return console.error(err.message);
    else    console.log('Base de datos creada exitosamente');
});


//Create table 
const table_Ratings = `CREATE TABLE IF NOT EXISTS 
                        Ratings(Rating_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                        Total VARCHAR(100) NOT NULL,
                        Value VARCHAR(100) NOT NULL)`;

db.run(table_Ratings, err => {
    if(err) return console.error(err.message);
    else    console.log('Base de datos creada exitosamente');
});


app.get('/',(req, res) => {
    res.json({hola:'hello world'});
});


let insertCategories = (category) => {
    const insert = `INSERT INTO Categories(category) 
                        VALUES("`+category+`")`;
    db.run(insert, [], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID} Categories`);
    });
}

let insertProducts = (name, author, coverImage)=> {
    const insert = `INSERT INTO Products(Name, Author, CoverImage) 
                        VALUES("`+name+`", "`+author+`", "`+coverImage+`")`;
    db.run(insert, [], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID} Products`);
    });
} 

let insertRatings = (total, value) => {
    const insert = `INSERT INTO Ratings(Total, Value) 
                        VALUES("`+total+`", "`+value+`")`;
    db.run(insert, [], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID} Ratings`);
    });
}



app.get('/amazon', async (req, res) => {

    amazon = [];
    const scrapeData = await scrape.main();

    const categories = scrapeData[0];
    const productsS = scrapeData[1];

    for(let i = 0 ; i < categories.length; i++ ){
        amazon.push({
            "category": categories[i],
            "products":[]
        });
        insertCategories(categories[i]);
    }
    
    tempProd = [];
    let k = 0; 
    for(let i = 0 ; i < categories.length; i++ ){
        tempProd = [];
        tempRat = []; 
        for(let j = 0; j < 3; j++){
            insertProducts(productsS[k]['title'], productsS[k]['author'], productsS[k]['coverImage']);
            tempProd.push({
                "name": productsS[k]['title'], 
                "author": productsS[k]['author'] ,
                "coverImage": productsS[k]['coverImage'], 
                "rating": {}
            });
            insertRatings(productsS[k]['total'], productsS[k]['value']);
            tempProd[j]['rating'] = {"total": productsS[k]['total'],
                                    "value": productsS[k]['value']};
            k++;
        }
        amazon[i].products = tempProd;
    }
    
    res.json(amazon);
});


