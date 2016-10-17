///<reference path="../globals.ts" />

module TSOS{
	
	export class Memory{

		constructor(public memory = []){}

		public init(): void{
			for(var i = 0; i < 768; i++){
				this.memory.push(0);
			}
		}

		public read(memorySlotIndex): any{
			var operationArray = [];
			if(memorySlotIndex == 0){
				for(var i = 0; i < 256; i++){
					if(this.memory[i] != 0){
						operationArray.push(this.memory[i]);
					}else{
						break;
					}
				}
			}else if(memorySlotIndex == 1){
				for(var i = 256; i < 512; i++){	
					if(this.memory[i] != 0){
						operationArray.push(this.memory[i]);
					}else{
						break;
					}
				}
			}else if(memorySlotIndex == 2){
				for(var i = 512; i < 768; i++){	
					if(this.memory[i] != 0){
						operationArray.push(this.memory[i]);
					}else{
						break;
					}
				}
			}
			return operationArray;
		}
		
		public write(memorySlotIndex, operation){
			var opCount = 0;
			if(memorySlotIndex == 0){
				for(var i = 0; i < 256; i++){
					if(opCount+2 > operation.length){
						break;
					}
					this.memory[i] = operation.substring(opCount, opCount+2); //Set Memory
					opCount+=3; //Incremement
				}
			}else if(memorySlotIndex == 1){
				for(var i = 256; i < 512; i++){
					if(opCount+2 > operation.length){
						break;
					}
					this.memory[i] = operation.substring(opCount, opCount+2); //Set Memory
					opCount+=3; //Incremement
				}
			}else if(memorySlotIndex == 2){
				for(var i = 512; i < 768; i++){
					if(opCount+2 > operation.length){
						break;
					}
					this.memory[i] = operation.substring(opCount, opCount+2); //Set Memory
					opCount+=3; //Incremement
				}
			}
		}

		public eraseAll(){
			this.init();
		}

		public eraseBlock(memorySlotIndex){
			if(memorySlotIndex == 0){
				for(var i = 0; i < 256; i++){
					this.memory[i] = 0;
				}
			}else if(memorySlotIndex == 1){
				for(var i = 256; i < 512; i++){
					this.memory[i] = 0;
				}
			}else if(memorySlotIndex == 2){
				for(var i = 512; i < 768; i++){
					this.memory[i] = 0;
				}
			}
		}
	}
}