var express = require('express');
var router = express.Router();


var sampleRules = {"rules": [
        {
            "antecedent": {
                "description": "<descriptionAntecedentId1>",
                "id": "antecedentId1",
                "turtle": "televic:MeetingUser(?<urn:swrl#user>), televic:seatOf(?<urn:swrl#seat>,?<urn:swrl#seatNode>),televic:unitState(?<urn:swrl#mic>,televic:On),televic:sittingOn(?<urn:swrl#user>,?<urn:swrl#seat>),televic:unit(?<urn:swrl#seatNode>,?<urn:swrl#mic>)"
            },
            "description": "Rule1: User is speaking",
            "id": "RuleId1",
            "consequent": {
                "id": "ConsequentId1",
                "description": "<descriptionConsequentId1>",
                "turtle": [{"id":"<ShotID1>", "description": "ShowNationality",  "subConsequent":"televic:ShowNationality(?<urn:swrl#user>)"}, {"id":"<ShotID2>", "description": "ShowSpeaker",  "subConsequent":"televic:ShowSpeaker(?<urn:swrl#user>)"}]
            }
        },
        {
            "antecedent": {
                "description": "<descriptionAntecedentId2>",
                "id": "AntecedentId2",
                "turtle": "televic:Meeting(?<urn:swrl#meeting>), televic:MeetingUser(?<urn:swrl#user>), televic:attendant(?<urn:swrl#meeting>, ?<urn:swrl#user>), ns:hasAddress(?<urn:swrl#meeting>, ?<urn:swrl#adres>), ns:hasAddress(?<urn:swrl#user>, ?<urn:swrl#adres>)"
            },
            "description": "Rule2: Meeting and user have the same location",
            "id": "RuleId2",
            "consequent": {
                "description": "<descriptionConsequentId2>",
                "id": "ConsequentId2",
                "turtle": [{"id":"<ShotID3>","description": "ShowNationality" , "subConsequent":"televic:ShowNationality(?<urn:swrl#user>)"},{"id":"<ShotID4>", "description": "ShowSpeaker", "subConsequent":"televic:ShowSpeaker(?<urn:swrl#user>)"}]
            }
        }
    ]

};

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
	console.log(JSON.stringify(transformedRules));
}


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Policy Editor' });
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