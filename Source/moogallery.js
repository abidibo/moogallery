/*
---
description: moogallery creates an interactive gallery of images, videos and audios. Given the thumbs paths and some information, the thumbs are loaded sequentially and inserted in a table structure automatically sized according to the size of the container, then events are added in order to manage tips, lightbox widget (and navigation through media) and show media's meta information. Videos can be hosted on youtube or vimeo, audio files are inserted following html5 specifications. If used with cpoyer's mootools-mobile (https://github.com/cpojer/mootools-mobile) supports swipe gestures on mobile (android, ios) to change media in the lightbox view (activate the support_mobile option).

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
		support_mobile: false,
		onComplete: function() {}
	},
	/**
	 * @summary Media gallery user interface.
	 * @classdesc <p>The class creates an interactive gallery of media.</p>
	 *            <p>The thumb images are loaded sequentially and inserted in a table structure automatically sized according to the size of the container,
	 *            then events are added in order to manage tips, lightbox widget (and navigation through media) and show media's meta information.</p> 
	 * @constructs moogallery
	 * @param {String|Element} container the gallery container element or its id attribute
	 * @param {Array} items_opt the array of objects containing the media properties. Each object has the following properties:
	 *                           <ul> 
	 *                             <li>thumb: path to the thumb image</li> 
	 *                             <li>img: path to the image</li> 
	 *                             <li>youtube: code of the youtube video</li> 
	 *                             <li>vimeo: code of the vimeo video</li> 
	 *                             <li>video_width: video width</li> 
	 *                             <li>video_height: video height</li> 
	 *                             <li>mpeg: path to mpeg file</li> 
	 *                             <li>ogg: path to ogg file</li> 
	 *                             <li>title: media title</li> 
	 *                             <li>description: media description</li> 
	 *                             <li>credits: media credits</li> 
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
	initialize: function(container, items_opt, options) {
		
		this.container = typeOf(container)=='element' ? container : $(container);
		this.container.setStyle('padding', '0');
		this.items_opt = items_opt;
		this.setOptions(options);

		this.mobile = this.options.support_mobile && ( Browser.Platform.ios || Browser.Platform.android) ? true : false;

		this.video_base_link = {
			youtube: 'http://www.youtube.com/embed/',
			vimeo: 'http://player.vimeo.com/video/'
		}

		this.items = [];
		this.thumbs = [];

		this.max_z_index = this.getMaxZindex();

		this.table = new Element('table', {'class': 'moogallery'}).inject(this.container);
		this.tr = new Element('tr').inject(this.table);
    this.first_row = true;
    this.cols = 0;
    this.actual_col = 1;
		this.tr_width = 0;
		this.container_width = this.container.getCoordinates().width;

		this.addEvent('item_rendered', function(item_opt_index) {
			if(typeOf(this.items_opt[item_opt_index]) != 'null') {
				this.renderItem(this.items_opt[item_opt_index]);
			}
			else {
				this.fireEvent('complete');
			}
		});

		this.renderItem(this.items_opt[0]);
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
	 * @param {Object} item_opt the image options object to show
	 * @protected
	 * @return void
	 */		 
	renderItem: function(item_opt) {

		var thumb = new Element('img');

		thumb.onload = function() {
			var td = new Element('td');
			thumb.inject(td);
      if(!this.first_row) {
        if(this.actual_col >= this.cols) {
          this.tr = new Element('tr').inject(this.table);
          this.actual_col = 1;
        }
        else {
          this.actual_col++;
        }
        td.inject(this.tr);
      }
      else {
			  td.inject(this.tr);
        if(this.table.getCoordinates().width >= this.container_width) {
          td.dispose();
          this.tr = new Element('tr').inject(this.table);
          td.inject(this.tr);
          this.first_row = false;
        }
        else {
          this.cols++;
        }
      }
      this.fireEvent('item_rendered', this.items_opt.indexOf(item_opt)+1)
		}.bind(this);

		thumb.src = item_opt.thumb;

		this.setTip(thumb, item_opt);
		this.setLightbox(thumb, item_opt);

		this.thumbs.push(thumb);

		if(typeOf(item_opt.img) != 'null') {
			var item = new Element('img');
			item.src = item_opt.img;
		}
		else if(typeOf(item_opt.youtube) != 'null' || typeOf(item_opt.vimeo) != 'null') {
			var site = typeOf(item_opt.youtube) != 'null' ? 'youtube' : 'vimeo';
			var item = new Element('iframe');
			item.src = this.video_base_link[site] + item_opt[site];
			item.setProperty('frameborder', '0');
			item.setProperty('allowfullscreen', '');
			item.setProperty('width', item_opt.video_width);
			item.setProperty('height', item_opt.video_height);
		}
		else if(typeOf(item_opt.mpeg) != 'null' || typeOf(item_opt.ogg) != null) {
			var item = new Element('audio', {text: "Your browser does not support the audio element"}).addEvent('click', function(e) { e.stopPropagation(); });
			item.setProperty('controls', 'controls');
			['mpeg', 'ogg'].each(function(type) {
				if(typeOf(item_opt[type]) != 'null') {
					var src = new Element('source', {src: item_opt[type], type: 'audio/' + type});
					src.inject(item, 'top');
				}
			})
		}

		this.items.push(item);
		
	}.protect(),
	/**
	 * @summary Sets a tooltip tied to the thumb and displayed on mouseover
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Element} thumb the thumb image element
	 * @param {Object} item_opt the image options object to show
	 * @protected
	 * @return void
	 */		 
	setTip: function(thumb, item_opt) {

		var tip_container = new Element('div', {'class': 'moogallery_tip'});
		tip_container.set('html', '<b>' + item_opt.title + '</b>');
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
	 * @param {Object} item_opt the image options object to show
	 * @protected
	 * @return void
	 */		 
	setLightbox: function(thumb, item_opt) {

		thumb.addEvent('click', function() {
			this.renderOverlay(this.renderLightbox.bind(this, item_opt));
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
	 * @param {Object} item_opt the image options object to show
	 * @return void
	 */		 
	renderLightbox: function(item_opt) {

		this.lightbox_container = new Element('div.moogallery_lightbox_container').setStyles({
			'visibility': 'hidden',
			'position': 'absolute',
			'overflow': 'hidden',
			'margin': '0' // no margin please!!
		});

		this.lightbox_container.inject(document.body);

		// click event
		this.lightbox_container.addEvent('click', function(e) {
			if(e.target.get('tag') == 'a') return true;
			var cont_dim = this.lightbox_container.getCoordinates();
			if(e.page.x < cont_dim.left + cont_dim.width/2) {
				if(this.index==0) return false;
				this.changeItem(this.index - 1);
			}
			else {
				if(this.index==this.items.length-1) return false;
				this.changeItem(this.index + 1);
			}
		}.bind(this));	

		// mouseover shows next prev arrows
		this.lightbox_container.addEvent('mouseover', function(e) {
			var cont_dim = this.lightbox_container.getCoordinates();
			if(e.page.x < cont_dim.left + cont_dim.width/2) {
				if(this.arrow_next.getStyle('opacity') != '0') {
					this.arrow_next.fade('hide');
				}
				if(this.index==0) return false;
				this.arrow_prev.fade('in');
			}
			else {
				if(this.arrow_prev.getStyle('opacity') != '0') {
					this.arrow_prev.fade('hide');
				}
				if(this.index==this.items.length-1) return false;
				this.arrow_next.fade('in');
			}
		}.bind(this));

		this.lightbox_container.addEvent('mouseleave', function(e) {
			this.arrow_next.fade('hide');
			this.arrow_prev.fade('hide');
		}.bind(this));

		this.index = this.items_opt.indexOf(item_opt);
		this.renderLightboxContainer();

		// swipe event
		if(this.mobile && Browser.Features.Touch) {
			document.body.addEvent('swipe', function(e) {
				Element.disableCustomEvents();
				(function(){
					Element.enableCustomEvents();
				}).delay(1000);
				if(e.direction == 'left') {
					if(this.index==this.items.length-1) return false;
					this.changeItem(this.index + 1);
				}
				else {
					if(this.index==0) return false;
					this.changeItem(this.index - 1);
				}
			}.bind(this));
		}

	},
	/**
	 * @summary Renders the lightbox widget container (image, title, description, credits, navigation)
	 * @description This methos is public since has to be called in a chain process, but it's not necessary to call it directly
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Object} item_opt the image options object to show
	 * @return void
	 */		 
	renderLightboxContainer: function() {

		// image to show
		item_opt = this.items_opt[this.index];
		var item = this.items[this.index];

		var item_info = new Element('div.moogallery_lightbox_info');
		var item_info_title = new Element('p.moogallery_lightbox_info_title').set('html', item_opt.title);

		var item_info_description_text = typeOf(item_opt.description) === 'null' ? '' : item_opt.description;
		var item_info_description = new Element('div.moogallery_lightbox_info_description').set('html', item_info_description_text);

		var item_info_credits_text = typeOf(item_opt.credits) === 'null' ? '' : item_opt.credits;
		var item_info_credits = new Element('p.moogallery_lightbox_info_credits').set('html', item_info_credits_text);

		item_info.adopt(item_info_title, item_info_description, item_info_credits);

		var navigation = this.renderNavigation(item_opt);

		// contents hidden with opacity
		var lightbox_subcontainer = new Element('div').setStyle('opacity', '0').inject(this.lightbox_container);

		lightbox_subcontainer.adopt(item, navigation, item_info);

		// dimensions
		// padding and borders increase the width of the element
		var plus_dim = this.lightbox_container.getStyle('padding').toInt()*2 + this.lightbox_container.getStyle('border-width').toInt() * 2;
		var final_width = item.getCoordinates().width;
		
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
			lightbox_subcontainer.adopt(navigation, item_info);
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
				if(this.mobile && Browser.Features.Touch) {
					document.body.removeEvent('swipe');
				}
			}
		}.bind(this));

	},
	/**
	 * @summary Renders the navigation controllers to surf through images in the lightbox widget
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Object} item_opt the image options object to show 
	 * @protected
	 * @return the lightbox navigation controllers
	 */		 
	renderNavigation: function(item_opt) {

		var index = this.items_opt.indexOf(item_opt);
		var nav = new Element('div.moogallery_nav');

		this.arrow_next = new Element('div', {'class': 'arrow arrow_next'}).setStyle('opacity', '0');
		this.arrow_prev = new Element('div', {'class': 'arrow arrow_prev'}).setStyle('opacity', '0');
		var arrows = new Element('div.nav_arrows').adopt(this.arrow_next, this.arrow_prev);

		var nav_info_text = (index + 1) + '/' + this.items_opt.length;
		var nav_info = new Element('div.moogallery_nav_info').set('text', nav_info_text);

		nav.grab(arrows);

		// bullets
		if(this.options.show_bullets) {
			var nav_table = new Element('table.moogallery_nav_table');
			var tr = new Element('tr').inject(nav_table);
			this.items.each(function(item, i) {
				var td = new Element('td').inject(tr);
				var bullet = new Element('div.moogallery_nav_bullet').inject(td);
				if(i == index) bullet.addClass('bullet_selected');
				else {
					bullet.addEvent('click', function(e) {
						e.stopPropagation();
						this.changeItem(i);
					}.bind(this))
				}
			}.bind(this));

			nav_table.inject(nav);	
		}

		nav.grab(nav_info);

		return nav;

	}.protect(),
	/**
	 * @summary Changes the image displayed in the lightbox widget
	 * @memberof ajs.ui.moogallery.prototype
	 * @method
	 * @param {Number} index the index of the image to show
	 * @return void
	 */		 
	changeItem: function(index) {
		this.index = index;
		var myfx = new Fx.Tween(this.lightbox_container.getChildren('div')[0], {property: 'opacity', duration: 'short'});
		myfx.start(1, 0).chain(function() {
			this.lightbox_container.empty();
			this.renderLightboxContainer();	
		}.bind(this));
	}

});
