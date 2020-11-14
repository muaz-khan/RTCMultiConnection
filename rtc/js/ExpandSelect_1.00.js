function ExpandSelect(select, maxOptionsVisible)
{
	//
	// ExpandSelect 1.00
	// Copyright (c) Czarek Tomczak. All rights reserved.
	//
	// License:
	//	New BSD License (free for any use, read more at http://www.opensource.org/licenses/bsd-license.php)
	//
	// Project's website:
	//	http://code.google.com/p/expandselect/
	//

	if (typeof maxOptionsVisible == "undefined") {
		maxOptionsVisible = 20;
	}
	if (typeof select == "string") {
		select = document.getElementById(select);
	}
	if (typeof window["ExpandSelect_tempID"] == "undefined") {
		window["ExpandSelect_tempID"] = 0;
	}
	window["ExpandSelect_tempID"]++;

	var rects = select.getClientRects();

	// ie: cannot populate options using innerHTML.
	function PopulateOptions(select, select2)
	{
		select2.options.length = 0; // clear out existing items
		for (var i = 0; i < select.options.length; i++) {
			var d = select.options[i];
			select2.options.add(new Option(d.text, i))
		}
	}

	var select2 = document.createElement("SELECT");
	//select2.innerHTML = select.innerHTML;
	PopulateOptions(select, select2);
	select2.style.cssText = "visibility: hidden;";
	if (select.style.width) {
		select2.style.width = select.style.width;
	}
	if (select.style.height) {
		select2.style.height = select.style.height;
	}
	select2.id = "ExpandSelect_" + window.ExpandSelect_tempID;

	select.parentNode.insertBefore(select2, select.nextSibling);
	select = select.parentNode.removeChild(select);

	if (select.length > maxOptionsVisible) {
		select.size = maxOptionsVisible;
	} else {
		select.size = select.length;
	}

	if ("pageXOffset" in window) {
		var scrollLeft = window.pageXOffset;
		var scrollTop = window.pageYOffset;
	} else {
		// ie <= 8
		// Function taken from here: http://help.dottoro.com/ljafodvj.php
		function GetZoomFactor()
		{
			var factor = 1;
			if (document.body.getBoundingClientRect) {
				var rect = document.body.getBoundingClientRect ();
				var physicalW = rect.right - rect.left;
				var logicalW = document.body.offsetWidth;
				factor = Math.round ((physicalW / logicalW) * 100) / 100;
			}
			return factor;
		}
		var zoomFactor = GetZoomFactor();
		var scrollLeft = Math.round(document.documentElement.scrollLeft / zoomFactor);
		var scrollTop = Math.round(document.documentElement.scrollTop / zoomFactor);
	}

	select.style.position = "absolute";
	select.style.left = (rects[0].left + scrollLeft) + "px";
	select.style.top = (rects[0].top + scrollTop) + "px";
	select.style.zIndex = "1000000";

	var keydownFunc = function(e){
		e = e ? e : window.event;
		// Need to implement hiding select on "Escape" and "Enter".
		if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
			return 1;
		}
		// Escape, Enter.
		if (27 == e.keyCode || 13 == e.keyCode) {
			select.blur();
			return 0;
		}
		return 1;
	};

	if (select.addEventListener) {
		select.addEventListener("keydown", keydownFunc, false);
	} else {
		select.attachEvent("onkeydown", keydownFunc);
	}

	var tempID = window["ExpandSelect_tempID"];

	var clickFunc = function(e){
		e = e ? e : window.event;
		if (e.target) {
			if (e.target.tagName == "OPTION") {
				select.blur();
			}
		} else {
			// IE case.
			if (e.srcElement.tagName == "SELECT" || e.srcElement.tagName == "OPTION") {
				select.blur();
			}
		}
	};

	if (select.addEventListener) {
		select.addEventListener("click", clickFunc, false);
	} else {
		select.attachEvent("onclick", clickFunc);
	}

	var blurFunc = function(){
		if (select.removeEventListener) {
			select.removeEventListener("blur", arguments.callee, false);
			select.removeEventListener("click", clickFunc, false);
			select.removeEventListener("keydown", keydownFunc, false);
		} else {
			select.detachEvent("onblur", arguments.callee);
			select.detachEvent("onclick", clickFunc);
			select.detachEvent("onkeydown", keydownFunc);
		}
		select.size = 1;
		select.style.position = "static";
		select = select.parentNode.removeChild(select);
		var select2 = document.getElementById("ExpandSelect_"+tempID);
		select2.parentNode.insertBefore(select, select2);
		select2.parentNode.removeChild(select2);

	};

	if (select.addEventListener) {
		select.addEventListener("blur", blurFunc, false);
	} else {
		select.attachEvent("onblur", blurFunc);
	}

	document.body.appendChild(select);
	select.focus();
}