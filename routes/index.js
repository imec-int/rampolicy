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
			};
			var options = [];
			for (var j = rules[i].consequent.turtle.length - 1; j >= 0; j--) {
				options.unshift({id: rules[i].consequent.turtle[j].id, description: rules[i].consequent.turtle[j].description});
			};
			rule.consequent.options = options;
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



/* GET home page. */
router.get('/', function(req, res) {
	getRules(function(err, rules){
		if(err) res.send(500, { error: 'problem getting rules from intec server'});
		else{
			transformedRules = transformRules(rules);
			res.render('index', { title: 'Policy Editor' , rules: JSON.stringify(transformedRules)});
		}
	});
});

router.post('/rules', function (req, res){
	postRules(req.body, function (err, result){
		if(err) return res.json({status: err});
		// for now just return HTTP status code (body is empty)
		res.json({status: result});
	});
});

module.exports = router;


/*

//OUTPUT{
	"rules": [{
		"ID": "<ruleID>",
		"description": "<description>",
		"Antecedent": {
			"ID": "<antecedentID>",
			"turtle": "<antecedentTurtle>",
			"description": "<description>",

		},
		"Consequent": {
			"ID": "<consequentID>",
			"turtle": [{"ID":"<ShotID>","SubConsequent":"<turtle>"}],
			"description": "<description>"
		}
	}]
}
//INPUT{
	"rules": [{
		"ID": "<ruleID>",
		"AntecedentID": "<antecedentID>",
		"ConsequentID": "{"ID":"concequentID>","Sequence":["<SubConcequenceID>"]}"  // subconsequenceID = ShotId
	}]
}

{"rules": [{
"id": "ruleID1", "subRules":["subRule2","subRule1"],
"priority":"..",
"randomness":"..",
"timing":".."
}]}

//example
{
MeetingUser(?user), seatOf(?seat, ?seatNode), unitState(?mic, On), sittingOn(?user, ?seat), unit(?seatNode, ?mic), onSeat(?user, false) -> Show(?user)
	"rules": [
		{
			"Antecedent": {
				"description": "<description>",
				"Id": "1",
				"turtle": televic:MeetingUser(?<urn:swrl#user>), televic:seatOf(?<urn:swrl#seat>,?<urn:swrl#seatNode>),televic:unitState(?<urn:swrl#mic>,televic:On),televic:sittingOn(?<urn:swrl#user>,?<urn:swrl#seat>),televic:unit(?<urn:swrl#seatNode>,?<urn:swrl#mic>)"
			},
			"description": "User is speaking",
			"ID": "1",
			"Consequent": {
				"id": "1",
				"description": "<description>",
				"turtle": [{"ID":"<ShotID>","SubConsequent":"televic:ShowNationality(?<urn:swrl#user>)"}, {"ID":"<ShotID2>", "SubConsequent":"televic:ShowSpeaker(?<urn:swrl#user>)"}]
			}
		},
		{
			"Antecedent": {
				"description": "<description>",
				"ID": "<antecedentID>",
				"turtle": "televic:Meeting(?<urn:swrl#meeting>), televic:MeetingUser(?<urn:swrl#user>), televic:attendant(?<urn:swrl#meeting>, ?<urn:swrl#user>), ns:hasAddress(?<urn:swrl#meeting>, ?<urn:swrl#adres>), ns:hasAddress(?<urn:swrl#user>, ?<urn:swrl#adres>)"
			},
			"description": "<Meeting and user have the same location>",
			"ID": "2",
			"Consequent": {
				"description": "<description>",
				"ID": "<concequentID>",
				"turtle": [{"ID":"<ShotID>","SubConsequent":"televic:ShowNationality(?<urn:swrl#user>)"},{"ID":"<ShotID2>", "SubConsequent":"televic:ShowSpeaker(?<urn:swrl#user>)"}]
			}
		}
	]

}

*/