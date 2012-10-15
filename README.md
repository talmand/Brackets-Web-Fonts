Brackets Google Web Fonts extension
===
Proof of concept for buidling a Google Web Fonts link string from within the editor. Very hacky and quickly assembled.

To install this extension:
In Brackets, under "Help" select "Show Extensions Folder". Place extension folder with files inside the "user" folder.
Older versions of Brackets this choice might be under "Debug" or might not exist at all.


Usage
=====
First this requires an @import statement pointing to Google's Web Fonts, like this:

@import url(http://fonts.googleapis.com/css?family=Antic|Abril+Fatface|Aclonica);

You can either go to Google Web Fonts (http://www.google.com/webfonts) to create one or just place this at the top of your CSS file:

@import url(http://fonts.googleapis.com/css?family=);

Fully select this @import line, select "Web Fonts..." under "Edit".

A modal will appear with a basic interface. There's a select dropdown with a list of fonts with a "Add Font" button underneath. There's a textarea using the selected font in the dropdown and the text can be changed to whatever you want. If the @import line had fonts then you'll see a list of those fonts with radio buttons. Finally there's a "Swap Fonts" and a "Delete Font" button.

You can select a font from the dropdown and click "Add Font" button which will add that font to the radio button list.

If you select a font's radio button the "Swap Fonts" button will swap that font with the font selected in the dropdown. "Delete Font" button will remove the font from the list.

As these fonts are added, swapped, or deleted the @import line is altered as necessary. At the same time if the font families in the list exist within the same CSS file then those are removed if "Delete Font" is clicked or swapped with "Swap Fonts" button. If you have the related HTML file open in the Live Development Chrome window then you should see these changes as they happen.

There is a test.html and test.css file included with extension to play with.


Known issues
=====
If a font family doesn't have a "regular" variant then it will fail to load, implementing variants will likely fix this.
Interface is ugly.
No API key, is API key necessary for just getting the latest list of fonts and displaying them in the page?


Things to do
=====
Adobe has implemented a similar feature, Adobe Edge Web Fonts: http://html.adobe.com/edge/webfonts/
This is implemented in Adobe Edge Code, which is based off of Brackets.
May not bother continuing with this extension due to this.

Nicer interface.
Implement support for variants
Implement support for subsets