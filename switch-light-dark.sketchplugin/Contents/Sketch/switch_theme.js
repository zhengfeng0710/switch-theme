var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("sketch/dom");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var sketch = __webpack_require__(1);
var Artboard = sketch.Artboard;
var Text = __webpack_require__(1).Text;
var ShapePath = __webpack_require__(0).ShapePath;
var Group = __webpack_require__(0).Group;

var document = sketch.getSelectedDocument();
var page = document.selectedPage;
var docSwatches = document.swatches;
var imported_swatches = [];

var selection = context.selection;
var fromTheme, toTheme;
var currentArtboard;
var newArtboardName;
var instance;
var group_name;

var move = 0;
var master_iterator = -1;

var CreateArtboard = true;
var TextLibrary = void 0;
var ColourLibrary = void 0;

var isGlobalColour = false;
var isGlobalText = false;

var myArtboard;

var layerstyleReferences;
var textstyleReferences;
var swatchRefs = void 0;

function removeArtboardNames() {

    //removes current artboard naming

    if (newArtboardName.includes("Dark")) {
        newArtboardName = newArtboardName.replace('Dark', '');
    } else if (newArtboardName.includes("Light")) {
        newArtboardName = newArtboardName.replace('Light', '');
    }

    if (newArtboardName.includes("dark")) {
        newArtboardName = newArtboardName.replace('dark', '');
    } else if (newArtboardName.includes("light")) {
        newArtboardName = newArtboardName.replace('light', '');
    }

    if (newArtboardName.includes("dakr")) {
        newArtboardName = newArtboardName.replace('dakr', '');
    } else if (newArtboardName.includes("lihgt")) {
        newArtboardName = newArtboardName.replace('lihgt', '');
    }
}

function createArtboatd() {
    if (CreateArtboard) {
        myArtboard = new Artboard({
            parent: page,
            name: newArtboardName + ' ' + toTheme,
            frame: {
                x: currentArtboard.frame.x + currentArtboard.frame.width + move,
                y: currentArtboard.frame.y,
                width: currentArtboard.frame.width,
                height: currentArtboard.frame.height
            }
        });

        myArtboard.background.enabled = true;

        if (toTheme == "Dark") {
            myArtboard.background.color = '#000000ff';
        }
        CreateArtboard = false;
    }
}

var libraries = __webpack_require__(0).getLibraries();
for (var l = 0; l < Object.keys(libraries).length; l++) {
    if (libraries[l].name.includes('Type') || libraries[l].name.includes('Text') || libraries[l].name.includes('Fonts') || libraries[l].name.includes('Fundamentals')) {
        isGlobalText = true;
        TextLibrary = sketch.getLibraries()[l];
        textstyleReferences = TextLibrary.getImportableTextStyleReferencesForDocument(document);
    }

    if (libraries[l].name.includes('Color') || libraries[l].name.includes('Fundamentals') || libraries[l].name.includes('Colours')) {
        isGlobalColour = true;
        ColourLibrary = sketch.getLibraries()[l];
        layerstyleReferences = ColourLibrary.getImportableLayerStyleReferencesForDocument(document);
        swatchRefs = ColourLibrary.getImportableSwatchReferencesForDocument(document);
    }
}

//for each layer selected in the document, checking if there are artboards with sublayers


var UI = __webpack_require__(3);

UI.getInputFromUser("Switch to", {
    type: UI.INPUT_TYPE.selection,
    possibleValues: ['Light', 'Dark']
}, function (err, value) {
    if (err) {
        UI.close();
        return;
    }

    if (value == 'Light') {
        fromTheme = 'Dark';
        toTheme = 'Light';
    }
    if (value == 'Dark') {
        fromTheme = 'Light';
        toTheme = 'Dark';
    }
});

selection.forEach(function (layer) {
    if (layer.layers && layer['class']() == "MSArtboardGroup") {
        master_iterator++;move += 150;
        var children = layer.children();
        currentArtboard = sketch.getSelectedDocument().selectedLayers.layers[master_iterator];

        //artboard name handling

        newArtboardName = sketch.getSelectedDocument().selectedLayers.layers[master_iterator].name;
        removeArtboardNames();

        CreateArtboard = true;
        createArtboatd();

        //////////GETTING ALL LAYERS IN AN ARTBOARD BY NAME, THEN ID

        for (var f = 0; f < children.count(); f++) {
            if (children[f]['class']() != "MSArtboardGroup") {
                var extracted_children_id = children[f].toString().split('(').pop().split(')')[0];
                var current_layer_in_artboard = document.getLayerWithID(extracted_children_id);

                //////////SYMBOL LAYER

                if (current_layer_in_artboard.type == "SymbolInstance") {

                    //I use the extracted ID and found layer to match the correct library & master references

                    var library_linked = current_layer_in_artboard.master.getLibrary();
                    var symbolReferences = library_linked.getImportableSymbolReferencesForDocument(document);
                    var _swatchRefs = library_linked.getImportableSwatchReferencesForDocument(document);

                    if (!isGlobalColour) {
                        layerstyleReferences = library_linked.getImportableLayerStyleReferencesForDocument(document);
                    }
                    if (!isGlobalText) {
                        textstyleReferences = library_linked.getImportableTextStyleReferencesForDocument(document);
                    }

                    symbolReferences.forEach(function (ImportableObject) {
                        if (ImportableObject.id == current_layer_in_artboard.symbolId) {
                            var imported_symbol_name = ImportableObject.name.replace(fromTheme, toTheme);
                            var to_Import = symbolReferences.filter(function (element) {
                                return element.name == imported_symbol_name;
                            });
                            var symbolMaster = to_Import[0]['import']();
                            instance = symbolMaster.createNewInstance();

                            //sizes checked to match symbol to existing instance

                            var new_frame = current_layer_in_artboard.frame;
                            var new_x = new_frame.x;
                            var new_y = new_frame.y;
                            var new_width = new_frame.width;
                            var new_height = new_frame.height;
                            var new_rotation = current_layer_in_artboard.transform.rotation;
                            var new_transform = current_layer_in_artboard.transform;
                            var new_instance_name = current_layer_in_artboard.name;

                            instance.name = new_instance_name;
                            instance.transform = new_transform;
                            instance.transform.rotation = new_rotation;
                            instance.frame = { x: new_x, y: new_y, width: new_width, height: new_height };
                            instance.parent = myArtboard;

                            //going through overrides for symbols and texts separately

                            for (var w = 0; w < Object.keys(instance.overrides).length; w++) {

                                //only get the override if the value is differnet from the default one, otherwise let the symbol handle it

                                //looking at overriding text
                                if (current_layer_in_artboard.overrides[w].property == 'stringValue' && !current_layer_in_artboard.overrides[w].isDefault) {
                                    instance.overrides[w].value = current_layer_in_artboard.overrides[w].value;
                                }

                                if (current_layer_in_artboard.overrides[w].property == 'layerStyle' && !current_layer_in_artboard.overrides[w].isDefault) {
                                    layerstyleReferences.forEach(function (element) {
                                        if (element.id == current_layer_in_artboard.overrides[w].value) {
                                            var layer_style_switch_name = element.name.replace(fromTheme, toTheme);
                                            layerstyleReferences.forEach(function (sub_element) {

                                                if (sub_element.name == layer_style_switch_name) {

                                                    var sharedStyle = sub_element['import']();
                                                    instance.overrides[w].value = sharedStyle.id;
                                                }
                                            });
                                        }
                                    });
                                }

                                if (current_layer_in_artboard.overrides[w].property == 'textStyle' && !current_layer_in_artboard.overrides[w].isDefault) {

                                    textstyleReferences.forEach(function (element) {

                                        if (element.id == current_layer_in_artboard.overrides[w].value) {
                                            var text_stlye_override_switch_name = element.name.replace(fromTheme, toTheme);
                                            //look for the switched text style by its name

                                            textstyleReferences.forEach(function (sub_element) {
                                                if (sub_element.name == text_stlye_override_switch_name) {
                                                    var textStyle_to_import = sub_element['import']();
                                                    instance.overrides[w].value = textStyle_to_import.id;
                                                }
                                            });
                                        }
                                    });
                                }

                                if (current_layer_in_artboard.overrides[w].property == 'symbolID' && !current_layer_in_artboard.overrides[w].isDefault) {
                                    var override_symbol_master = document.getSymbolMasterWithID(current_layer_in_artboard.overrides[w].value);
                                    var override_library_linked = override_symbol_master.getLibrary();

                                    var override_symbolReferences = override_library_linked.getImportableSymbolReferencesForDocument(document);

                                    override_symbolReferences.forEach(function (element) {

                                        if (element.id == current_layer_in_artboard.overrides[w].value) {

                                            var symbol_override_switch_name = element.name.replace(fromTheme, toTheme);
                                            //look for the switched symbol by its name

                                            override_symbolReferences.forEach(function (sub_element) {
                                                if (sub_element.name == symbol_override_switch_name) {

                                                    //importing the same symbol into the artboard , deleting it afterward to have it as a reference

                                                    var master_to_delte = sub_element['import']();
                                                    var instance_to_delete = master_to_delte.createNewInstance();

                                                    instance_to_delete.parent = myArtboard;
                                                    instance.overrides[w].value = instance_to_delete.symbolId;
                                                    instance_to_delete.remove();
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }

                //////////TEXT LAYER

                if (current_layer_in_artboard.type == 'Text') {
                    var text = new Text({
                        text: current_layer_in_artboard.text,
                        frame: current_layer_in_artboard.frame,
                        style: current_layer_in_artboard.style,
                        name: current_layer_in_artboard.name,
                        sharedStyleId: current_layer_in_artboard.sharedStyleId,
                        sharedStyle: current_layer_in_artboard.sharedStyle
                    });
                    text.behaviour = current_layer_in_artboard.behaviour;
                    text.parent = myArtboard;

                    if (text.sharedStyle != null) {
                        if (text.sharedStyle.name.includes(fromTheme)) {
                            var switch_text_style = text.sharedStyle.name.replace(fromTheme, toTheme);

                            textstyleReferences.forEach(function (element) {
                                if (element.name == switch_text_style) {
                                    var new_text_style = element['import']();
                                    text.sharedStyle = new_text_style;
                                    text.style.syncWithSharedStyle(new_text_style);
                                }
                            });
                        }
                    } else {
                        //there are no text styles, just local swatches used

                        if (!isGlobalColour) {
                            log("Looking into local swatches for text colours");
                            log("Current text color" + text.style.textColor);
                            docSwatches.forEach(function (element) {
                                if (element.color == text.style.textColor) {
                                    var swatch_switch = element.name;
                                    swatch_switch = swatch_switch.replace(fromTheme, toTheme);
                                    docSwatches.forEach(function (sub_swatch) {
                                        if (sub_swatch.name == swatch_switch) {
                                            text.style.textColor = sub_swatch.referencingColor;
                                        }
                                    });
                                }
                            });
                        }

                        //No text styles, global swatches are used
                        else {
                                var global_swatch_switch_text;
                                log("Looking into global swatches");

                                //importing all swatches into an array to get colours and names

                                swatchRefs.forEach(function (element) {
                                    imported_swatches.push(element['import']());
                                });
                                /*finding which swatch is used currently based on color code */
                                imported_swatches.forEach(function (sub_element) {
                                    if (sub_element.color == text.style.textColor) {
                                        log("Current swatch is" + sub_element.name);

                                        global_swatch_switch_text = sub_element.name;
                                        global_swatch_switch_text = global_swatch_switch_text.replace(fromTheme, toTheme);
                                    }
                                });
                                /*finding out the alternative darl/light swatch, then replacing it for the shape */
                                imported_swatches.forEach(function (sub_sub_element) {
                                    if (sub_sub_element.name == global_swatch_switch_text) {
                                        text.style.textColor = sub_sub_element.referencingColor;
                                    }
                                });
                            }
                    }
                }

                //////////SHAPE LAYER

                if (current_layer_in_artboard.type == 'ShapePath') {
                    var global_swatch_switch;

                    (function () {
                        var shapePath = new ShapePath({
                            shapeType: current_layer_in_artboard.shapeType,
                            sharedStyle: current_layer_in_artboard.sharedStyle,
                            frame: current_layer_in_artboard.frame,
                            points: current_layer_in_artboard.points,
                            transform: current_layer_in_artboard.transform,
                            name: current_layer_in_artboard.name,
                            style: current_layer_in_artboard.style,
                            parent: myArtboard

                        });
                        shapePath.transform.rotation = current_layer_in_artboard.transform.rotation;

                        if (shapePath.sharedStyle != null) {
                            //layerstyleReferences only looks at layerstyles imported from the previous symbol in the document.
                            layerstyleReferences.forEach(function (element) {
                                if (element.id == shapePath.sharedStyleId) {

                                    var switch_layer_style = element.name;
                                    switch_layer_style = switch_layer_style.replace(fromTheme, toTheme);

                                    layerstyleReferences.forEach(function (sub_element) {
                                        if (sub_element.name == switch_layer_style) {
                                            var new_new_layer_style = sub_element['import']();
                                            shapePath.sharedStyleId = new_new_layer_style.id;
                                            shapePath.style.syncWithSharedStyle(new_new_layer_style);
                                        }
                                    });
                                }
                            });
                        } else {
                            //shapes using colour variables/swatches. Check if swatches are in a Colour global library or not

                            if (!isGlobalColour) {
                                log("Looking into local swatches");
                                docSwatches.forEach(function (element) {
                                    if (element.color == shapePath.style.fills[0].color) {
                                        var swatch_switch = element.name;
                                        swatch_switch = swatch_switch.replace(fromTheme, toTheme);
                                        docSwatches.forEach(function (sub_swatch) {
                                            if (sub_swatch.name == swatch_switch) {
                                                shapePath.style.fills[0].color = sub_swatch.referencingColor;
                                            }
                                        });
                                    }
                                });
                            } else {
                                log("Looking into global swatches");

                                //importing all swatches into an array to get colours and names

                                swatchRefs.forEach(function (element) {
                                    imported_swatches.push(element['import']());
                                });
                                /*finding which swatch is used currently based on color code */
                                imported_swatches.forEach(function (sub_element) {
                                    if (sub_element.color == shapePath.style.fills[0].color) {
                                        log("Current swatch is" + sub_element.name);

                                        global_swatch_switch = sub_element.name;
                                        global_swatch_switch = global_swatch_switch.replace(fromTheme, toTheme);
                                    }
                                });
                                /*finding out the alternative darl/light swatch, then replacing it for the shape */
                                imported_swatches.forEach(function (sub_sub_element) {
                                    if (sub_sub_element.name == global_swatch_switch) {
                                        shapePath.style.fills[0].color = sub_sub_element.referencingColor;
                                    }
                                });
                            }
                        }
                    })();
                }
            }
        }
    } else {
        UI.message('Please select one or more artboards');
    }
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("sketch/ui");

/***/ })
/******/ ]);
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')
