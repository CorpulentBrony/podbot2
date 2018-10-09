import { AbstractApiRequestCommand } from "./AbstractApiRequestCommand";
import * as Requests from "/requests/";
import SETTINGS from "/settings";

export class derpibooru extends AbstractApiRequestCommand {}
[derpibooru.ALIASES, derpibooru.ApiRequest] = [SETTINGS.COMMANDS.ALIASES.DERPIBOORU, Requests.Derpibooru];

export class fimfiction extends AbstractApiRequestCommand {}
[fimfiction.ALIASES, fimfiction.ApiRequest] = [SETTINGS.COMMANDS.ALIASES.FIMFICTION, Requests.Fimfiction];

export class fourchan extends AbstractApiRequestCommand {}
[fourchan.ALIASES, fourchan.ApiRequest, fourchan.areArgsOptional] = [SETTINGS.COMMANDS.ALIASES.FOURCHAN, Requests.FourChan, true];

export class google extends AbstractApiRequestCommand {}
[google.ALIASES, google.ApiRequest] = [SETTINGS.COMMANDS.ALIASES.GOOGLE, Requests.Google.Search];

export class image extends AbstractApiRequestCommand {}
[image.ALIASES, image.ApiRequest] = [SETTINGS.COMMANDS.ALIASES.IMAGE, Requests.Google.Image];

export class youtube extends AbstractApiRequestCommand {}
[youtube.ALIASES, youtube.ApiRequest] = [SETTINGS.COMMANDS.ALIASES.YOUTUBE, Requests.Google.YouTube];