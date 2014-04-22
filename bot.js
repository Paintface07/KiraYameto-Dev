// Create the configuration
var config = {
  channels: ["#thesetkehproject"], //, "#linuxdistrocommunity"],
  server: "irc.freenode.net",
  botName: "USERNAME",
  userName: "USERNAME",
  password: "PASSWORD",
  secure: true,
  autoRejoin: true,
  autoConnect: true,
  realName: "MAINTAINER",
  dictLocation: "part-of-speech.txt"
};

// Get the libs
var irc = require("irc");
var request = require("request");
var os = require("os");
var fs =  require("fs"); //Used for Parsing Large Json for output purposes and logging.
var stream = require("stream");
var readline = require("readline");

// Create Global Config Variables
var trigger = "~";
var machine = "Hailstorm"; // This is Machine type for example "Dell Poweredge 2650"
var maintainer = "MAINTAINER"; // Yourname Here.

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
    autoConnect: config.autoConnect,
    channels: config.channels,
    userName: config.userName,
    realName: config.realName,
    autoRejoin: config.autoRejoin,
    password: config.password
  });

// load word database
var instream = fs.createReadStream(config.dictLocation);
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

var NOUNS = { symbol: "N", words: [] };           // N Noun
var PLURALS = { symbol: "p", words: [] };         // p Plural
var NOUN_PHRASE = { symbol: "h", words: [] };     // h Noun Phrase
var VERBS = { symbol: "V", words: [] };           // V Verb (usu participle)
var TRANS_VERBS = { symbol: "t", words: [] };     // t Verb (transitive)
var INTRANS_VERBS = { symbol: "i", words: [] };   // i Verb (intransitive)
var ADJECTIVES = { symbol: "A", words: [] };      // A Adjective
var ADVERBS = { symbol: "v", words: [] };         // v Adverb
var CONJUNCTIONS = { symbol: "C", words: [] };    // C Conjunction
var PREPOSITIONS = { symbol: "P", words: [] };    // P Preposition
var INTERJECTIONS = { symbol: "!", words: [] };   // ! Interjection
var PRONOUNS = { symbol: "r", words: [] };        // r Pronoun
var DEF_ARTICLES = { symbol: "D", words: [] };    // D Definite Article
var INDEF_ARTICLES = { symbol: "I", words: [] };  // I Indefinite Article
var NOMINATIVES = { symbol: "o", words: [] };     // o Nominative

var wordTypes = [];
wordTypes.push(NOUNS);
wordTypes.push(PLURALS);
wordTypes.push(NOUN_PHRASE);
wordTypes.push(VERBS);
wordTypes.push(TRANS_VERBS);
wordTypes.push(INTRANS_VERBS);
wordTypes.push(ADJECTIVES);
wordTypes.push(ADVERBS);
wordTypes.push(CONJUNCTIONS);
wordTypes.push(PREPOSITIONS);
wordTypes.push(INTERJECTIONS);
wordTypes.push(PRONOUNS);
wordTypes.push(DEF_ARTICLES);
wordTypes.push(INDEF_ARTICLES);
wordTypes.push(NOMINATIVES);

// SAMPLE LINE: above PvNA
console.log("***** PARSING word list.");
rl.on("line", function(line) {
  var parts = line.split("\t");
  var word = parts[0].trim();
  var partOfSpeech = parts[1].toString().trim();

  // for each of the designated parts of speech for this word
  for(var i = 0; i < partOfSpeech.length; i++) {

    // check which types the word matches with, and add it to the appropriate word arrays
    for(var x = 0; x < wordTypes.length; x++) {
      if(partOfSpeech[i] == wordTypes[x].symbol) {
        wordTypes[x].words.push(word);
      }
    }
    
  }

});

// when the reader is closed, report that the file has been parsed
rl.on("close", function() {
  console.log("***** DONE parsing word list.");
});

//Log Errors instead of Crashing "Hopefully" TM
bot.addListener('error', function(message) {
  console.log('error: ', message);
});
// END load word database

// Listen for joins
/*bot.addListener("join", function(channel, who) {
  // Welcome them in!
  if ((who) != config.botName) {
    if ((channel) == "#thesetkehproject") {
      bot.say(channel, who + "Welcome to the" + channel + " channel!!");
    };
  };
});*/

// Listen for any message, PM said user when he posts
bot.addListener("pm", function(from, to, text, message) {
  bot.say(from, "I am a Bot and my Brains Fell Out");
});

// Listen for any message, say to him/her in the room
bot.addListener("message#", function(from, to, text, message) {
  if (to == config.botName) {
    bot.say(config.channels[0], "I am not the Droid you're looking for! Move Along Move Along");
  };
});

// Start About Command
bot.addListener('message', function (from, to, message) {
  console.log("From:    " + from);
  console.log("To:      " + to);
  console.log("Message: " + message);
  
  // ~about command
  if (message == trigger + "about") {
    var cpus = os.cpus();
    var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    var cpu = cpus[0];

    bot.say(to, from + " I pm'd you my information.  Call me!");
    bot.say(from, "Bot Name: " + config.botName);
    bot.say(from, "Operating System: " + os.release());
    bot.say(from, "Architecture: " + os.arch());
    bot.say(from, "Machine Type: " + machine);
    bot.say(from, "CPU: " + cpu.model);
    bot.say(from, "CPU Speed: " + cpu.speed + "MHz");
    bot.say(from, "CPU Temp: " + (temperature/1000).toPrecision(3) + "°C");
    bot.say(from, "Total Mem: " + os.totalmem() + " Free Mem: " + os.freemem());
    bot.say(from, "Uptime: " + os.uptime() / 60 / 1000 + " Days");
    bot.say(from, "Maintainer: " + maintainer);
  };
  // end ~about command

  // ~dictionary command
  if (message == trigger + "dictionary") {
    bot.say (from, "Nouns Parsed:               " + wordTypes[0].words.length);
    bot.say (from, "Plurals Parsed:             " + wordTypes[1].words.length);
    bot.say (from, "Noun phrases Parsed:        " + wordTypes[2].words.length);
    bot.say (from, "Verbs Parsed:               " + wordTypes[3].words.length);
    bot.say (from, "Transitive Verbs Parsed:    " + wordTypes[4].words.length);
    bot.say (from, "Intransitive Verbs Parsed:  " + wordTypes[5].words.length);
    bot.say (from, "Adjectives Parsed:          " + wordTypes[6].words.length);
    bot.say (from, "Adverbs Parsed:             " + wordTypes[7].words.length);
    bot.say (from, "Conjunctions Parsed:        " + wordTypes[8].words.length);
    bot.say (from, "Prepositions Parsed:        " + wordTypes[9].words.length);
    bot.say (from, "Interjections Parsed:       " + wordTypes[10].words.length);
    bot.say (from, "Pronouns Parsed:            " + wordTypes[11].words.length);
    bot.say (from, "Definite Articles Parsed:   " + wordTypes[12].words.length);
    bot.say (from, "Indefinite Articles Parsed: " + wordTypes[13].words.length);
    bot.say (from, "Nominatives Parsed:         " + wordTypes[14].words.length);
  }
  // end ~dictionary command

  console.log("index: " + message.indexOf(config.botName));

  // answer to the bot's name
  if (message.indexOf(config.botName) != -1) {

    // if we're supposed to yell at someone
    if(message.toUpperCase().indexOf("YELL AT") != -1) {
      // choose the exclamation to use
      var exclamation = wordTypes[10].words[Math.floor((Math.random() * wordTypes[10].words.length) + 1)].toUpperCase() + "!";

      // parse the username to say it to
      var user = message.substring(message.toUpperCase().indexOf("YELL AT") + 8, message.length);

      bot.say(to, user + ": " + exclamation);

    // if we're not supposed to yell at someone
    } else {
      // var m = "I ";
      var pronoun = randomChoiceFromType(11) + " ";
      pronoun = pronoun[0].toUpperCase() + pronoun.substring(1, pronoun.length);
      var m = pronoun;  // choose random pronoun

      // choose noun and verb to use
      var verb = randomChoiceFromType(3);
      var noun = randomChoiceFromType(0);

      // if verb is present tense
      if(verb.substring(pronoun.length - 3, pronoun.length).toUpperCase == "ING") {

        // determine whether pronoun is plural
        if(pronoun.substring(pronoun.length).toUpperCase() == "S" || pronoun.substring(pronoun.length - 2, pronoun.length).toUpperCase() == "AE"
            || pronoun.substring(0, 3).toUpperCase() == "THE") {
          m += "are";
        } else {
          m += "is";
        }

      }

      // append words to message
      m += verb;

      // set pronoun separator based on first character of following noun
      if(noun[0].toLowerCase() == "a" || noun[0].toLowerCase() == "e" || noun[0].toLowerCase() == "i" || noun[0].toLowerCase() == "o" || noun[0].toLowerCase() == "u") {
        m += " an ";
      } else {
        m += " a ";
      }

      m += noun;

      bot.say(to, m);
    }
  }
  // end answer to the bot's name

});


// **********************************************************
// ******************* HELPER FUNCTIONS *********************
// **********************************************************

/**
 * Takes a numerical part of speech type and grabs a random word from that word list
 * @param - index of wordType in the wordType array
 * @return - a random word of the chosen type
 */
function randomChoiceFromType(type) {
  return wordTypes[type].words[Math.floor((Math.random() * wordTypes[type].words.length) + 1)];
}

