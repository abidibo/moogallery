moogallery
===========

![Screenshot](http://github.com/abidibo/moogallery/raw/master/logo.jpg)

moogallery creates an interactive gallery of images, videos and audios. Given the thumbs paths and some information, the thumbs are loaded sequentially and inserted in a table structure automatically sized according to the size of the container, then events are added in order to manage tips, lightbox widget (and navigation through media) and show media' meta information. Videos can be hosted on youtube or vimeo, audio files are inserted following html5 specifications. If used with cpoyer's mootools-mobile (https://github.com/cpojer/mootools-mobile) supports swipe gestures on mobile (android, ios) to change media in the lightbox view.

How to use
----------

moogallery requires 

- core/1.4.4 

**Include mootools framework and moopopup plugin (include also mootools-mobile to add support for swipe events)**

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
				youtube: 'youtube_video_code',
				video_width: 640,
				video_height: 400, 
				title: 'youtube video title', 
				description: 'youtube video description'
				credits: 'youtube video credits'
			},
			{
				thumb: 'http://my/thumb/path3', 
				vimeo: 'vimeo_video_code',
				video_width: 640,
				video_height: 400, 
				title: 'vimeo video title', 
				description: 'vimeo video description'
				credits: 'vimeo video credits'
			},
			{
				thumb: 'http://my/thumb/path4', 
				mpeg: 'path/to/mpeg/file',
				ogg: 'path/to/ogg/file',
				title: 'audio title', 
				description: 'audio description'
				credits: 'audio credits'
			}
			// ...
		]);
	}

For more demos please visit the moogallery demo page at http://www.abidibo.net/projects/js/moogallery/demo

Screenshots
-----------

![Screenshot](http://github.com/abidibo/moogallery/raw/master/Docs/mg_screenshot1.png)
![Screenshot](http://github.com/abidibo/moogallery/raw/master/Docs/mg_screenshot2.png)

Links
-----------------

The project page: http://www.abidibo.net/projects/js/moogallery  
The documentation page: http://www.abidibo.net/projects/js/moogallery/doc   
The demo page: http://www.abidibo.net/projects/js/moogallery/demo

Please report bugs, errors and advices in the github project page: http://github.com/abidibo/moogallery

