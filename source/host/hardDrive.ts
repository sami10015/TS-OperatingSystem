///<reference path="../globals.ts" />

module TSOS{

	export class hardDrive{
		constructor(public TSBList = []){}

		//Write data to the HDD
		public write(tsb, data){
			sessionStorage[tsb] = data;
		}

		//Return data from the HDD
		public read(tsb){
			return sessionStorage[tsb];
		}
	}
}