var PolicyEditor = function (options){

	var socket = null;

	var init = function (){
		addHandlers();
		FastClick.attach(document.body);
	};

	var addHandlers = function () {
		$('.plusButton').click( onPlus );
	};

	var onPlus = function (event){
		var plus = $(this).attr('id');
		var rule_number = $(this).attr('data-i');
		console.log("click on "+plus);
		console.log($(this));
		$(".rule").eq(rule_number).after( "<p>Show possibilities</p>" );
	};

	return {
		init: init
	};
};



$(function(){
	var app = new PolicyEditor();
	app.init();
});