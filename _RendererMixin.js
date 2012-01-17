define(["dojo/_base/declare", "dojo/_base/html", "dojo/_base/lang", "dojo/dom-class", "dojo/Stateful"],
	 
	function(declare, html, lang, domClass, Stateful){
	
	//	module:
	//		dojox/calendar/_RendererMixin
	//	summary:
	//		dojox.calendar._RendererMixin widget
	//	description:
	//		This class is the base class of calendar renderers.
	
	/*=====
	var Stateful = dojo.Stateful;
	=====*/

	return declare("dojox.calendar._RendererMixin", Stateful, {
		
		//	item: Object
		//		The layout item displayed by this renderer.
		item: null,
		
		//	owner: dojox.calendar._ViewBase
		//		The view that contains this renderer.
		owner: null,
		
		//	edited: Boolean
		//		Indicates that the item displayed by this renderer is in editing mode.
		edited: false,
		
		//	focused: Boolean
		//		Indicates that the item displayed by this renderer is focused.
		focused: false,
		
		//	hovered: Boolean
		//		Indicates that the item displayed by this renderer is hovered.
		hovered: false,
		
		//	selected: Boolean
		//		Indicates that the item displayed by this renderer is selected.
		selected: false,
		
		//	moveEnabled: Boolean
		//		Whether the event displayed by this renderer can be moved.
		moveEnabled: true,
		
		//	resizeEnabled: Boolean
		//		Whether the event displayed by this renderer can be resized.
		resizeEnabled: true,
		
		_orientation: "vertical",
		_displayValue: "block",
		
		visibilityLimits: {
			resizeStartHandle: 50,
			resizeEndHandle: -1,
			summaryLabel: 15,
			startTimeLabel: 45,
			endTimeLabel: 50
		},		
		
		_setSelectedAttr: function(value){
			this._setState("selected", value, "Selected");
		},
		
		_setFocusedAttr: function(value){
			this._setState("focused", value, "Focused");
		},

		_setEditedAttr: function(value){
			this._setState("edited", value, "Edited");
		},
		
		_setHoveredAttr: function(value){
			this._setState("hovered", value, "Hovered");
		},
		
		_setState: function(prop, value, cssClass){
			if(this[prop] != value){
				var tn = this.stateNode || this.domNode;
				domClass[value ? "add" : "remove"](tn, cssClass);
				this._set(prop, value);
			}	
		},
		
		_setItemAttr: function(value){
			if(value == null){
				if(this.item && this.item.cssClass){
					domClass.remove(this.domNode, this.item.cssClass);
				}
				this.item = null;
			}else{
				if(this.item != null){
					if(this.item.cssClass != value.cssClass){
						if(this.item.cssClass){
							domClass.remove(this.domNode, this.item.cssClass);
						}
					}
					this.item = lang.mixin(this.item, value);
					if(value.cssClass){
						domClass.add(this.domNode, value.cssClass);
					}
				}else{
					this.item = value;
					if(value.cssClass){
						domClass.add(this.domNode, value.cssClass);
					}
				}
			}
		},
		
		_setText: function(node, text, allowHTML){
			if(this.owner){
				this.owner._setText(node, text, allowHTML);
			}			
		},
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			var visible;
			var limit = this.visibilityLimits[elt];
			
			switch(elt){
				case "moveHandle":
					visible = this.moveEnabled;
					break;
				case "resizeStartHandle":
					if(this.mobile){
						visible = this.resizeEnabled && !startHidden && this.edited && (limit == -1 || size>limit);
					}else{
						visible = this.resizeEnabled && !startHidden && (limit == -1 || size>limit);
					}
					break;
				case "resizeEndHandle":
					if(this.mobile){
						visible = this.resizeEnabled && !endHidden && this.edited && (limit == -1 || size>limit);
					}else{
						visible = this.resizeEnabled && !endHidden && (limit == -1 || size>limit);
					}
					break;
				case "startTimeLabel":
					if(this.mobile){
						visible = !startHidden && (!this.edited || this.edited && (limit == -1 || size>limit));
					}else{
						visible = !startHidden && (limit == -1 || size>limit);
					}
					break;
				case "endTimeLabel":
					
					visible = this.edited && !endHidden && (limit == -1 || size>limit);
					
					break;
				case "summaryLabel":
					if(this.mobile){
						visible = !this.edited || this.edited && (limit == -1 || size>limit);
					}else{
						visible = limit == -1 || size>limit;
					}
					break;
			}
			
			return visible;
		},
		
		_formatTime: function(rd, d){
			if(this.owner){
				var f = this.owner.get("formatItemTimeFunc");
				if(f != null){
					return this.owner.formatItemTimeFunc(d, rd);
				}
			}
			return rd.dateLocaleModule.format(d, {selector: 'time'});
		},
		
		updateRendering: function (w, h) {
			
			//	summary:
			//		Updates the visual appearance of the renderer according the new values of the properties and the new size of the component.
			//	w: Number?
			//		The width in pixels of the renderer.
			//	h: Number?
			//		The height in pixels of the renderer.
		
			h = h || this.item.h;
			w = w || this.item.w;
			
			if(!h && !w){
				return;
			}
			
			this.item.h = h;
			this.item.w = w;
			
			var size = this._orientation == "vertical" ? h : w;
	
			var rd = this.owner.renderData;

			var startHidden = rd.dateFuncObj.compare(this.item.range[0], this.item.startTime) != 0;
			var endHidden =  rd.dateFuncObj.compare(this.item.range[1], this.item.endTime) != 0;
			
			var visible, limit;
			
			if(this.beforeIcon != null) {
				visible = this._orientation != "horizontal" || this.isLeftToRight() ? startHidden : endHidden;
				html.style(this.beforeIcon, "display", visible ? this._displayValue : "none");
			}

			if(this.afterIcon != null) {
				visible = this._orientation != "horizontal" || this.isLeftToRight() ? endHidden : startHidden;
				html.style(this.afterIcon, "display", visible ? this._displayValue : "none");
			}
			
			if(this.moveHandle){
				visible = this._isElementVisible("moveHandle", startHidden, endHidden, size);
				html.style(this.moveHandle, "display", visible?this._displayValue:"none");				
			}
			
			if(this.resizeStartHandle){
				visible = this._isElementVisible("resizeStartHandle", startHidden, endHidden, size);
				html.style(this.resizeStartHandle, "display", visible?this._displayValue:"none");				
			}
			
			if(this.resizeEndHandle){
				visible = this._isElementVisible("resizeEndHandle", startHidden, endHidden, size);
				html.style(this.resizeEndHandle, "display", visible?this._displayValue:"none");				
			}
			
			if(this.startTimeLabel) {
				visible = this._isElementVisible("startTimeLabel", startHidden, endHidden, size);
				
				html.style(this.startTimeLabel, "display", visible?this._displayValue:"none");
				if(visible) {
					this._setText(this.startTimeLabel, this._formatTime(rd, this.item.startTime));
				}
			}
			
			if(this.endTimeLabel) {
				visible = this._isElementVisible("endTimeLabel", startHidden, endHidden, size);
				html.style(this.endTimeLabel, "display", visible?this._displayValue:"none");
				if(visible) {
					this._setText(this.endTimeLabel, this._formatTime(rd, this.item.endTime));
				}
			}
			
			if(this.summaryLabel) {
				visible = this._isElementVisible("summaryLabel", startHidden, endHidden, size);
				html.style(this.summaryLabel, "display", visible?this._displayValue:"none");
				if(visible){
					this._setText(this.summaryLabel, this.item.summary, true);
				}
			}
		}
	});
});