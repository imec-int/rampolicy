var express = require('express');
var router = express.Router();
var serverUrl = require('../config').serverUrl;
var httpreq = require('httpreq');


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
			console.log(rules[i]);
			var rule = {
				description: rules[i].description,
				id: rules[i].id,
				antecedent: {id: rules[i].antecedent.id, description: rules[i].antecedent.description},
				consequent: {id: rules[i].consequent.id, description: rules[i].consequent.description},

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
				for (var k = subRules.length - 1; k >= 0; k--) {
					rule.consequent.subRules.unshift({id: subRules[k], description: subRuleMap[subRules[k]]});
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


function getCurrentRulesConfig(callback){
	getRules(function(err, rules){
		if(err) return callback(err);
		else return callback(null, transformRules(rules));
	});
}


/* GET home page. */
router.get('/', function(req, res) {
	getCurrentRulesConfig(function(err, rules){
		if(err) res.send(500, { error: 'problem getting rules'});
		else{
			res.render('index', { title: 'Policy Editor' , rules: JSON.stringify(rules)});
		}
	});
});

router.post('/rules', function (req, res){
	postRules(req.body, function (err, result){
		if(err) return res.json({status: err});
		res.json({status: result});
	});
});

module.exports = router;
