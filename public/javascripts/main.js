var PolicyEditor = function (options){

	var activeRuleNumber = 0;
	var activeRuleOptions = "";

	var init = function (){
		$(".options").hide();
		addHandlers();
		FastClick.attach(document.body);
	};

	var addHandlers = function () {
		$('.plusButton').click( onPlus );
		$('.syncButton').click( onSync );
		$('.option').click( onAddOption );
		$('body').click( onClearOptions );
	};

	var onPlus = function (event){
		event.preventDefault();
		activeRuleOptions = $(this).attr('id');
		var rule_number = $(this).attr('data-i');
		activeRuleNumber = $(this).attr('data-i');

		// console.log(".options[data-i="+rule_number+"]");
		//show options
		$(".options").hide();
		$(".options[data-i="+rule_number+"]").show();
		event.stopPropagation();
	};

	var onAddOption = function (event){
		event.preventDefault();
		var option_number = $(this).attr('data-j');
		// console.log("click on "+activeRuleOptions);

		var options = allRules[activeRuleNumber].consequent.options;

		$("#"+activeRuleOptions).before("<div class='vac shot' data-id='"+ options[option_number].id + "'><div>"+options[option_number].description+"</div></div>");
		event.stopPropagation();
	};

	var onClearOptions = function (event){
		event.preventDefault();
		console.log("clear things");
		activeRuleOptions = 0;
		$(".options").hide();
	};

	var onSync = function(event){
		console.log("sync that shit");
		event.preventDefault();
		$('.syncButton').off("click");
		TweenLite.to($(".syncButton .glyphicon"), 1.8, {rotation:720, ease:Elastic.easeOut, onComplete:resetSync});
	};

	var resetSync = function(event){
		console.log("reset sync");
		TweenLite.to($(".syncButton .glyphicon"), 0, {rotation:0});
		$('.syncButton').click( onSync );
	};

	return {
		init: init
	};
};



$(function(){
	var app = new PolicyEditor();
	app.init();
});