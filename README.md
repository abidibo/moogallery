moogallery
===========

![Screenshot](http://github.com/abidibo/moogallery/raw/master/logo.jpg)

moogallery creates an interactive gallery of images. Given the images and thumbs paths and some information, the thumbs are loaded sequentially and inserted in a table structure automatically sized according to the size of the container, then events are added in order to manage tips, lightbox widget (and navigation through images) and show images' meta information.

How to use
----------

moogallery requires 

- core/1.4.4 

**Include mootools framework and moopopup plugin**

	<script src="path-to-mootools-framework" type="text/javascript"></script>
	<script src="path-to-moogallery-js" type="text/javascript"></script>

**Include moogallery stylesheet**

	<link href="path-to-moogallery-css" type="text/css" rel="stylesheet" />

**Example code**

Javascript:

	window.addEvent('domready', function() {
		var mg_instance = new moogallery('mycontainer', [
			{
				thumb: 'http://my/thumb/path', 
				img: 'http://my/img/path', 
				title: 'image title', 
				description: 'image description'
				credits: 'image credits'
			},
			{
				thumb: 'http://my/thumb/path2', 
				img: 'http://my/img/path2', 
				title: 'image2 title', 
				description: 'image2 description'
				credits: 'image2 credits'
			}
			// ...
		]);
	}

For more demos please visit the moogallery demo page at http://www.abidibo.net/projects/js/moogallery/demo

Screenshots
-----------

![Screenshot](http://github.com/abidibo/moopopup/raw/master/Docs/mg_screenshot1.png)
![Screenshot](http://github.com/abidibo/moopopup/raw/master/Docs/mg_screenshot2.png)

Links
-----------------

The project page: http://www.abidibo.net/projects/js/moogallery  
The documentation page: http://www.abidibo.net/projects/js/moogallery/doc   
The demo page: http://www.abidibo.net/projects/js/moogallery/demo

Please report bugs, errors and advices in the github project page: http://github.com/abidibo/moogallery

