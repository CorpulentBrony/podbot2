import { AbstractApiRequestCommand } from "./AbstractApiRequestCommand";
import * as Requests from "/requests/";

const ALIASES = {
	derpibooru: ["db"],
	fimfiction: ["ff"],
	fourchan: ["4chan", "4"],
	google: ["g", "search"],
	image: ["i", "img"],
	youtube: ["yt"]
};

export class derpibooru extends AbstractApiRequestCommand {}
[derpibooru.ALIASES, derpibooru.ApiRequest] = [ALIASES.derpibooru, Requests.Derpibooru];

export class fimfiction extends AbstractApiRequestCommand {}
[fimfiction.ALIASES, fimfiction.ApiRequest] = [ALIASES.fimfiction, Requests.Fimfiction];

export class fourchan extends AbstractApiRequestCommand {}
[fourchan.ALIASES, fourchan.ApiRequest, fourchan.areArgsOptional] = [ALIASES.fourchan, Requests.FourChan, true];

export class google extends AbstractApiRequestCommand {}
[google.ALIASES, google.ApiRequest] = [ALIASES.google, Requests.Google.Search];

export class image extends AbstractApiRequestCommand {}
[image.ALIASES, image.ApiRequest] = [ALIASES.image, Requests.Google.Image];

export class youtube extends AbstractApiRequestCommand {}
[youtube.ALIASES, youtube.ApiRequest] = [ALIASES.youtube, Requests.Google.YouTube];