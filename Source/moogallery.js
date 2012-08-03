/*
---
description: moogallery creates an interactive gallery of images. Given the images and thumbs paths and some information, the thumbs are loaded sequentially and inserted in a table structure automatically sized according to the size of the container, then events are added in order to manage tips, lightbox widget (and navigation through images) and show images' meta information.

license: MIT-style

authors:
- abidibo <dev@abidibo.net>

requires:
- core/1.3

provides:
- moogallery

...

For documentation, demo and download link please visit http://www.abidibo.net/projects/js/moogallery

*/
var moogallery = new Class({

	Implements: [Options, Events],
	options: {
		show_bullets: true,
		onComplete: function() {}
	},
	/**
	 * @summary Images gallery user interface.
	 * @classdesc <p>The class creates an interactive gallery of images.</p>
	 *            <p>The thumb images are loaded sequentially and inserted in a table structure automatically sized according to the size of the container,
	 *            then events are added in order to manage tips, lightbox widget (and navigation through images) and show images' meta information.</p> 
	 * @constructs moogallery
	 * @param {String|Element} container the gallery container element or its id attribute
	 * @param {Array} images_opt the array of objects containing the images properties. Each object has the following properties:
	 *                           <ul> 
	 *                             <li>thumb: path to the thumb image</li> 
	 *                             <li>img: path to the image</li> 
	 *                             <li>title: image title</li> 
	 *                             <li>description: image description</li> 
	 *                             <li>credits: image credits</li> 
	 *                           </ul> 
	 * @param {Object} options The class options object
	 * @param {Function} [options.onComplete=function(){}] A callback to be called when the rendering of the thumb ended
	 * @param {Boolean} [options.show_bullets=true] Whether or not to show bullets in lightbox widget
	 * @example
	 * 	var mt = new ajs.ui.moogallery('mycontainer', [
	 *          {
	 *              thumb: 'http://my/thumb/path', 
	 *              img: 'http://my/img/path', 
	 *              title: 'image title', 
	 *              description: 'image description'
	 *              credits: 'image credits'
	 *          },
	 *          {
	 *              thumb: 'http://my/thumb/path2', 
	 *              img: 'http://my/img/path2', 
	 *              title: 'image title2', 
	 *              description: 'image description2'
	 *              credits: 'image credits2'
	 *          }
	 *     ]);
	 */
	initialize: function(container, images_opt, options) {
		
		this.container = typeOf(container)=='element' ? container : $(container);
		this.container.setStyle('padding', '0');
		this.images_opt = images_opt;
		this.setOptions(options);

		this.images = [];
		this.thumbs = [];

		this.max_z_index = this.getMaxZindex();

		this.table = new Element('table', {'class': 'moogallery'}).inject(this.container);
		this.tr = new Element('tr').inject(this.table);
		this.tr_width = 0;
		this.container_width = this.container.getCoordinates().width;

		this.addEvent('image_rendered', function(img_opt_index) {
			if(typeOf(this.images_opt[img_opt_index]) != 'null') {
				this.renderImage(this.images_opt[img_opt_index]);
			}
			else {
				this.fireEvent('complete');
			}
		});

		this.renderImage(this.images_opt[0]);
	},
	/**
	 * @summary Gets the maximum z-index in the document.
	 * @return {Number} The maximum z-index
	 */
	getMaxZindex: function() {
		var max_z = 0;
		$$('body *').each(function(el) {
			if(el.getStyle('z-index').toInt()) max_z = Math.max(max_z, el.getStyle('z-index').toInt());
		});

		return max_z;
	},
	/**
	 * @summary Gets the viewport coordinates of the current window (width, height, left offest, top offset, coordinates of the center point).
	 * @return {Object} Viewport coordinates
	 * @example
	 *      // returned object
	 *	{'width':width, 'height':height, 'left':left, 'top':top, 'cX':cX, 'cY':cY}
	 */
	getViewport: function() {
	
		var width, height, left, top, cX, cY;

		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
		if (typeof window.innerWidth != 'undefined') {
			width = window.innerWidth,
			      height = window.innerHeight
		}
		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
		else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0) {
			width = document.documentElement.clientWidth,
			      height = document.documentElement.clientHeight
		}
	
		top = typeof self.pageYOffset != 'undefined' 
			? self.pageYOffset 
			: (document.documentElement && document.documentElement.scrollTop)
			? document.documentElement.scrollTop
			: document.body.clientHeight;

		left = typeof self.pageXOffset != 'undefined' 
			? self.pageXOffset 
			: (document.documentElement && document.documentElement.scrollTop)
			? document.documentElement.scrollLeft
			: document.body.clientWidth;
	
		cX = left + width/2;
		cY = top + height/2;

		return {'width':width, 'height':height, 'left':left, 'top':top, 'cX':cX, 'cY':cY};

	},
	/**
	 * @summary Inserts an image in the table creating a new cell and changing row if necessary
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Object} img_opt the image options object to show
	 * @protected
	 * @return void
	 */		 
	renderImage: function(img_opt) {

		var img = new Image();
		var thumb = new Image();
		this.setTip(thumb, img_opt);
		this.setLightbox(thumb, img_opt);

		img.src = img_opt.img;
		thumb.src = img_opt.thumb;

		this.images.push(img);
		this.thumbs.push(thumb);

		thumb.onload = function() {
			var td = new Element('td');
			td.inject(this.tr);
			thumb.inject(td);
			if(this.table.getCoordinates().width >= this.container_width) {
				td.dispose();
				this.tr = new Element('tr').inject(this.table);
				td.inject(this.tr);
			}
			this.fireEvent('image_rendered', this.images_opt.indexOf(img_opt)+1)
		}.bind(this);
		
	}.protect(),
	/**
	 * @summary Sets a tooltip tied to the thumb and displayed on mouseover
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Element} thumb the thumb image element
	 * @param {Object} img_opt the image options object to show
	 * @protected
	 * @return void
	 */		 
	setTip: function(thumb, img_opt) {

		var tip_container = new Element('div', {'class': 'moogallery_tip'});
		tip_container.set('html', '<b>' + img_opt.title + '</b>');
		thumb.addEvents({
			'mousemove': function(e) {
				tip_container.setStyles({
					position: 'absolute',
					top: (e.page.y + 10) + 'px',
					left: (e.page.x + 10) + 'px',
					'z-index': this.max_z_index++
				});
				tip_container.inject(document.body);
	
			}.bind(this),
			'mouseout': function(e) {
				tip_container.dispose();
			}
		});

	}.protect(),
	/**
	 * @summary Sets the thumb click event to render the lightbox navigation
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Element} thumb the thumb image element
	 * @param {Object} img_opt the image options object to show
	 * @protected
	 * @return void
	 */		 
	setLightbox: function(thumb, img_opt) {

		thumb.addEvent('click', function() {
			this.renderOverlay(this.renderLightbox.bind(this, img_opt));
		}.bind(this));

	}.protect(),
	/**
	 * @summary Renders the overlay and calls the function to execute after
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Function} chain_callback the function to call when overlay opacity animation ends
	 * @protected
	 * @return void
	 */		 
	renderOverlay: function(chain_callback) {

		var docDim = document.getScrollSize();

		this.overlay = new Element('div', {'class': 'moogallery_overlay'});
		this.overlay.setStyles({
			position: 'absolute',
			top: 0,
			left: 0,
			'z-index': this.max_z_index++,
			width: docDim.x,
			height: docDim.y,
			opacity: 0
		});
		this.overlay.inject(document.body);

		var myfx = new Fx.Tween(this.overlay, {'property': 'opacity'});
		myfx.start(0, 0.9).chain(chain_callback);
	},
	/**
	 * @summary Renders the lightbox widget
	 * @description This methos is public since has to be called in a chain process, but it's not necessary to call it directly
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Object} img_opt the image options object to show
	 * @return void
	 */		 
	renderLightbox: function(img_opt) {

		this.lightbox_container = new Element('div.moogallery_lightbox_container').setStyles({
			'visibility': 'hidden',
			'position': 'absolute',
			'overflow': 'hidden',
			'margin': '0' // no margin please!!
		});

		this.lightbox_container.inject(document.body);

		this.lightbox_container.addEvent('click', function(e) {
			if(e.target.get('tag') == 'a') return true;
			var cont_dim = this.lightbox_container.getCoordinates();
			if(e.page.x < cont_dim.left + cont_dim.width/2) {
				if(this.index==0) return false;
				this.changeImage(this.index - 1);
			}
			else {
				if(this.index==this.images.length-1) return false;
				this.changeImage(this.index + 1);
			}
		}.bind(this));

		this.index = this.images_opt.indexOf(img_opt);
		this.renderLightboxContainer();

	},
	/**
	 * @summary Renders the lightbox widget container (image, title, description, credits, navigation)
	 * @description This methos is public since has to be called in a chain process, but it's not necessary to call it directly
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Object} img_opt the image options object to show
	 * @return void
	 */		 
	renderLightboxContainer: function() {

		// image to show
		img_opt = this.images_opt[this.index];
		var img = this.images[this.index];

		var img_info = new Element('div.moogallery_lightbox_info');
		var img_info_title = new Element('p.moogallery_lightbox_info_title').set('html', img_opt.title);

		var img_info_description_text = typeOf(img_opt.description) === 'null' ? '' : img_opt.description;
		var img_info_description = new Element('div.moogallery_lightbox_info_description').set('html', img_info_description_text);

		var img_info_credits_text = typeOf(img_opt.credits) === 'null' ? '' : img_opt.credits;
		var img_info_credits = new Element('p.moogallery_lightbox_info_credits').set('html', img_info_credits_text);

		img_info.adopt(img_info_title, img_info_description, img_info_credits);

		var navigation = this.renderNavigation(img_opt);

		// contents hidden with opacity
		var lightbox_subcontainer = new Element('div').setStyle('opacity', '0').inject(this.lightbox_container);

		lightbox_subcontainer.adopt(img, navigation, img_info);

		// dimensions
		// padding and borders increase the width of the element
		var plus_dim = this.lightbox_container.getStyle('padding').toInt()*2 + this.lightbox_container.getStyle('border-width').toInt() * 2;
		var final_width = img.getCoordinates().width;
		
		// first image opened
		if(this.lightbox_container.getStyle('visibility') == 'hidden') {
			var init_dim = 20;
			var init_real_dim = 20 + plus_dim;
			var vp = this.getViewport();
			this.lightbox_container.setStyles({
				'width': init_dim + 'px',
				'height': init_dim + 'px',
				'top': (vp.cY - init_real_dim/2) + 'px',
				'left': (vp.cX - init_real_dim/2) + 'px',
				'visibility': 'visible',
				'z-index': this.max_z_index++
			});
		}

		var current_width = this.lightbox_container.getCoordinates().width;
		var current_height = this.lightbox_container.getCoordinates().height;
		var lc_animation = new Fx.Morph(this.lightbox_container, {duration: 'short'});
		lc_animation.start({
			'width': final_width, 
			'left': this.lightbox_container.getStyle('left').toInt() - (final_width + plus_dim - current_width)/2 
		}).chain(function() {
			lightbox_subcontainer.adopt(navigation, img_info);
			var final_height = lightbox_subcontainer.getCoordinates().height;
			lc_animation.start({
				'height': final_height,
				'top': this.lightbox_container.getStyle('top').toInt() - (final_height + plus_dim - current_height)/2, 
			}).chain(function() {
				lightbox_subcontainer.fade('in');	
			});
		}.bind(this));
		
		// click outside to close
		this.overlay.addEvent('click', function(e) {
			var event = new DOMEvent(e);
			if(event.target != this.container) {
				this.lightbox_container.dispose();
				var myfx = new Fx.Tween(this.overlay, {'property': 'opacity'});
				myfx.start(0.9, 0).chain(function() {
					this.overlay.dispose();
				}.bind(this));
			}
		}.bind(this));

	},
	/**
	 * @summary Renders the navigation controllers to surf through images in the lightbox widget
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Object} img_opt the image options object to show 
	 * @protected
	 * @return the lightbox navigation controllers
	 */		 
	renderNavigation: function(img_opt) {

		var index = this.images_opt.indexOf(img_opt);
		var nav = new Element('div.moogallery_nav');

		var nav_info_text = (index + 1) + '/' + this.images_opt.length;
		var nav_info = new Element('div.moogallery_nav_info').set('text', nav_info_text);

		nav.adopt(nav_info);

		// bullets
		if(this.options.show_bullets) {
			var nav_table = new Element('table.moogallery_nav_table');
			var tr = new Element('tr').inject(nav_table);
			this.images.each(function(img, i) {
				var td = new Element('td').inject(tr);
				var bullet = new Element('div.moogallery_nav_bullet').inject(td);
				if(i == index) bullet.addClass('bullet_selected');
				else {
					bullet.addEvent('click', function(e) {
						e.stopPropagation();
						this.changeImage(i);
					}.bind(this))
				}
			}.bind(this));

			nav_table.inject(nav);	
		}

		return nav;

	}.protect(),
	/**
	 * @summary Changes the image displayed in the lightbox widget
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Number} index the index of the image to show
	 * @return void
	 */		 
	changeImage: function(index) {
		this.index = index;
		var myfx = new Fx.Tween(this.lightbox_container.getChildren('div')[0], {property: 'opacity', duration: 'short'});
		myfx.start(1, 0).chain(function() {
			this.lightbox_container.empty();
			this.renderLightboxContainer();	
		}.bind(this));
	}

});
