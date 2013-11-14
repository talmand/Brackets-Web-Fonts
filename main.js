/*
* Copyright (c) 2012 Travis Almand. All rights reserved.
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global define, brackets, $, createWebFontsList, chosenFontsList, changeFontExample, addFont, swapFont, removeFont, newImportLine */

define(function (require, exports, module) {
    
    'use strict';

    var CommandManager  = brackets.getModule("command/CommandManager"),
        EditorManager   = brackets.getModule("editor/EditorManager"),
        Menus           = brackets.getModule("command/Menus"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Dialogs         = brackets.getModule("widgets/Dialogs");
    
    // load up modal content, don't forget text! at beginning of file name
    var modal = require("text!modal.html");
    
    // load modal stylesheet
    ExtensionUtils.loadStyleSheet(module, "modal.css");
    
    // globals for this extension
    var webFonts = [], chosenFonts = [], selection, selectedLine, Editor, Document;
    
    function action() {
        
        Editor = EditorManager.getCurrentFullEditor();
        Document = DocumentManager.getCurrentDocument();
        
        selectedLine = Editor.getCursorPos().line;
    
        // see if the modal already exists
        // add our modal window to the body if it does not
        // we do this so the api is hit only once to build initial fonts list
        if ($("#webfonts_modal").length === 0) {
            $("body").append(modal);
            $("#webfonts_modal, #webfonts_modalBackdrop").hide();
        }
        
        // pressing esc key closes modal and backdrop
        $(document).keyup(function (e) {
            if (e.keyCode === 27) {
                $("#webfonts_modal, #webfonts_modalBackdrop").hide();
            }
        });
        
        // clicking close button, x header button, or backdrop hides modal
        $("#webfonts_modalBtn, #webfonts_modalBackdrop, #webfonts_modal a.close").on("mouseup", function (e) {
            e.preventDefault();
            $("#webfonts_modal, #webfonts_modalBackdrop").hide();
        });
        
        $("#webfonts_addBtn").on("mouseup", addFont);
        $("#webfonts_swpBtn").on("mouseup", swapFont);
        $("#webfonts_delBtn").on("mouseup", removeFont);

        // first check if this is a CSS file
        if (Document.extension === "css") {
            // get selection
            selection = Editor.getSelectedText();
            // check selection for googleapis, if pass then create chosen fonts list
            if (selection.match(/googleapis/)) {
                chosenFonts =  selection.replace(/(\@[\w\W]*=)([\w\W]*)(\);)/, "$2").split("|");
                $("#webfonts_modal, #webfonts_modalBackdrop").show();
                // check to see if there's no list
                // if there's a list we don't want to hit Google again
                if ($("#webfonts_example select option").length === 0) {
                    createWebFontsList();
                }
                chosenFontsList();
            } else if (selection.length === 0) {
                Dialogs.showModalDialog("error-dialog", "Error", "It appears nothing is selected. Please try again.");
            } else {
                Dialogs.showModalDialog("error-dialog", "Error", "There was a problem with your selection. Make sure you are selecting a Google Web Fonts import line.");
            }
        } else {
            Dialogs.showModalDialog("error-dialog", "Not a CSS File!", "This doesn't appear to be a CSS file. This extension only works for CSS files.");
        }
        
        // code to make radio buttons deselectable
        // http://jsfiddle.net/talmand/jSy35/
        $("#webfonts_fontList").on("mouseup", "label", function (e) {
            var thisItem = $(this);
            var previous = thisItem.children("input").prop("checked");
            if (previous) {
                setTimeout(function () {
                    thisItem.children("input").prop("checked", false).blur();
                }, 10);
            } else {
                $("#webfonts_swpBtn, #webfonts_delBtn").prop("disabled", false);
            }
        });

    }
    
    // Register the commands and insert in the File menu
    CommandManager.register("Web Fonts...", "webfonts", action);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem("webfonts");
    
    // this creates the drop down list of fonts from Google
    function createWebFontsList() {
        // there's no api key in use so I'm not sure if this is proper
        $.getJSON("https://www.googleapis.com/webfonts/v1/webfonts?callback=?",
            function (data) {
                $.each(data.items, function () {
                    webFonts.push(this.family);
                });
                
                var i, webFontsLength = webFonts.length;
                for (i = 0; i < webFontsLength; i++) {
                    $("#webfonts_example select").append('<option value="' + webFonts[i] + '">' + webFonts[i] + '</option>');
                }
                
                // creating default styles for example box
                $("#webfonts_stylesheet").attr("href", "http://fonts.googleapis.com/css?family=" + webFonts[0]);
                $("#webfonts_example textarea").css("font-family", webFonts[0].replace(/\+/g, " "));
                
                $("#webfonts_example select").on("change", changeFontExample);
                
            });
    }
    
    // this updates the style sheet for the example box to show selected font
    function changeFontExample() {
        var currentExample = $("#webfonts_stylesheet").attr("href").replace(/(http:\/\/fonts\.googleapis\.com\/css\?family=)([\w\W]*)/, "$1" + $("#webfonts_example select").val());
        $("#webfonts_stylesheet").attr("href", currentExample);
        $("#webfonts_example textarea").css("font-family", $("#webfonts_example select").val().replace(/\+/g, " "));
    }
    
    // shows list of currently chosen fonts with a series of radio buttons
    function chosenFontsList() {
        var string = "", i, chosenFontsLength = chosenFonts.length;
        if (chosenFontsLength > 0 && chosenFonts[0] !== "") {
            for (i = 0; i < chosenFontsLength; i++) {
                string += '<label class="webfonts_label"><input type="radio" name="fonts" value="' + chosenFonts[i] + '" /> ' + chosenFonts[i].replace(/\+/g, " ") + '</label>';
            }
            $("#webfonts_fontList").html(string);
        } else {
            $("#webfonts_fontList").html(string);
            chosenFonts = [];
        }
    }
    
    function addFont() {
        var newFont = $("#webfonts_example select").val().replace(/ /g, "+");
        
        // first we make sure newFont isn't already used
        // then add or swap font in array
        // then build new @import statement
        if (chosenFonts.indexOf(newFont) < 0) {
            chosenFonts.push(newFont);
            chosenFontsList();
        }
        
        newImportLine();
    }
    
    function swapFont() {
        var oldFont = $("#webfonts_fontList input:checked").val();
        var newFont = $("#webfonts_example select").val().replace(/ /g, "+");
        
        if (chosenFonts.indexOf(newFont) < 0) {
            chosenFonts[chosenFonts.indexOf(oldFont)] = newFont;
            chosenFontsList();
        
            newImportLine();
            
            // swapping out the whole css for when used in selector properties
            // maybe a batch operation to swap font names in specific ranges would be better?
            var rg = new RegExp(oldFont.replace(/\+/g, " "), "g");
            var oldCss = Document.getText();
            var newCss = oldCss.replace(rg, newFont.replace(/\+/g, " "));
            Document.setText(newCss);
            $("#webfonts_addBtn").text("Add Font");
            $("#webfonts_swpBtn, #webfonts_delBtn").prop("disabled", true);
        }
    }
    
    function removeFont() {
        var delFont = $("#webfonts_fontList input[@name=fonts]:checked").val();
        chosenFonts.splice(chosenFonts.indexOf(delFont), 1);
        chosenFontsList();
        
        newImportLine();
        
        var rg = new RegExp('(\\W)("' + delFont.replace(/\+/g, " ") + '")(\\W)', "g");
        var oldCss = Document.getText();
        var newCss = oldCss.replace(rg, "");
        Document.setText(newCss);
        
        $("#webfonts_addBtn").text("Add Font");
        $("#webfonts_swpBtn, #webfonts_delBtn").prop("disabled", true);
    }
    
    function newImportLine() {
        var newSelection = "@import url(http://fonts.googleapis.com/css?family=";
        var i, chosenFontsLength = chosenFonts.length;
        for (i = 0; i < chosenFontsLength; i++) {
            newSelection += (i !== chosenFontsLength - 1) ? chosenFonts[i] + "|" : chosenFonts[i];
        }
        newSelection += ");";
        // there's no way to set line other than going into _codeMirror
        // this seemed easier than establishing the range which I prob should do
        // in case of minified css
        Editor._codeMirror.setLine(selectedLine, newSelection);
    }
    
});