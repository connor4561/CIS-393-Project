const http = require('http');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8080;

//Wow, this schema is long. I definitely got tired of all the times that I had to write out so many entries for this project. The price of making something that's actually useful for me, I guess.
mongoose.connect("mongodb://127.0.0.1/statblock_repository").catch((err) => handleError(err));
const statblockSchema = new mongoose.Schema({
    monster_name: {type:String, required:true},
    sizetype: {type:String},
    alignment: {type:String},
    AC: {type:String},
    HP: {type:String},
    speed: {type:String},
    STR: {type:String},
    DEX: {type:String},
    CON: {type:String},
    INT: {type:String},
    WIS: {type:String},
    CHA: {type:String},
    senses: {type:String},
    languages: {type:String},
    CR: {type:String},
    prof_bonus: {type:String},
    saving_throws: {type:String},
    proficiencies: {type:String},
    resistances: {type:String},
    immunities: {type:String},
    vulnerabilities: {type:String},
    condition_immunities: {type:String},
    traits: {type:String},
    actions: {type:String},
    bonus_actions: {type:String},
    legendary_actions: {type:String},
    reactions: {type:String},
    lair_actions: {type:String}
});
const Statblock = mongoose.model("Statblock", statblockSchema);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("views","views");
app.set("view engine", "ejs");

//these things all handle the list/search page and its functions. The first just pulls up the page with a full list, the two search ones narrow the search based on search queries, and the last one was the only thing I could think of to perform an update:
//you can change the name for a statblock. This is actually kind of nice, because otherwise to do the same in this interface you'd have to load the block you want to change, change the name entry, save it, return to the list, load the old block again,
//and delete it. Much less hassle with a dedicated name changer, given that a name is what you're most likely to want to make a quick change to.
app.get("/statblock_list", async(req, res) => {
    const blocks = await Statblock.find({})
    res.render("statblock_list",{data:blocks});
});
app.post("/name_search", async(req, res) => {
    let searchTerm = req.body.name_search;
    searchTerm = "(?i)"+searchTerm+"(?-i)";
    const blocks = await Statblock.find({monster_name:{$regex:searchTerm}});
    res.render("statblock_list",{data:blocks});
});
app.post("/CR_search", async(req, res) => {
    let searchTerm = req.body.CR_search;
    const blocks = await Statblock.find({CR:searchTerm});
    res.render("statblock_list",{data:blocks});
});
app.post("/update_name", async(req, res) => {
    let prev_name = req.body.prev_name;
    console.log(prev_name)
    let new_name = req.body.new_name;
    console.log(new_name)
    const update = await Statblock.updateOne({monster_name:prev_name},{$set:{monster_name:new_name}});
    console.log(update.modifiedCount)
    const blocks = await Statblock.find({});
    res.render("statblock_list",{data:blocks});
})

//This killed me. For so long. I initially was trying to load entries based on the ID assigned to them by mongoDB, but for some reason, it was throwing a fit. when I typed the same query into mongosh, it worked. In here? gibberish. In the end, just
//swapping to using the name instead of the id was enough. (I still have id in the url, because I tried to change it once and it broke. from the user's perspective, the name may as well be an ID anyway.) So, this basically just identifies what
//statblock was clicked on in the selection page, and then loads an editor page with all of its details.
app.get('/load', async(req,res) => {
    const block = await Statblock.find({monster_name:req.query.id});
    res.render("index",{data:block[0]});
})

//This was simple once I figured out how to do url stuff for /load. It just removes the statblock you were working on, and spits you out onto the selection screen.
app.get('/deleted_statblock', async(req,res) => {
    const deleted = await Statblock.deleteOne({monster_name:req.query.id});
    const blocks = await Statblock.find({});
    res.render("statblock_list",{data:blocks});
})

//This is the bread and butter save function: it gathers data from the fields appended with "_save" (my workaround solution to the problem of a very spread out form that maybe wasn't actually necessary but I no longer care), hurls it into mongoDB, and then
//performs a magic trick where it looks like you're on the same page, but if you were in index.html earlier now you're in index.ejs. If you were in index.ejs before, you're still there. no magic.
app.post("/save", async(req, res) => {
    const prev_ver = await Statblock.find({monster_name:req.body.monster_name_save});
    if (prev_ver.length > 0) {
        const del_prev_ver = await Statblock.deleteMany({monster_name:req.body.monster_name_save});
    }
    const block = new Statblock({
        monster_name:req.body.monster_name_save,
        sizetype:req.body.sizetype_save,
        alignment:req.body.alignment_save,
        AC: req.body.AC_save,
        HP: req.body.HP_save,
        speed: req.body.speed_save,
        STR: req.body.STR_save,
        DEX: req.body.DEX_save,
        CON: req.body.CON_save,
        INT: req.body.INT_save,
        WIS: req.body.WIS_save,
        CHA: req.body.CHA_save,
        senses: req.body.senses_save,
        languages: req.body.languages_save,
        CR: req.body.CR_save,
        prof_bonus: req.body.prof_bonus_save,
        saving_throws: req.body.saving_throws_save,
        proficiencies: req.body.proficiencies_save,
        resistances: req.body.resistances_save,
        immunities: req.body.immunities_save,
        vulnerabilities: req.body.vulnerabilities_save,
        condition_immunities: req.body.condition_immunities_save,
        traits: req.body.traits_save,
        actions: req.body.actions_save,
        bonus_actions: req.body.bonus_actions_save,
        legendary_actions: req.body.legendary_actions_save,
        reactions: req.body.reactions_save,
        lair_actions: req.body.lair_actions_save
    });
    try {
        const result = await block.save();
        console.log(result);
        res.render("index",{data:result});
    } catch (err) {console.log(err);}
});


app.listen(port, function(){});