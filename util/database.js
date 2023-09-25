import * as SQLite from "expo-sqlite";

import { Place } from "../models/place";

/**We create a database locally on our device with the help of 
this API. It necessary because without a database whenever we 
restart the app the data of our favorite places are lost.*/
/**Here we create a database by calling SQLite.openDatabase. 
And to open a database we pass a string with the name of the 
database file, which could be places.db. .db as a extension 
for this database file. Now this database, initially doesn't
exist, but SQLite will create it for us, or this package will
create it for us, if it doesn't exist yet. And if it does exist
thereafter and the app restarts, it will simply open this existing 
database.*/
const database = SQLite.openDatabase("places.db");

/**This function below, sets up the initial database structure.
This only needs to execute once, but of course we must make sure 
that it runs at least once, so that we have a properly configured
database in place. I wanna use the database created and send a query, 
a SQL query to that database, that will setup a base structure. To be 
precise that will add a table with a certain structure, to that database.
And a good place to execute this code or function is in App.js. 
Because the App.js is the first component that is executed when the app 
starts, and therefore it's a great place for initializing our database.*/
export function init() {
  /**This is not React Native specific, but a standard Js feature. And then 
  we get a resolve and a reject function, as parameters in this function which 
  we pass to the promise constructor. Those parameters will be passed into this 
  function by Js in the end, because the promise object and class is built into 
  JavaScript. So we moved our code inside of this promise function. And if we now 
  hve a success scenario, so we succeed at running this command i.e the the 
  instruction passed to executeSql method as argument, I will resolve with the the 
  resolve callback. And if we have an error, I will reject and forward the error.
  By the way, if the table already exists, that will not be an error, that will also 
  qualify as a success. An error really only occurs if something fails here, if we have 
  a syntax error in the command, or anything like this.*/
  const promise = new Promise((resolve, reject) => {
    /**The transaction method accepts a function as argument with a 
    transaction object as a parameter */
    database.transaction((tx) => {
      /**Here we get access to executeSql() method. And then here, we pass our 
    SQL instruction, our SQL command, as a string, to executeSql. Here
    I'm using the template literal notation so that we can split this across
    multiple lines for readability purposes. This will create a new table named, 
    places, if it does not exist yet. We need this annotation, IF NOT EXISTS, 
    because we will later call init whenever the app starts. And of course  this 
    table will exist for most starts, except for the very first time. That is why 
    we must add this check, so that we don't get an error if places already does 
    exist. But if it does not exist yet, this table will be created. Between brackets
    we now add the configuration for this places table. We add the different columns
    we wanna have in that table, so to say.*/
      /**Adding a PRIMARY KAY INTEGER column, will create an automatically incrementing
    id for us. Which means that whenever we later insert data into this table, the id 
    field will be populated automatically by SQLite. Then we add a comma  and we add 
    the next column definition, which could be the title here. The title should be of type
    TEXT, and should be NOT NULL, because of course we wanna have a title for every place
    that we store. Now, in addition, every place has an image, and we're not going to store 
    the image in the database, instead the image stays on the file system where it was stored
    by the image picker. But I wanna store the path, that points to that image, in the database.
    And that's a general best practice. You don't store files in databases, but paths to files.
    The lat, lng which are basically numbers with decimal places and NOT NULL.*/
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      imageUri TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    )`,
        [],

        /**This callback will be executed when everything is succeeded. */
        () => {
          resolve();
        },

        /**This one receives two arguments, it receives the transaction that failed.
      I don't need that here, so I will add a blank. The blank signals that I have 
      to take this argument (_) for technical reasons, but I'm not using it.*/
        (_, error) => {
          reject(error);
        }
      );
    });
  });

  /** Now the code above is promisified and now we can return this promise here, as
  a part of the init function at the end of the init function. So that when we call 
  init function from somewhere else in our code, init returns a promise that will execute 
  the executeSql method command it means the instructions inside the brackets, and then 
  resolve, so succeed. If the command succeeded or reject with an error if we had an error.*/
  return promise;
}
/**My plan is to promisify this library and its functionalities because by default SQLite,
this package works with callback functions. I would like to return a promise here in init 
function, which resolves when the transaction is done, and rejects if we have an error. promisify
is a common concept used in Js, specially in asynchronously operations. It means to convert a 
function which uses callbacks into a function which returns a promise. It's used most of the time
in Js library and Node.js development to simplify tha synchronously operations, particularly when 
we work with libraries or APIs which use callbacks. It renders the code asynchronous and smooth and more 
easily to understand using promises to represent future results.   */

/**This function will help us insert data in our SQLite table. So we use Sql command to insert place data
we use the columns names in which we want to insert data in the instruction or command, except the id that
will be assigned automatically by  SQLite. To insert data values for each column we use the VALUES class to 
insert values. Now we could dynamically inject values into this template literal, but here with this third 
party package, which we're using, the better and recommended way of inserting dynamic data into this query 
is to add some placeholders here, to be precise, question marks one for each value; that should be inserted.
So five question marks in total since we're inserting data into five columns, and with that we can then pass
a second argument here to this execute SQL method. And that is an array with the concrete values that will be
used instead of these question marks. And the order of the items in the array should match the order of question
and columns.*/
export function insertPlace(place) {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO places (title, imageUri, address, lat, lng) VALUES (?, ?, ?, ?, ?)`,
        [
          place.title,
          place.imageUri,
          place.address,
          place.location.lat,
          place.location.lng,
        ],
        (_, result) => {
          //console.log(result);
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });

  return promise;
}

export function fetchPlaces() {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM places",
        [] /** Here the array is empty because in this command we have no data to inject or insert */,
        (_, result) => {
          const places = [];

          for (const dp of result.rows._array) {
            places.push(
              new Place(
                dp.title,
                dp.imageUri,
                {
                  address: dp.address,
                  lat: dp.lat,
                  lng: dp.lng,
                },
                dp.id
              )
            );
          }
          console.log(result);
          resolve(places);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });

  return promise;
}

export function fetchPlaceDetails(id) {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM places WHERE id = ?",
        [id],
        (_, result) => {
          /**When we're fetching the place data or details, I am returning
            the place as we're getting it back from the database. Now, we must 
            keep in mind, that the fetched place as it's coming back from the 
            database doesn't have the shape of our place model. So in order to
            make sure that we do have that shape, I also wanna transform this 
            place here before I resolve from inside to this function.*/
          // console.log(result);
          const dbPlace = result.rows._array[0];
          const place = new Place(
            dbPlace.title,
            dbPlace.imageUri,
            { lat: dbPlace.lat, lng: dbPlace.lng, address: dbPlace.address },
            dbPlace.id
          );
          resolve(place);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });

  return promise;
}
