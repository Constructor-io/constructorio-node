import Search from "./search";
import Browse from "./browse";
import Autocomplete from "./autocomplete";
import Recommendations from "./recommendations";
import Tracker from "./tracker";
import Catalog from "./catalog";
import Tasks from "./tasks";
import Quizzes from "./quizzes";

import { ConstructorClientOptions } from "./types";

export = ConstructorIO;

declare class ConstructorIO {
	constructor(options: ConstructorClientOptions); 
	private options: ConstructorClientOptions;
	search: Search;
	browse: Browse;
	autocomplete: Autocomplete;
	recommendations: Recommendations;
	tracker: Tracker;
	catalog: Catalog;
	tasks: Tasks;
	quizzes: Quizzes; 
}