///<reference path="../globals.ts" />

module TSOS{
	
	export class Memory{

		constructor(public memory = []){}

		public init(): void{
			for(var i = 0; i < 768; i++){
				this.memory.push(0);
			}
		}

		public read(memorySlotIndex){
			if(memorySlotIndex == 0){

			}else if(memorySlotIndex == 1){

			}else if(memorySlotIndex == 2){

			}
		}
		
		public write(memorySlotIndex, operation){

		}
	}
}