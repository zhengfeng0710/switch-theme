

let sketch = require('sketch')
let Artboard = sketch.Artboard
var Text = require('sketch').Text
var ShapePath = require('sketch/dom').ShapePath

let document = sketch.getSelectedDocument()

let page = document.selectedPage

var CreateArtboard = true;
let TextLibrary
let ColourLibrary

var symbolPredicate = NSPredicate.predicateWithFormat("className == %@", 'MSSymbolInstance');



var libraries = require('sketch/dom').getLibraries()
for (var l = 0; l < Object.keys(libraries).length; l++) {
    if (libraries[l].name.includes('Type') || libraries[l].name.includes('Text') || libraries[l].name.includes('Fonts') || libraries[l].name.includes('Tyepface')) {
        TextLibrary = sketch.getLibraries()[l]
    }

    if (libraries[l].name.includes('Color') || libraries[l].name.includes('Colour') || libraries[l].name.includes('Colours') || libraries[l].name.includes('Tyepface')) {
        ColourLibrary = sketch.getLibraries()[l]
    }
}





    var myArtboard

    // get the select layer's name to check in the library

    var textstyleReferences = TextLibrary.getImportableTextStyleReferencesForDocument(document)
    var layerstyleReferences = ColourLibrary.getImportableLayerStyleReferencesForDocument(document)



    var selection = context.selection;

    var fromTheme, toTheme;
    var new_name
    var instance
    //for each layer selected in the document, checking if there are artboards with sublayers



    var UI = require('sketch/ui')


    UI.getInputFromUser(
        "Switch to",
        {
            type: UI.INPUT_TYPE.selection,
            possibleValues: ['Light', 'Dark'],
        },
        (err, value) => {
            if (err) {
                // most likely the user canceled the input
                return
            }
            if (value == 'Light') {
                fromTheme = 'Dark'
                toTheme = 'Light'

            }
            if (value == 'Dark') {
                fromTheme = 'Light'
                toTheme = 'Dark'

            }
        }
    )


    var move = 0;
    var iterator = -1;
    selection.forEach(function (layer) {

        if (layer.layers && layer.class() == "MSArtboardGroup") {
            iterator++;
            var children = layer.children();
            move += 50;

            //artboard name handling

            new_name = sketch.getSelectedDocument().selectedLayers.layers[iterator].name;

            //removes current naming

            if (new_name.includes("Dark")) { new_name = new_name.replace('Dark', '') }
            else if (new_name.includes("Light")) { new_name = new_name.replace('Light', ''); }

            if (new_name.includes("dark")) { new_name = new_name.replace('dark', '') }
            else if (new_name.includes("light")) { new_name = new_name.replace('light', ''); }

            if (new_name.includes("dakr")) { new_name = new_name.replace('dakr', '') }
            else if (new_name.includes("lihgt")) { new_name = new_name.replace('lihgt', ''); }


            var symbols = children.filteredArrayUsingPredicate_(symbolPredicate)

            for (var i = 0; i < symbols.count(); i++) {
                //storing each Symbol Instance name && switching theme



               

                //symbols[i] is an object, so the id value needs to be extracted, then the right layer = looped symbol instance is found

                var extracted_symbol_id = symbols[i].toString().split('(').pop().split(')')[0];
                var current_symbol_instance = document.getLayerWithID(extracted_symbol_id)


                if (sketch.getSelectedDocument().selectedLayers.layers[iterator].layers[i].type == 'Group') {
                    log("It's a group")

                }

                //I use the extracted ID and found layer to match the correct library & master references

                var library_linked = current_symbol_instance.master.getLibrary()
                var symbolReferences = library_linked.getImportableSymbolReferencesForDocument(document)


                symbolReferences.forEach((ImportableObject) => {
                    if (ImportableObject.id == current_symbol_instance.symbolId) {

                        var imported_symbol_name = ImportableObject.name.replace(fromTheme, toTheme)
                        var to_Import = symbolReferences.filter(element => element.name == imported_symbol_name)

                        var symbolMaster = to_Import[0].import();
                        instance = symbolMaster.createNewInstance();

                        //imported the symbol that matches current instance


                        // if there is an arboard created, don't make another one, the existing one

                        if (i == 0) {
                            CreateArtboard = false;
                            myArtboard = new Artboard({
                                parent: page,
                                name: new_name + toTheme,
                                frame: {
                                    x: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.x + sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.width + move,
                                    y: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.y,
                                    width: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.width,
                                    height: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.height
                                }
                            });

                            myArtboard.background.enabled = true;

                            //set new artboard background to dark, if switching light -> dark

                            if (toTheme == "Dark") {
                                myArtboard.background.color = '#000000ff';
                            }

                            //sizes checked to match symbol to existing instance

                            var new_frame = symbols[i].frame()
                            var new_x = new_frame.x()
                            var new_y = new_frame.y()
                            var new_width = new_frame.width()
                            var new_height = new_frame.height()

                            instance.frame = { x: new_x, y: new_y, width: new_width, height: new_height };
                            instance.parent = myArtboard;


                        }
                        else {

                            var new_frame = symbols[i].frame()
                            var new_x = new_frame.x()
                            var new_y = new_frame.y()
                            var new_width = new_frame.width()
                            var new_height = new_frame.height()

                            instance.frame = { x: new_x, y: new_y, width: new_width, height: new_height };
                            instance.parent = myArtboard

                        }
                        var test_layers = current_symbol_instance;
                        //going through overrides for symbols and texts separately

                        for (var w = 0; w < (Object.keys(instance.overrides).length); w++) {

                            //only get the override if the value is differnet from the default one, otherwise let the symbol handle it

                            if (test_layers.overrides[w].property == 'stringValue' && !(test_layers.overrides[w].isDefault)) {
                                instance.overrides[w].value = test_layers.overrides[w].value
                            }


                            if (test_layers.overrides[w].property == 'layerStyle' && !(test_layers.overrides[w].isDefault)) {
                                layerstyleReferences.forEach((element) => {


                                    var correct_layer_style_id = test_layers.overrides[w].value

                                   // correct_layer_style_id = correct_layer_style_id.split('[').pop().split(']')[0];


                                    if (element.id == test_layers.overrides[w].value) {


                                        var layer_style_switch_name = element.name.replace(fromTheme, toTheme)
                                        layerstyleReferences.forEach((sub_element) => {

                                            if (sub_element.name == layer_style_switch_name) {

                                                var sharedStyle = sub_element.import()
                                                instance.overrides[w].value = sharedStyle.id
                                            }

                                        })
                                    }
                                })
                            }



                            if (test_layers.overrides[w].property == 'textStyle' && !(test_layers.overrides[w].isDefault)) {

                                textstyleReferences.forEach((element) => {

                                    if (element.id == test_layers.overrides[w].value) {
                                        var text_stlye_override_switch_name = element.name.replace(fromTheme, toTheme)
                                        //look for the switched text style by its name

                                        textstyleReferences.forEach((sub_element) => {
                                            if (sub_element.name == text_stlye_override_switch_name) {
                                                var textStyle_to_import = sub_element.import()


                                                instance.overrides[w].value = textStyle_to_import.id
                                            }
                                        });

                                    }
                                })
                            }

                            if (test_layers.overrides[w].property == 'symbolID' && !(test_layers.overrides[w].isDefault)) {


                                // var override_library_linked = test_layers.overrides[w].master.getLibrary()

                                var override_symbol_master = document.getSymbolMasterWithID(test_layers.overrides[w].value)
                                var override_library_linked = override_symbol_master.getLibrary()

                                var override_symbolReferences = override_library_linked.getImportableSymbolReferencesForDocument(document)

                                override_symbolReferences.forEach((element) => {


                                    if (element.id == test_layers.overrides[w].value) {


                                        var symbol_override_switch_name = element.name.replace(fromTheme, toTheme)
                                        //look for the switched symbol by its name

                                        override_symbolReferences.forEach((sub_element) => {
                                            if (sub_element.name == symbol_override_switch_name) {

                                                //importing the same symbol into the artboard , deleting it afterward to have it as a reference

                                                var master_to_delte = sub_element.import();
                                                var instance_to_delete = master_to_delte.createNewInstance();

                                                instance_to_delete.parent = myArtboard

                                                instance.overrides[w].value = instance_to_delete.symbolId

                                                instance_to_delete.remove()

                                            }

                                        });
                                    }
                                })
                            }

                        }


                    }
                });

            }


            ///Text work in here

            let textLayers = sketch.find('Text')
            var selected_text_layers = textLayers.filter(function (element) {
                return element.parent.name == sketch.getSelectedDocument().selectedLayers.layers[iterator].name
            });
            var result = selected_text_layers.map(a => a.sharedStyleId);
            var result_shared_style = selected_text_layers.map(a => a.sharedStyle);
            var locations = selected_text_layers.map(a => a.frame);
            var texts = selected_text_layers.map(a => a.text);
            var styles = selected_text_layers.map(a => a.style)


            for (var z = 0; z < (Object.keys(locations).length); z++) {


                if (CreateArtboard) {
                    myArtboard = new Artboard({
                        parent: page,
                        name: new_name + toTheme,
                        frame: {
                            x: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.x + sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.width + move,
                            y: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.y,
                            width: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.width,
                            height: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.height
                        }
                    });
                    myArtboard.background.enabled = true;

                    //set new artboard background to dark, if switching light -> dark
                    if (toTheme == "Dark") {
                        myArtboard.background.color = '#000000ff';
                    }
                    CreateArtboard = false;

                }


                var text = new Text({
                    text: 'my text',
                    frame: locations[z],
                    text: texts[z],
                    style: styles[z],
                    sharedStyleId: result[z],
                    sharedStyle: result_shared_style[z]
                })

                text.parent = myArtboard

                if (text.sharedStyle.name != null)
                if (text.sharedStyle.name.includes(fromTheme)) {

                    var switch_text_style = text.sharedStyle.name.replace(fromTheme, toTheme)

                    textstyleReferences.forEach((element) => {
                        if (element.name == switch_text_style) {
                            var new_text_style = element.import();
                            text.sharedStyle = new_text_style;
                            text.style.syncWithSharedStyle(new_text_style)
                        }
                    })

                }


           


            }
            //working with shapes

            let shapeLayers = sketch.find('ShapePath')
            var shapes_in_Artboard = shapeLayers.filter(function (element) {
                return element.parent.name == sketch.getSelectedDocument().selectedLayers.layers[iterator].name
            });
           

            var shape_sharedStyleID = shapes_in_Artboard.map(a => a.sharedStyleId);
            var shape_size = shapes_in_Artboard.map(a => a.frame);
            var shape_styles = shapes_in_Artboard.map(a => a.style)
            var shape_points = shapes_in_Artboard.map(a => a.points)
            var shape_transform = shapes_in_Artboard.map(a => a.transform)
            var shape_type = shapes_in_Artboard.map(a => a.shapeType)
            var shape_rotation = shapes_in_Artboard.map(a => a.transform.rotation)

            ///@@@@Add transform.rotation
            ///@@@@Separate artboards if only this rolls

                            //create artboard in case thre are layer styles only


            if (CreateArtboard) {
                myArtboard = new Artboard({
                    parent: page,
                    name: new_name + toTheme,
                    frame: {
                        x: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.x + sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.width + move,
                        y: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.y,
                        width: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.width,
                        height: sketch.getSelectedDocument().selectedLayers.layers[iterator].frame.height
                    }
                });
            }

                myArtboard.background.enabled = true;

                //set new artboard background to dark, if switching light -> dark

                if (toTheme == "Dark") {
                    myArtboard.background.color = '#000000ff';
                }

                CreateArtboard = false;
            }


        for (var k = 0; k < (Object.keys(shape_size).length); k++) {
            const shapePath = new ShapePath({
                shapeType: shape_type[k],
                sharedStyleId: shape_sharedStyleID[k],
                frame: shape_size[k],
                points: shape_points[k],
                transform: shape_transform[k],
                style: shape_styles[k],
                parent: myArtboard

            })
            shapePath.transform.rotation = shape_rotation[k];
            if (shapePath.sharedStyleId != null) {

                layerstyleReferences.forEach((element) => {

                    if (element.id == shapePath.sharedStyleId) {
                        var switch_layer_style = element.name
                        switch_layer_style = switch_layer_style.replace(fromTheme, toTheme)

                        layerstyleReferences.forEach((sub_element) => {
                            if (sub_element.name == switch_layer_style) {

                                var new_new_layer_style = sub_element.import();
                                shapePath.sharedStyleId = new_new_layer_style.id;
                                shapePath.style.syncWithSharedStyle(new_new_layer_style)
                            }

                        })
                    }

                })


            }


            }
        

        

    });

 


