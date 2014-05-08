var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
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
		"ConsequentID": "{"ID":"concequentID>","Sequence":["<SubConcequenceID>"]}"  // subconsequenceID
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