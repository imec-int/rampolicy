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
		$('.removeButton').click( onRemove );
		$('.timing .minButton').click( onTimeMin );
		$('.timing .plButton').click( onTimePlus );
		$('.timing input').change( onTimeType );
		$('.option').click( onAddOption );
		$('body').click( onClearOptions );
		//sortables
		$(".shots").sortable(
			{
			// set item relative to cursor position
			onDragStart: function ($item, container, _super) {
				var offset = $item.offset(),
				pointer = container.rootGroup.pointer

				adjustment = {
				  left: pointer.left - offset.left,
				  top: pointer.top - offset.top
				}

				_super($item, container)
			},
			onDrag: function ($item, position) {
				$item.css({
				  left: position.left - adjustment.left,
				  top: position.top - adjustment.top
				});
			},

			isValidTarget: function (item, container) {
				return item.parent("ul")[0] == container.el[0];
			}

		});

		$(".rules").sortable(
			{
			// set item relative to cursor position
			onDragStart: function ($item, container, _super) {
				var offset = $item.offset(),
				pointer = container.rootGroup.pointer

				adjustment = {
				  left: pointer.left - offset.left,
				  top: pointer.top - offset.top
				}

				_super($item, container)
			},
			onDrag: function ($item, position) {
				$item.css({
				  left: position.left - adjustment.left,
				  top: position.top - adjustment.top
				});
			},
			isValidTarget: function (item, container) {
				return item.parent("ol")[0] == container.el[0];
			}
		});
	};

	var onPlus = function (event){
		event.preventDefault();
		activeRuleOptions = $(this).attr('id');
		var rule_number = $(".rule").index($(this).closest(".rule"));
		console.log(rule_number);
		activeRuleNumber = rule_number;

		// console.log(".options[data-i="+rule_number+"]");
		//show options
		$(".options").hide({duration:200 });
		$(".options:eq(" + activeRuleNumber +")").show({duration:300 });
		event.stopPropagation();
	};

	var onAddOption = function (event){
		event.preventDefault();
		var option_number = $(this).attr('data-j');
		// console.log("click on "+activeRuleOptions);

		var options = allRules[activeRuleNumber].consequent.options;
		// console.log(".rule[data-i="+activeRuleNumber+"] shots");
		// $("#"+activeRuleOptions).before("<li class='vac shot' data-id='"+ options[option_number].id + "'><div>"+options[option_number].description+"</div></li>");
		$(".rule:eq(" + activeRuleNumber + ") .shots").append("<li class='vac shot' data-id='"+ options[option_number].id + "'><div>"+options[option_number].description+"</div><a class='removeButton'><span class='glyphicon glyphicon-remove'></span></a></li>");
		$('.removeButton').click( onRemove );
		event.stopPropagation();
	};

	var onRemove = function (event){
		event.preventDefault();
		// console.log($(this).parent().remove());
		$(this).parent().remove();
		event.stopPropagation();
	};

	var onTimeMin = function (event){
		event.preventDefault();
		// console.log($(this).parent().find("input"));
		var timeInput = $(this).parent().find("input")[0];
		timeInput.value = Math.max(parseInt(timeInput.value)-5,0);
		syncTimeBetweenShotsInRule(timeInput.value, $(this).closest(".rule").attr("data-id"));
		event.stopPropagation();
	};

	var onTimePlus = function (event){
		event.preventDefault();
		// console.log($(this).closest(".rule").attr("data-id"));
		var timeInput = $(this).parent().find("input")[0];
		timeInput.value = Math.min(parseInt(timeInput.value)+5,360);
		syncTimeBetweenShotsInRule(timeInput.value, $(this).closest(".rule").attr("data-id"));
		event.stopPropagation();
	};

	var onTimeType = function (event){
		event.preventDefault();
		var timeInput = $(this)[0];
		// console.log(timeInput);
		syncTimeBetweenShotsInRule(timeInput.value, $(this).closest(".rule").attr("data-id"));
		event.stopPropagation();
	};

	var syncTimeBetweenShotsInRule = function (tValue, ruleId){
		event.preventDefault();
		var timings = $(".rule[data-id='"+ ruleId + "']").find(".shots .shot .timing input");
		// console.log(timings);
		for (var i = 0; i < timings.length; i++) {
			timings[i].value = tValue;
		};

	};

	var onClearOptions = function (event){
		event.preventDefault();
		console.log("clear things");
		activeRuleOptions = 0;
		$(".options").hide({duration:200 });
	};

	var onSync = function(event){
		console.log("sync that shit");
		event.preventDefault();
		$('.syncButton').off("click");
		postRules();
		TweenLite.to($(".syncButton .glyphicon"), 1.8, {rotation:720, ease:Elastic.easeOut, onComplete:resetSync});
	};

	var resetSync = function(event){
		console.log("reset sync");
		TweenLite.to($(".syncButton .glyphicon"), 0, {rotation:0});
		$('.syncButton').click( onSync );
	};

	var buildPost = function(){
		var body = [];
		$(".rule").each(function(i, arule){
			var ruleId = $(arule).attr('data-id');
			// rule heeft maar 1 antec/conseq
			// volgende niet meer nodig??
			// var antecedentId = $(arule).find('.if').attr('data-id');
			var consequent = $(arule).find('.then');
			// volgende ook niet meer nodig??
			// var consequentId = consequent.attr('data-id');
			var sequence = [];
			consequent.find('.vac.shot').each(function(j, shot){
				sequence.push($(shot).attr('data-id'));
			});
			body.push({id: ruleId, /*antecedentId: antecedentId, consequentId: {id: consequentId, */ subRules: sequence, priority: i+1});
			// TODO: Add priority, randomness, timing
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
});