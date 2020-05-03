const express = require("express");
const bp = require("body-parser");
const app = express();
const mongoose = require("mongoose");
var items = [];
app.set('view engine', 'ejs');
app.use(bp.urlencoded({
  extended: true
}));
//const bp= require("body-parser");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("item", itemsSchema);
//console.log(d);
const Item1 = new Item({
  name: "Welcome to your todo list"
});
const Item2 = new Item({
  name: "Hit the button to add new items"
});
const Item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defatultItems = [Item1, Item2, Item3];
// making new list schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const newlist = mongoose.model("list", listSchema);
app.get("/:listtype", function(req, res) {
  const listname = req.params.listtype;
  newlist.findOne({name:listname}, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      if (found== null) {
        const list = new newlist({
          name: listname,
          items: defatultItems
        });
        list.save();
        res.redirect("/"+listname);
      } else {
        console.log(found.items);
        res.render("index",{
          kindofday: found.name,
          name: found.items
        });
      //  console.log("already exist");
      }
    }
  });

});
app.get("/", function(req, res) {
  var date = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  var input = date.toLocaleDateString("en-US", options);
  //console.log("in");
  //  console.log("connected-3");
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log("found an error");
      //  console.log("connected-4");
    } else {
      //  console.log("connected-5");
      if (foundItems.length == 0) {
        Item.insertMany(defatultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("success");
          }
        });
      }
      res.render("index", {
        kindofday: "Today",
        name: foundItems
      });
    }
  });
});
app.post("/delete", function(req, res){
  var listname=req.body.itemtodelete;
  console.log(listname);
  newlist.findOneAndUpdate({name: listname}, {$pull: {items:{name: req.body.checkbox}}}, function(err){
    if(err)
    {
      console.log(err);
    }
    else{
      res.redirect("/"+listname);
    }
  });
});
app.post("/", function(req, res) {
  //items.push(req.body.item);
  //console.log(req.body.kindofday);
  if(req.body.kindofday=="Today")
  {
    const add = new Item({
      name: req.body.item
    });
    add.save();
  }
  else
  {
    newlist.findOne({name: req.body.kindofday}, function(err, found){
    //  console.log("found...");
      const add = new Item({
        name: req.body.item
      });
      console.log(add);
      found.items.push(add);
      found.save();
    });
    // newlist.save();
  }
  res.redirect("/"+req.body.kindofday);
});
app.listen(3000, function() {
  console.log("listening on port 3000");
});
