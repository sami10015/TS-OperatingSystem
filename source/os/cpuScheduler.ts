///<reference path="../globals.ts" />

module TSOS{
	export class cpuScheduler{
		//The plan for the cpu Scheduler is to use arrays and indexes to keep track of whats running and what isnt
		//Use count to check if it is up to the quantum, if so, context switch
		constructor(public quantum = 6,
					public count = 0,
					public RR = false,
					public currentPid = -1,
					public loaded = [],
					public PCList = [],
					public StateList = []){}

		public contextSwitch(){

		}

		public roundRobin(){
			
		}
	}
}