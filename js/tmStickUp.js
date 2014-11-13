(function($){
	$.fn.tmStickUp=function(options){ 
		
		var getOptions = {
			corectionValue: 0
		}
		$.extend(getOptions, options); 

		var
			_this = $(this)
		,	_window = $(window)
		,	_document = $(document)
		,	thisOffsetTop = 0
		,	thisOuterHeight = 0
		,	thisMarginTop = 0
		,	documentScroll = 0
		,	pseudoBlock
		,	lastScrollValue = 0
		,	scrollDir = ''
		,	tmpScrolled
		,	gridWidth = 0
		,	tmpTop = 0
		;

		init();
		function init(){
			parentContainer = _this.parent();
			thisOffsetTop = parseInt(_this.offset().top);
			thisMarginTop = parseInt(_this.css("margin-top"));
			thisOuterHeight = parseInt(_this.outerHeight(true));
			gridWidth = parseInt($('.container').width());

			$('<div class="pseudoStickyBlock"></div>').insertAfter(_this);
			pseudoBlock = $('.pseudoStickyBlock');
			pseudoBlock.css({"position":"relative", "display":"block"});

			_this.on("rePosition",
				function(e,d){
					tmpTop = d;
					_document.trigger('scroll');
				}
			)

			addEventsFunction();
		}//end init

		function addEventsFunction(){
			_document.on('scroll', function() {

				tmpScrolled = $(this).scrollTop();
					if (tmpScrolled > lastScrollValue){
						scrollDir = 'down';
					} else {
						scrollDir = 'up';
					}
				lastScrollValue = tmpScrolled;

				documentScroll = parseInt(_document.scrollTop());
				if(thisOffsetTop-thisMarginTop < documentScroll){
					_this.addClass('isStuck');
					_this.css({position:"fixed",top:tmpTop, zIndex:999, left:0, right:0, margin:"0 auto"})
					pseudoBlock.css({"height":thisOuterHeight});
				}else{
					_this.removeClass('isStuck');
					_this.css({position:"relative", top: 0});
					pseudoBlock.css({"height":0});
				}
				
			}).trigger('scroll');
		}
	}//end tmStickUp function
})(jQuery)