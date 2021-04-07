/**
 * Mongoose returns a singleton object so all the places in the application
 * where require('mongoose') was called the same instance gets returned
 *
 */

const mongoose = require('mongoose')

// get rid of warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);


class Database {

  constructor() {
    this.connect()
  }

  connect() {
    mongoose.connect('mongodb+srv://toady_67AK_28742dfskwer:YOMjny9m0OupZwuu@cluster0.qseo9.mongodb.net/twitter-db?retryWrites=true&w=majority')
    .then(() => {
      console.log("Succesfully connected to DB 🔖");
    })
    .catch(error => {
      console.log("Cunt connect to DB 🌶",error);
    })
  }

}

module.exports = new Database()