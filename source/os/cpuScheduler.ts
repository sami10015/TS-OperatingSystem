///<reference path="../globals.ts" />
///<reference path="queue.ts" />

module TSOS{
	export class cpuScheduler{
		constructor(public quantum = 6,
					public count = 0,
					public RR = false,
					public residentList = [],
					public readyQueue = new Queue()){}


		public contextSwitch(){
			//Round Robin Scheduling
			if(this.RR){

			}
		}

		//This function is used along with the clearmem command to clear everything in the scheduler as well
		public clearMem(){
			this.residentList = [];
			this.readyQueue.q = new Array();
		}
	}
}