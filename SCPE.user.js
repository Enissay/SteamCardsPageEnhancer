// ==UserScript==
// @name        SteamCardsPageEnhancer
// @namespace   http://steamcommunity.com/id/Enissay/
// @version     0.005
// @description Steam Cards Page Enhancer - Adds some stats to each card page
// @author      Enissay
// @include     /^(https?:\/\/)?(www\.)?steamcommunity\.com\/(id|profiles)\/[^\/]+\/gamecards\/\d+\/?.*$/
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @downloadURL https://github.com/Enissay/SteamCardsPageEnhancer/raw/master/SCPE.user.js
// @updateURL   https://github.com/Enissay/SteamCardsPageEnhancer/raw/master/SCPE.user.js
// @grant       none
// ==/UserScript==

/*****************
 * Starting infos
 *****************/
//console.log('%c ' + GM_info.script.name + ' script started', 'background: #222; color: #bada55');
var console_info=["%c dscdwvwxv "+GM_info.script.name+" %c v"+GM_info.script.version+" by "+GM_info.script.author+" %c @ "+GM_info.script.namespace + " %c Started ",
                  "background: #000000;color: #7EBE45",
                  "background: #000000;color: #ffffff",
                  "",
                  "background: #000000;color: #7EBE45"];
console.log.apply(console,console_info);

/*****************
 * Functions
 *****************/
function colorifyMissingCards(className, value) {

    if(value >= 0)
        $('span.' + className).css('color', '#FF000A');
    else
        $('span.' + className).css('color', '#0BFA17');
}

/***************
 * Gather Infos
 ***************/
var NbreOfLinesAdded = 4; // to edit if more lines added !!

// Get current level
var levelString = $('div.badge_info_description').text();
var re = /level\s+(\d+)\s*,/i;
var myLevel = levelString.match(re) ? +(levelString.match(re))[1] : 0;
var maxLevel = (myLevel <= 5) ? 5 : (myLevel < 10) ? 10 : 20;
/**********************************************************************************************************
 * GameName                              A[Ready badges]
 * B[Slots]                              C[Total available cards]
 * D[dupeCards vis-a-vis the next Set]   E[dupeCardsTotalSetsCount = currentCount - (maxLevel - myLevel)]
 * F[Needed cards to the next set]       G[Needed cards to full badges]
 **********************************************************************************************************/
// Vars
var readyBadgesCount = 0;
var slotsCount = 0;
var availableCardsCount = 0;
var slotsEmptyCount = 0;

var dupeCardsNextSetCount = 0; // All dupes that could be traded to reach the next level
var dupeCardsTotalSetsCount = 0; // Dupe cards more than needed to reach the maxLevel

var missingCardsToNextSet = 0;
var missingCardsToFullBadges = 0;

var cardsListInfos = [];

// loop through all cards
$('div.badge_detail_tasks > div.badge_card_set_card').each(function() {
    var currentCount = +($(this).find('div.badge_card_set_text_qty').text().replace(/\D+/g, '')); // using the unary op to convert strings to num "+XXX"... or "parseInt(num1, 10)"
    
    cardsListInfos.push({
        count: currentCount,
        cardObject: $(this) // to colorify dupe cards
    });
    
    if (currentCount > (maxLevel - myLevel))
        dupeCardsTotalSetsCount += currentCount - (maxLevel - myLevel);
});

// Sort the array desc
cardsListInfos.sort(function(a, b){return b.count-a.count})
console.log(cardsListInfos.toString());

readyBadgesCount = cardsListInfos[cardsListInfos.length-1].count;
slotsCount = cardsListInfos.length;

for (var i = 0; i < cardsListInfos.length; i++) {
    availableCardsCount += cardsListInfos[i].count;
    
    (cardsListInfos[i].count > readyBadgesCount) ? '' : slotsEmptyCount++;
    
    
    if (cardsListInfos[i].count > (readyBadgesCount + 1) && (cardsListInfos[i].count + readyBadgesCount) < maxLevel ) {
        dupeCardsNextSetCount += cardsListInfos[i].count - (readyBadgesCount + 1);
        
        cardsListInfos[i].cardObject.css('background', '#1F3B08'); // Extra cards => Tradeable
    }
    else if (cardsListInfos[i].count < (readyBadgesCount + 1) && (cardsListInfos[i].count + readyBadgesCount) < maxLevel ) {
        cardsListInfos[i].cardObject.css('background', '#4d192b'); // Missing cards for the next set
    }
    
    else if ((cardsListInfos[i].count + myLevel) > maxLevel ) {
        cardsListInfos[i].cardObject.css('background', '#1F3B08'); // Extra cards => Tradeable
    }
}

//dupeCardsNextSetCount = availableCardsCount - readyBadgesCount*slotsCount;

missingCardsToNextSet = slotsEmptyCount; // >0 if missing;
missingCardsToFullBadges = (Math.abs(myLevel-maxLevel) * slotsCount) - availableCardsCount; // >0 if missing, <0 if extra

/***************
 * Prepare nodes
 ***************/
// Inserted line1
var line1 = readyBadgesCount ? '<br/> [ <span class="readyBadgesCount">' + readyBadgesCount + ' badge' + ((readyBadgesCount > 1) ? 's' : '') + ' ready</span> ]' : '';

// Inserted line2
var line2 = '<br/>[ ' + slotsCount + ' slots ]';
line2 += ' - [ ' + availableCardsCount + ' card' + ((availableCardsCount > 1) ? 's' : '') + ' available (' + Math.floor(availableCardsCount/slotsCount) + ' badges) ]';

// Inserted line3 => Dupes
var line3 = '<br/>[ ' + dupeCardsNextSetCount + ' Set Dupe' + ((dupeCardsNextSetCount > 1) ? 's' : '') + ' ]';
line3 += ' - [ ' + dupeCardsTotalSetsCount + ' Badge Dupe' + ((dupeCardsTotalSetsCount > 1) ? 's' : '') + ' ]';

// Format output text in line4 => cards needed/extra
var textFormat41 = '<span class="missingCardsToNextSet">Need ' + missingCardsToNextSet + ' card' + ((missingCardsToNextSet > 1) ? 's' : '') + '</span>';
var textFormat42 = '<span class="missingCardsToFullBadges">' + ((missingCardsToFullBadges > 0) ? 'Need ' : 'Extra ') + Math.abs(missingCardsToFullBadges) + ' card' + ((Math.abs(missingCardsToFullBadges) > 1) ? 's' : '') + '</span>';
//var lineX = ((myLevel < maxLevel) ? ' to ' : ' from ') + ' level ' + maxLevel + ' ]';

var line4 = '<br/>[ ' + textFormat41 + ((myLevel < maxLevel) ? ' to ' : ' from ') + ' set ]';
line4 += ' - [ ' + textFormat42 + ((missingCardsToFullBadges > 0) ? ' to ' : ' from ') + ' level ' + maxLevel + ' ]';

// store link
var gameStoreUrlFomat = "http://store.steampowered.com/app/GAME_ID/"
var gameName = $('div.badge_title').text().trim().match(/^(.*)Badge\s*$/i)[1].trim();

var gameStoreUrl = $('div.badge_title').text().trim()
                   .match(/^(.*)Badge\s*$/i)[1].trim();
var mySteamURL = gameStoreUrlFomat.replace( "GAME_ID",
                                            $(location).attr("href").match(/gamecards\/(\d+)/i)[1]
                                          );
console.log("===> gameName: " + gameName);
console.log("===> mySteamURL: " + mySteamURL);

var openStorePage = '<div class="floating-icon">\
                         <a href="' + mySteamURL + '" target="_blank">\
                            <img id="storeUrl" src="http://i.imgur.com/iPKSAF1.png" alt="Open \"' + gameName + '\"\'s store page" title="Open ' + gameName + '\'s store page" />\
                         </a>\
                    </div>';

/***************
 * Inject nodes
 ***************/
// locate the title node where to insert infos
var title = $('div.badge_title');

// Insert
title.append(line1).append(line2).append(line3).append(line4).append(openStorePage);

/***************
 * Style nodes
 ***************/
// Expand the node
title.parent().css('height', (NbreOfLinesAdded * 32) + 'px'); // 32 per line *3
// Colorify
colorifyMissingCards("missingCardsToNextSet", missingCardsToNextSet);
colorifyMissingCards("missingCardsToFullBadges", missingCardsToFullBadges);
colorifyMissingCards("readyBadgesCount", readyBadgesCount*(-1)); // *-1 to inverse the logic from missing to extra =-)

/***************
* Apply styles
***************/     
$(document).find('.badge_title').css({'position': 'relative'
                                             });

$(document).find('.floating-icon').css({'position': 'absolute',
                                              'bottom': '2px',
                                              'right': '2px',
                                              //'background': '#B8A872'
                                             });

$(document).find('.floating-icon img').css({'display': 'block',
                                                  'padding': '1px',
                                                  'cursor': 'pointer',
                                                  'width': '35px',
                                                  'height': '35px'
                                                 });
    

