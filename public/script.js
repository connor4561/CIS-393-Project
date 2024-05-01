window.addEventListener("DOMContentLoaded", prepareStatblock);
window.addEventListener("input", prepareStatblock);

//This is the only function I ended up implementing, but it does A LOT. In short, it's what makes sure everything the user types goes where it needs to go.
function prepareStatblock() {
    
    //first, every regular input is sifted through, and its data is transferred to the "_out" section, which has the tan background, and the "_save" section, which is invisible but is what is actually connected to the save button.
    let inputs = document.querySelectorAll('div input');
    for(var i in inputs){
        if (inputs[i].value != null) {
            let id = inputs[i].id;
            let id_out = id+"_out";
            let id_save = id+"_save";
            const OUTname = document.getElementById(id_out);
            const SAVEname = document.getElementById(id_save);
            OUTname.innerHTML = inputs[i].value;
            SAVEname.value = inputs[i].value;
        }
    }

    //This does the same thing, but for the textareas, but also adds in a few fun bonus features
    let areas = document.querySelectorAll('div textarea');
    for(var i in areas){
        if (areas[i].value != undefined) {
            let id = areas[i].id;

            let id_out = id+"_out";
            let id_zone = id+"_zone";
            let id_save = id+"_save";
            const OUTname = document.getElementById(id_out);
            const ZONEname = document.getElementById(id_zone);
            const SAVEname = document.getElementById(id_save);

            //bonus feature 1: if a textarea is empty, its section is hidden from the output. Not all of the textareas will be used for every monster, so having blank zones looks bad.
            if (areas[i].value == ""){
                ZONEname.setAttribute("class","hidden");
            }
            else {
                ZONEname.removeAttribute("class","hidden");
            }

            //bonus feature 2: Per paragraph, everything before the first period is bolded and italicized. This follows the design structure of D&D statblocks, where the title of traits, actions, etc is bolded, italicized, and ends in a period.
            //I though it was pretty neat once I got this working.
            let properties_array = areas[i].value.split("\n");
            let finalHTML = "";
            for (var s in properties_array) {
                let period_index = properties_array[s].indexOf(".");
                period_index++;
                let property_title = properties_array[s].substring(0,period_index);
                let property = properties_array[s].substring(period_index);
                finalHTML += "<span class='property_title'>" + property_title + "</span>" + property + "<br>";
            }
            OUTname.innerHTML = finalHTML;
            SAVEname.value = areas[i].value;
        }

    }
}

