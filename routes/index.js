var express = require('express');
var router = express.Router();
var serverUrl = require('../config').serverUrl;
var httpreq = require('httpreq');

// keep track of latest rule config in following variable, so we can show the current configuration to the user
// this should normally also be returned by ibcn server, so this is bit of a hack
// var currentRulesConfig = [];

function getRules (callback){
	httpreq.get(serverUrl, function (err, res){
		if(err) return callback(err);
		if(callback && typeof callback == 'function') {
			var rules = {};
			try{
				rules = JSON.parse(res.body);
			} catch(error){
				if(error) return callback(error);
			}
			callback(null, rules);
		}
	});
}

// example of 1 rule returned by IBCN on 8/19
// all rules are in an object {"rules":[Rule1, Rule2,...]}

// {
// 	"activerule": {
// 		"id": "CommercialRule",
// 		"priority": 1,
// 		"randomness": 0.5,
// 		"subRules": ["shotID2", "shotID"],
// 		"timing": 20
// 	},
// 	"antecedent": {
// 		"id": "antecedent1",
// 		"description": "<description>",
// 		"turtle": ["q:Commercial(?<urn:swrl#unit>), q:isActive(?<urn:swrl#unit>, true) -> ramp:Show_Sequence(ramp:ShotSequence_Commercial), ramp:priority(ramp:ShotSequence_Commercial, %d), ramp:randomness(ramp:ShotSequence_Commercial, %.2f), ramp:time_between_shots(ramp:ShotSequence_Commercial, %d)"]
// 	},
// 	"id": "CommercialRule",
// 	"consequent": {
// 		"id": "consequent1",
// 		"description": "<description>",
// 		"turtle": [{
// 			"id": "shotID",
// 			"description": "Show DJ",
// 			"subConsequent": "q:Commercial(?<urn:swrl#unit>), ramp:capability(?<urn:swrl#unit3>, q:DJ), q:isActive(?<urn:swrl#unit>, true) -> ramp:sequence_member(ramp:ShotSequence_Commercial, ramp:Shot_311), ramp:show(ramp:Shot_311, ?<urn:swrl#unit3>), ramp:order(ramp:Shot_311, %d)"
// 		}, {
// 			"id": "shotID2",
// 			"description": "Show the Chairman",
// 			"subConsequent": "q:Commercial(?<urn:swrl#unit>), ramp:capability(?<urn:swrl#unit3>, q:MainGuest), q:isActive(?<urn:swrl#unit>, true) -> ramp:sequence_member(ramp:ShotSequence_Commercial, ramp:Shot_312), ramp:show(ramp:Shot_312, ?<urn:swrl#unit3>), ramp:order(ramp:Shot_312, %d)"
// 		}]
// 	},
// 	"description": "A commercial starts"
// }

function transformRules (sampleRules){
	var transformedRules = [];
	if(sampleRules && sampleRules.rules && sampleRules.rules.length > 0){
		var rules = sampleRules.rules;
		for (var i = rules.length - 1; i >= 0; i--) {
			var rule = {
				description: rules[i].description,
				id: rules[i].id,
				antecedent: {id: rules[i].antecedent.id, description: rules[i].antecedent.description},
				consequent: {id: rules[i].consequent.id, description: rules[i].consequent.description},
				//this should also come from ibcn server?
				priority: i + 1,
				randomness: 0.0,
				timing: 0.0
			};
			// active rule is just merged into rule with options, so we don't have to change all the code
			if(rules[i].activerule){
				var activeRule = rules[i].activerule;
				rule.priority = activeRule.priority;
				rule.randomness = activeRule.randomness;
				rule.timing = activeRule.timing;
			}
			var options = [];

			// keep track of the mapping between ids and description in this turtle stuff, so we can reuse it later on
			var subRuleMap = {};
			for (var j = rules[i].consequent.turtle.length - 1; j >= 0; j--) {
				var optionId = rules[i].consequent.turtle[j].id;
				var optionDescription = rules[i].consequent.turtle[j].description;
				options.unshift({id: optionId, description: optionDescription});
				subRuleMap[optionId] = optionDescription;
			};
			rule.consequent.options = options;
			// put the currently picked/configured shots also in
			if(!rules[i].activerule || !rules[i].activerule.subRules){
				rule.consequent.subRules = [options[0]];
			}
			else{
				rule.consequent.subRules = [];
				var subRules = rules[i].activerule.subRules;
				for (var i = subRules.length - 1; i >= 0; i--) {
					rule.consequent.subRules.unshift({id: subRules[i], description: subRuleMap[subRules[i]]});
				};

			}
			transformedRules.unshift(rule);
		};

	}
	return transformedRules;
}

function postRules (rules, callback){
	httpreq.post(serverUrl, {json: rules}, function (err, res){
		if(err) {
			return callback(err);
		}
		// body is empty so return HTTP status code
		callback(null, res.statusCode);

	});
}


// temporary function to keep track of state, since IBCN didn't do this...

// function setCurrentRulesConfig (postedRules, callback) {
// // 	{"rules": [{
// // "id": "ruleID1", "subRules":["subRule2","subRule1"],
// // "priority":"..",
// // "randomness":"..",
// // "timing":".."
// // }]}
// 	// get all rules from ibcn server for descriptions etc...
// 	currentRulesConfig = [];
// 	getRules(function(err, rules){
// 		if(err){
// 			return callback(err);
// 		}
// 		var transformedRules = transformRules(rules);

// 		// if rules were added/deleted on ibcn server reset our config
// 		if(transformedRules.length != postedRules.rules.length){
// 			console.log('resetting config');
// 			currentRulesConfig = transformedRules;
// 			return callback(null, currentRulesConfig);
// 		}
// 		for (var i = postedRules.rules.length - 1; i >= 0; i--) {
// 			for (var j = transformedRules.length - 1; j >= 0; j--) {
// 				if(transformedRules[j].id == postedRules.rules[i].id){
// 					// remove from array with splice, so less elements to loop over
// 					var rule = transformedRules.splice(j, 1)[0];
// 					console.log(rule);
// 					// copy new fields from posted stuff
// 					rule.priority = postedRules.rules[i].priority;
// 					rule.randomness = postedRules.rules[i].randomness;
// 					rule.timing = postedRules.rules[i].timing;
// 					// set currently picked/configured shots
// 					rule.consequent.subRules = [];
// 					for(var l = postedRules.rules[i].subRules.length -1; l >= 0; l--) {
// 						for(var k = rule.consequent.options.length - 1; k >= 0; k--) {
// 							if(postedRules.rules[i].subRules[l] == rule.consequent.options[k].id){
// 								rule.consequent.subRules.unshift(rule.consequent.options[k]);
// 								break;
// 							}
// 						}
// 					}
// 					currentRulesConfig.unshift(rule);
// 				}
// 			};
// 		};
// 		return callback(null, currentRulesConfig);
// 	});
// }

function getCurrentRulesConfig(callback){
	// don't cache here since IBCN returns state as well
	// if(currentRulesConfig.length == 0)
		getRules(function(err, rules){
			console.log('no rules yet');
			// console.log(rules);
			if(err) return callback(err);
			else return callback(null, transformRules(rules));
		});
	// else return callback(null, currentRulesConfig);
}


/* GET home page. */
router.get('/', function(req, res) {
	getCurrentRulesConfig(function(err, rules){
		if(err) res.send(500, { error: 'problem getting rules'});
		else{
			console.log(rules);
			res.render('index', { title: 'Policy Editor' , rules: JSON.stringify(rules)});
		}
	});
});

router.post('/rules', function (req, res){
	postRules(req.body, function (err, result){
		if(err) return res.json({status: err});
		// setCurrentRulesConfig(req.body, function(error){
		// 	if(error) return res.json({status: error});
			// for now just return HTTP status code (body is empty)
			res.json({status: result});
		// });
	});
});

module.exports = router;
