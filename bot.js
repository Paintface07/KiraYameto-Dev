// Create the configuration
var config = {
  channels: ["#thesetkehproject", "#linuxdistrocommunity"],
  server: "irc.freenode.net",
  botName: "BOTNAME",
  userName: "BOTNAME",
  password: "PASSWORD",
  secure: true,
  autoRejoin: true,
  autoConnect: true,
  realName: "BallmerPeaks Pet",
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
var maintainer = "BallmerPeak"; // Yourname Here.

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
var PRONOUNS = { symbol: "r", words: [] };         // r Pronoun
var DEF_ARTICLES = { symbol: "D", words: [] };     // D Definite Article
var INDEF_ARTICLES = { symbol: "I", words: [] };   // I Indefinite Article
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
  //console.log(line);
  var parts = line.split("\t");
  //console.log("Parts: " + parts.toString());
  var word = parts[0].trim();
  var partOfSpeech = parts[1].toString().trim(); //.trim();

  for(var i = 0; i < partOfSpeech.length; i++) {

    var found = false;
    for(var x = 0; x < wordTypes.length; x++) {
      //console.log("Comparing: " + partOfSpeech[i] + " and " + wordTypes[x].words.toString());
      if(partOfSpeech[i] == wordTypes[x].symbol) {
        //console.log("Adding " + wordTypes[x].symbol + " for \"" + line + "\"");
        //console.log("pushing word to " + wordTypes[x].symbol);
        found = true;
        wordTypes[x].words.push(word);
        break;
      }
    }
    //console.log("found match!");
  }

});

console.log("***** DONE parsing word list.");
// END load word database

//Log Errors instead of Crashing "Hopefully" TM
bot.addListener('error', function(message) {
  console.log('error: ', message);
});

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
    bot.say (from, "Nominatives Parsed: " + wordTypes[14].words.length);
  }

  console.log("index: " + message.indexOf(config.botName));

  var m = "I ";
  if (message.indexOf(config.botName) != -1) {
    //bot.say(to, "Hello and welcome!  My name is " + config.botName);
    var verbChoice = Math.floor((Math.random() * wordTypes[3].words.length) + 1);
    var nounChoice = Math.floor((Math.random() * wordTypes[0].words.length) + 1);
    var noun = wordTypes[0].words[nounChoice];
    var verb = wordTypes[3].words[verbChoice];

    m += verb;

    if(noun[0].toLowerCase() == "a" || noun[0].toLowerCase() == "e" || noun[0].toLowerCase() == "i" || noun[0].toLowerCase() == "o" || noun[0].toLowerCase() == "u") {
      m += " an ";
    } else {
      m += " a ";
    }

    m += noun;

    bot.say(to, m);
  }
});
// End About

