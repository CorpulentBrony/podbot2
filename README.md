# podbot2

## **_notices your bot_**

## OwO what's this?

`podbot2` is a completely re-written version of[`podbot`](https://github.com/CorpulentBrony/podbot).  It is a [Discord](https://discordapp.com/) bot written in JavaScript to run on [Node.js](https://nodejs.org/) by leveraging the [discord.js](https://discord.js.org/) API.

## Why a new repository?

I am completely re-writing all the code from scratch, and rather than try to deal with that mess in an existing repository I decided it'd be easier for my sanity to do this as a brand new one.  Sorry.

## What does it do now?

Bot can respond to commands in any channels where it has permission to do so if the command is prepended by the command string (configurable; by default this is `!`).  The bot will also respond via DM if the command is sent without the command string.

* <code>4chan <var>search</var> | <var>id</var></code> - Searches OP threads from the [/mlp/](https://www.4chan.org/mlp/) board (configurable) on [4chan](https://www.4chan.org/) for the given search term or thread ID.  If no argument is given, will just return a random thread from the /mlp/ board.  If a thread ID is given, then the returned results will include all posts within the thread that the users can scroll through using the reacts added to the message returned by the bot.
* <code>db <var>**search**</var> | <var>**id**</var></code> - Searches [Derpibooru](https://www.derpibooru.org/) for the given search term (or image ID) and returns a randomized page from the search results with the results on that page randomized as well.  Supports full search syntax from the Derpibooru site.  Must specify either a search phrase or an image ID.  Users can scroll through the results using the reacts added to the message returned by the bot.
* <code>ignore <var>remove | delete</var> <var>user mention</var></code> - This command can only be used by a bot admin (defined at the top of the [Bot.mjs](Bot.mjs) file).  If given with no arguments, will display a list of users currently on the ignore list.  If given with just a user mention, will add that user to the ignore list.  If the command begins with *remove* or *delete* followed by one or more user mentions, will remove those users from the ignore list.  The bot will simply ignore all users on the ignore list, including all commands and reactions.  You cannot ignore someone in the admin list.
* `ping` - Will show the current and average ping times to the bot's server. The current ping time is based on the timestamp value attached to the command's message and the server's timestamp. The average is directly from the discord.js API.

## What will it be able to do?

In addition to what it can already do as listed above: [Google](https://google.com), [Google image](https://images.google.com/), and [YouTube](https://youtube.com) searches, all using their respective APIs.  More documentation to come as more functions are implemented.

## Who is best horse?

[Twilight Sparkle](https://horse.best/) of course.