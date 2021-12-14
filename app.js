//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://tkwsean:T0118121H@gettingstarted.edlcg.mongodb.net/todolistDB",{useNewUrlParser: true});
const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item",itemsSchema)
const item1 = new Item({
  name: "Homework1",
})
const item2 = new Item({
  name: "Homework2",
})
const item3 = new Item({
  name: "Homework3",
})
const array = [item1,item2,item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema)

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
  Item.find({},(error,items) => {
    if(items.length === 0){
      Item.insertMany(array,(error) => {
        if(error){
          console.log(error)
        }else{
          console.log("Success")
        }
      })
      res.redirect('/')
    }else{
      res.render("list",{listTitle: "Today", newListItems: items})
    }
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem1 = new Item({
    name: itemName
  })
  if(listName === "Today"){
    newItem1.save();
    res.redirect('/')
  }else{
    List.findOne({name: listName},(error,foundList) => {
      foundList.items.push(newItem1);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
})


app.get("/:customListName",(req,res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},(error,result) => {
    if(!error){
      if(!result){
        const list = new List({
          name: customListName,
          items: array
        })
        list.save();
        res.redirect("/" + customListName)
      }else{
        res.render("list",{listTitle: result.name,newListItems: result.items})
      }
    }else{
      console.log(error)
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", (req,res) => {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,(error) => {
      if(error){
        console.log(error)
      }else{
        console.log("Successfully removed item")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},(error,foundList) => {
      if(!error){
        res.redirect("/" + listName);
      }
    });
  }

})

let port = process.env.PORT
if(port == null || port == ""){
  port = 3000;
}
app.listen(port,() => {
  console.log('Server has started successfully!')
})
