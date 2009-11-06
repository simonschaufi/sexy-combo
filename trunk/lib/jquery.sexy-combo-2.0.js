/***************************************************************************
 *   Copyright (C) 2009 by Vladimir Kadalashvili                                       *
 *   Kadalashvili.Vladimir@gmail.com                                                    *
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 2 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 *   This program is distributed in the hope that it will be useful,       *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program; if not, write to the                         *
 *   Free Software Foundation, Inc.,                                       *
 *   59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.             *
 ***************************************************************************/


;(function() {
    $.fn.sexyCombo = function(config) {
        return this.each(function() {
	    new $sc(this, config);
	});  
    };
    
    //default config options
    var defaults = {
        //skin name
        skin: "sexy",
	
	//this suffix will be appended to the selectbox's name and will be text input's name
	suffix: "__sexyCombo",
	
	//the same as the previous, but for hidden input
	hiddenSuffix: "__sexyComboHidden",
	
	//initial / default hidden field value.
	//Also applied when user types something that is not in the options list
	initialHiddenValue: "",
	
	//if provided, will be the value of the text input when it has no value and focus
	emptyText: "",
	
	//if true, autofilling will be enabled
	autoFill: false,
	
	//if true, selected option of the selectbox will be the initial value of the combo
	triggerSelected: false,
	
	//function for options filtering
	filterFn: null,
	
	//if true, the options list will be placed above text input
	dropUp: false
    };
    
    //constructor
    //creates initial markup and does some initialization
    $.sexyCombo = function(selectbox, config) {
        if (selectbox.nodeName != "SELECT")
	    return;
	    
	this.config = $.extend({}, defaults, config || {}); 
	
	   
	    
	this.selectbox = $(selectbox);
	this.options = this.selectbox.children().filter("option");
	
	this.wrapper = this.selectbox.wrap("<div>").
	hide().
	parent().
	addClass("combo").
	addClass(this.config.skin); 
		
	this.input = $("<input type='text' />").
	appendTo(this.wrapper).
	attr("autocomplete", "off").
	attr("value", "").
	attr("name", this.selectbox.attr("name") + this.config.suffix);
	
	this.hidden = $("<input type='hidden' />").
	appendTo(this.wrapper).
	attr("autocomplete", "off").
	attr("value", this.config.initialHiddenValue).
	attr("name", this.selectbox.attr("name") + this.config.hiddenSuffix);
	
        this.icon = $("<div />").
	appendTo(this.wrapper).
	addClass("icon"); 
	
	this.listWrapper = $("<div />").
	appendTo(this.wrapper).
	addClass("invisible").
	addClass("list-wrapper"); 
	this.updateDrop();
	
	this.list = $("<ul />").appendTo(this.listWrapper); 
	var self = this;
	this.options.each(function() {
	    var optionText = $.trim($(this).text());
	    $("<li />").
	    appendTo(self.list).
	    text(optionText).
	    addClass("visible");
	    
	});  
	
	this.listItems = this.list.children();

	if ($.browser.opera) {
	    this.wrapper.css({position: "relative", left: "0", top: "0"});
	} 
	
	this.filterFn = ("function" == typeof(this.config.filterFn)) ? this.config.filterFn : this.filterFn;
	
	this.lastKey = null;
	this.overflowCSS = $.browser.opera ? "overflow" : "overflowY";
	
	
	
	this.init();

    };
    
    
    //shortcuts
    $sc = $.sexyCombo;
    $sc.fn = $sc.prototype = {};
    $sc.fn.extend = $sc.extend = $.extend;
    
    $sc.fn.extend({
        //TOC of our plugin
	//initializes all event listeners
	//it would be more correct to call it initEvents
        init: function() {
	    var self = this;
	    
	    this.icon.bind("click", function() {
	       self.iconClick();
	    }); 
	    
	    this.listItems.bind("mouseover", function(e) {
	        self.highlight(e.target);
	    });
	    
	    this.listItems.bind("click", function(e) {
	        self.listItemClick($(e.target));
	    });
	    
	    this.input.bind("keyup", function(e) {
	        self.keyUp(e);
	    });
	    
	    this.input.bind("keypress", function(e) {
	        if ($sc.KEY.RETURN == e.keyCode)
	            e.preventDefault();
		    
		if ($sc.KEY.TAB == e.keyCode)
		    self.hideList();    
	    });
	    
	    $(document).bind("click", function(e) {
	        if ((self.icon.get(0) == e.target) || (self.input.get(0) == e.target))
		    return;
		    
		self.hideList();    
	    });
	    
	    this.triggerSelected();
	    this.applyEmptyText();
	},
	
	//icon click event listener
	iconClick: function() {
	    if (this.listVisible()) 
	        this.hideList();
	    else 
	        this.showList();
		
            this.input.focus();
	},
	
	//returns true when dropdown list is visible
	listVisible: function() {
	    return this.listWrapper.hasClass("visible");
	},
	
	//shows dropdown list
	showList: function() {
	    if (!this.listItems.filter(".visible").length)
	        return;
		
	    this.listWrapper.removeClass("invisible").
	    addClass("visible");
	    this.setOverflow();
	    this.setListHeight();
	    this.highlightFirst();
	    this.listWrapper.scrollTop(0);
	},
	
	//hides dropdown list
	hideList: function() {
	    this.listWrapper.removeClass("visible").
	    addClass("invisible");
	},
	
	//returns sum of all visible items height
	getListItemsHeight: function() {
	    return this.listItems.height() * this.liLen();
	},
	
	//changes list wrapper's overflow from hidden to scroll and vice versa (depending on list items height))
	setOverflow: function() {
	    if (this.getListItemsHeight() > this.getListMaxHeight())
	        this.listWrapper.css(this.overflowCSS, "scroll");
	    else
	        this.listWrapper.css(this.overflowCSS, "hidden");	
	},
	
	//highlights active item of the dropdown list
	highlight: function(activeItem) {
	    if (($sc.KEY.DOWN == this.lastKey) || ($sc.KEY.UP == this.lastKey))
	        return;
		
	    this.listItems.removeClass("active");   
	    $(activeItem).addClass("active");
	},
	
	//sets text and hidden inputs value
	setComboValue: function(val) {
	    val = $.trim(val);    
	    this.input.val(val); 
	    this.setHiddenValue(val);
	    this.filter();
	    this.hideList();
	    this.input.removeClass("empty");
	},
	
	//sets hidden inputs value
	//takes text input's value as a param
	setHiddenValue: function(val) {
	    var set = false;
	    val = $.trim(val);
	    
	    for (var i = 0, len = this.options.length; i < len; ++i) {
	        if (val == this.options.eq(i).text()) {
		    this.hidden.val(this.options.eq(i).val());
		    set = true;
		    break;
		}   
	    }
	    
	    if (!set) {
	        this.hidden.val(this.config.initialHiddenValue);
	    }
	},
	
	listItemClick: function(item) {
	    this.setComboValue(item.text());
	    this.inputFocus();
	},
	
	//adds / removes items to / from the dropdown list depending on combo's current value
	filter: function() {
	    var comboValue = this.input.val();
	    var self = this;

	    this.listItems.each(function() {
	        var $this = $(this);
	        var itemValue = $this.text();
		if (self.filterFn.call(this, comboValue, itemValue)) {
		    $this.removeClass("invisible").
		    addClass("visible");
		} else {
		    $this.removeClass("visible").
		    addClass("invisible");
		}
	    });
	    

	    
	    this.setOverflow();
	    this.setListHeight();
	},
	
	//default dropdown list filtering function
	filterFn: function(comboValue, itemValue) {
	    return itemValue.toLowerCase().search(comboValue.toLowerCase()) == 0;
	},
	
	//just returns integer value of list wrapper's max-height property
	getListMaxHeight: function() {
	    return parseInt(this.listWrapper.css("maxHeight"), 10);
	},
	
	//corrects list wrapper's height depending on list items height
	setListHeight: function() {
	    var liHeight = this.getListItemsHeight();
	    var maxHeight = this.getListMaxHeight();
	    var listHeight = this.listWrapper.height();
	    if (liHeight < listHeight) {
	        this.listWrapper.height(liHeight);   
	    }
	    else if (liHeight > listHeight) {
	        this.listWrapper.height(Math.min(maxHeight, liHeight));
	    }
	},
	
	//returns active (hovered) element of the dropdown list
	getActive: function() {
	    return this.listItems.filter(".active");
	},
	
	keyUp: function(e) {
	    this.lastKey = e.keyCode;
	    var k = $sc.KEY;
	    switch (e.keyCode) {
	        case k.RETURN:
		    this.setComboValue(this.getActive().text());
		    this.input.blur();
		break;
		case k.DOWN:
		    this.highlightNext();
		break;
		case k.UP:
		    this.highlightPrev();
		break;
		case k.ESC:
		    this.hideList();
		break;
		default:
		    this.inputChanged();
		break;
	    }
	    
	    
	},
	
	//returns number of currently visible list items
	liLen: function() {
	    return this.listItems.filter(".visible").length;
	},
	
	//triggered when the user changes combo value by typing
	inputChanged: function() {
	    this.filter();

	    if (this.liLen()) {
	        this.showList();
		this.setOverflow();
		this.setListHeight();
	    } else {
	        this.hideList();
	    }
	    
	    this.setHiddenValue(this.input.val());
	    
	},
	
	//highlights first item of the dropdown list
	highlightFirst: function() {
	    this.listItems.removeClass("active").filter(".visible:eq(0)").addClass("active");
	    this.autoFill();
	},
	
	//highlights item of the dropdown list next to the currently active item
	highlightNext: function() {
	    var $next = this.getActive().next();
	    
	    while ($next.hasClass("invisible") && $next.length) {
	        $next = $next.next();
	    }
	    
	    if ($next.length) {
	        this.listItems.removeClass("active");
		$next.addClass("active");
		this.scrollDown();
	    }
	},
	
	//scrolls list wrapper down when needed
	scrollDown: function() {
	    if ("scroll" != this.listWrapper.css(this.overflowCSS))
	        return;
		
            var beforeActive = this.getActiveIndex() + 1;
			if ($.browser.opera)
			    ++beforeActive;
	    
	    var minScroll = this.listItems.height() * beforeActive - this.listWrapper.height();
        
		if ($.browser.msie)
            minScroll += beforeActive;
	    
	    if (this.listWrapper.scrollTop() < minScroll)
	        this.listWrapper.scrollTop(minScroll);
	},
	
	
	//highlights list item before currently active item
	highlightPrev: function() {
	    var $prev = this.getActive().prev();
	    
	    while ($prev.length && $prev.hasClass("invisible"))
	        $prev = $prev.prev();
		
            if ($prev.length) {
	        this.getActive().removeClass("active");
		$prev.addClass("active");
		this.scrollUp();
	    }
	},
	
	//returns index of currently active list item
	getActiveIndex: function() {
	    return $.inArray(this.getActive().get(0), this.listItems.filter(".visible").get());
	},
	
	
	//scrolls list wrapper up when needed
	scrollUp: function() {
	    
	    if ("scroll" != this.listWrapper.css(this.overflowCSS))
	        return;
		
	    var maxScroll = this.getActiveIndex() * this.listItems.height();
	    
	    if (this.listWrapper.scrollTop() > maxScroll) {
	        this.listWrapper.scrollTop(maxScroll);
	    }     
	},
	
	//emptyText stuff
	applyEmptyText: function() {
	    if (!this.config.emptyText.length)
	        return;
		
	    var self = this;	
	    this.input.bind("focus", function() {
                self.inputFocus();
	    }).
	    bind("blur", function() {
                self.inputBlur();
	    });	
	    
	    if ("" == this.input.val()) {
	        this.input.addClass("empty").val(this.config.emptyText);
	    }
	},
	
	inputFocus: function() {
	    if (this.input.hasClass("empty")) {
		this.input.removeClass("empty").
		val("");
            }	
	},
	
	inputBlur: function() {
	    if ("" == this.input.val()) {
		this.input.addClass("empty").
		val(this.config.emptyText);
	    }
	    
	},
	
	//triggerSelected stuff
	triggerSelected: function() {
	    if (!this.config.triggerSelected)
	        return;
		
	    var self = this;	
	    this.options.each(function() {
	        if ($(this).attr("selected")) {
		    self.setComboValue($(this).text());    
		}
	    });	
		
	},
	
	//autofill stuff
	autoFill: function() {
	    if (!this.config.autoFill || ($sc.KEY.BACKSPACE == this.lastKey))
	        return;
		
	    var curVal = this.input.val();
	    var newVal = this.getActive().text();
	    this.input.val(newVal);
	    this.selection(this.input.get(0), curVal.length, newVal.length);
	    	
	},
	
	//provides selection for autofilling
	//borrowed from jCarousel
	selection: function(field, start, end) {
	    if( field.createTextRange ){
		var selRange = field.createTextRange();
		selRange.collapse(true);
		selRange.moveStart("character", start);
		selRange.moveEnd("character", end);
		selRange.select();
	    } else if( field.setSelectionRange ){
		field.setSelectionRange(start, end);
	    } else {
		if( field.selectionStart ){
			field.selectionStart = start;
			field.selectionEnd = end;
		}
	    }
	   // field.focus();	
	},
	
	
	//for internal use
	updateDrop: function() {
	    if (this.config.dropUp)
	        this.listWrapper.addClass("list-wrapper-up");
	    else
	        this.listWrapper.removeClass("list-wrapper-up");	
	},
	
	//updates dropUp config option
	setDropUp: function(drop) {
            this.config.dropUp = drop;    
	}
    });
    
    $sc.extend({
        //key codes
	//from jCarousel
        KEY: {
	    UP: 38,
	    DOWN: 40,
	    DEL: 46,
	    TAB: 9,
	    RETURN: 13,
	    ESC: 27,
	    COMMA: 188,
	    PAGEUP: 33,
	    PAGEDOWN: 34,
	    BACKSPACE: 8	
	},
	
	//for debugging
	log: function(msg) {
	    var $log = $("#log");
	    $log.html($log.html() + msg + "<br />");
	},
	
        createSelectbox: function(config) {
	    var $selectbox = $("<select />").
	    appendTo(config.container).
	    attr({name: config.name, id: config.id, size: "1"});
	    
	    var data = config.data;
	    
	    for (var i = 0, len = data.length; i < len; ++i) {
	        $("<option />").appendTo($selectbox).
		attr("value", data[i].value).
		text(data[i].text);
	    }
	    
	    return $selectbox.get(0);
	},
	
	create: function(config) {
            var defaults = {
	        name: "",
		id: "",
		data: [],
		container: $(document)
	    };
	    config = $.extend({}, defaults, config || {});
	    
	    config.container = $(config.container);
	    
            var selectbox = $sc.createSelectbox(config);
	    return new $sc(selectbox, config);
	    
	}
    });
})(jQuery); 
