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

	var buildPost = function(){
		var body = [];
		$(".rule").each(function(i, arule){
			var ruleId = $(arule).attr('data-id');
			// rule heeft maar 1 antec/conseq
			var antecedentId = $(arule).children('.if').attr('data-id');
			var consequent = $(arule).children('.then');
			var consequentId = consequent.attr('data-id');
			var sequence = [];
			consequent.children('.vac shot').each(function(j, shot){
				sequence.push($(shot).attr('data-id'));
			});
			body.push({id: ruleId, antecedentId: antecedentId, consequentId: {id: consequentId, sequence: sequence}});
		});
		return body;
	}

	var postRules = function(){
		var body = buildPost();
		$.post('/rules', {rules: body}, function(data){
			console.log(data);
		});
	}

	return {
		init: init,
		postRules: postRules
	};
};



$(function(){
	var app = new PolicyEditor();
	app.init();
	app.postRules();
});