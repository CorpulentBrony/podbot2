# podbot2

## **_notices your bot_**

### OwO what's this?

`podbot2` is a completely re-written version of[`podbot`].  It is a [Discord] bot written in JavaScript to run on [Node.js] by leveraging the [discord.js] API.

## Can I add it to my server?

I probably haven't marked it as public yet, but if you want to add my running implementation of the bot the URL to add it to your server and ensure it has adequate permissions will be: <https://discordapp.com/api/oauth2/authorize?client_id=479736033223901196&permissions=60488&scope=bot>.  Again, unless I make it public this URL probably won't work for you.

## Why a new repository?

I completely re-wrote all the code from scratch, and rather than try to deal with that mess in an existing repository I decided it'd be easier for my sanity to do this as a brand new one.  Sorry.

## What does it do now?

The bot can respond to commands in any channels where it has permission to do so if the command is prepended by the command string (configurable; by default this is `!`).  The bot will also respond via DM if the command is sent without the command string.  Results for search commands are given in such a way as to allow the user to scroll through them using reacts that the bot adds to the message.

Commands are separated into three types: independent, API request, and extended API request.  Most of this has to do with how the command is implemented, though they all must extend the [`AbstractCommand`](commands/AbstractCommand.mjs) static interface and implement the `exec()` method thereof.

### Independent Commands

These commands are separate and individual from anything else, with all the code behind their implementations stored in separate files in the [`commands` subdirectory](commands/).

* `ignore`  
<code>ignore *user*</code>  
<code>ignore delete *user*</code>  
<code>ignore remove *user*</code>  
**Source:** [`ignore.mjs`](commands/ignore.mjs)

  This command can only be used by a bot admin (defined at the top of the [Bot.mjs](Bot.mjs) file).  If given with no arguments, will display a list of users currently on the ignore list.  If given with just a user mention, will add that user to the ignore list.  If the command begins with `remove` or `delete` followed by one or more user mentions, will remove those users from the ignore list.  The bot will simply ignore all users on the ignore list, including all commands and reactions.  You cannot ignore someone in the admin list.
* `ping`  
**Source:** [`ping.mjs`](commands/ping.mjs)

  Will show the current and average ping times to the bot's server. The current ping time is based on the timestamp value attached to the command's message and the server's timestamp. The average is from whatever magic the [discord.js] API uses.

### API Request Commands

These commands leverage implementations of the [`HttpRequest`](requests/HttpRequest.mjs) class and are used to query external services via API calls.  Since the commands are nearly identical outside of this, they all implement the more specialized [`AbstractApiRequestCommand`](commands/AbstractApiRequestCommand.mjs) interface which includes a common `exec()` method.  All of these commands are defined in [a single file](commands/ApiRequestCommands.mjs).

* <code>derpibooru *search*</code>  
<code>derpibooru *id*</code>  
**Alias:** `db`

  Searches [Derpibooru] for the given search term (or image ID) and returns a randomized page from the search results with the results on that page randomized as well (so earch search will likely return different results in a different order).  Supports full search syntax from the Derpibooru site.  Must specify either a search phrase or an image ID.
* <code>fimfiction *search*</code>  
**Alias:** `ff`

  Searches stories posted at [Fimfiction] for the given search term.
* `fourchan`  
<code>fourchan *search*</code>  
<code>fourchan *id*</code>  
**Alias:** `4chan`, `4`

  Searches OP threads from the [/mlp/] board (configurable) on [4chan] for the given search term or thread ID.  If no argument is given, will just return a random thread from the /mlp/ board.  If a thread ID is given, then the returned results will include all posts within the thread.
* <code>google *search*</code>  
**Alias:** `g`, `search`

  Searches [Google] for the given search term and returns the ten most applicable answers.  Supports full search syntax.
* <code>image *search*</code>  
**Alias:** `img`, `i`

  Searches [Google images] for the given search term and returns the ten most applicable images.  Supports full search syntax.
* <code>youtube *search*</code>  
**Alias:** `yt`

  Searches [YouTube] for the given search term and returns the most applicable videos, supports full YouTube search syntax.  Must specify a search phrase.

### Extended API Request Commands

These commands extend one of the API request commands above and are often shortcuts that provide a specific search term to their parent command.  Each of these should extend the class of its parent command and contain a simplified `exec()` method that calls its parent with arguments specified.  Since the definitions of these commands are so simple, they are all defined in [a single file](commands/ExtendedApiRequestCommands.mjs).

* `ass`

  Performs a [YouTube] search for the video with ID [`ySEbw4come0`](https://www.youtube.com/watch?v=ySEbw4come0).
* `ntt`

  Performs a search on [/mlp/] for the term `nightly twilight` and returns the first thread.

* `plush`

  Performs a search on [/mlp/] for the term `plush` and returns the first thread.

## What else might it do in the future?

So far I can't think of anything else.  What would you like to see?  Open an issue and let me know if you have any ideas.

## Who is best horse?

[Twilight Sparkle] of course.

[/mlp/]: https://www.4chan.org/mlp/
[4chan]: https://www.4chan.org/
[Derpibooru]: https://www.derpibooru.org/
[Discord]: https://discordapp.com/
[discord.js]: https://discord.js.org/
[Fimfiction]: https://www.fimfiction.net/
[Google]: https://www.google.com/
[Google images]: https://images.google.com/
[Node.js]: https://nodejs.org/
[`podbot`]: https://github.com/CorpulentBrony/podbot
[Twilight Sparkle]: https://horse.best/
[YouTube]: https://youtube.com/