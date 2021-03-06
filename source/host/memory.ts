///<reference path="../globals.ts" />

module TSOS{
	
	export class Memory{

		constructor(public memory = []){}

		public init(): void{
			for(var i = 0; i < 768; i++){
				this.memory.push(0);
			}
		}

		//Reads and return op codes(array) located in specific memory slot
		public read(memorySlotIndex): any{
			var operationArray = [];
			if(memorySlotIndex == 0){
				for(var i = 0; i < 256; i++){
					if(this.memory[i] != -1){ //End of OP Code
						operationArray.push(this.memory[i]);
					}else{
						this.memory[i] = 0;
						break;
					}
				}
			}else if(memorySlotIndex == 1){
				for(var i = 256; i < 512; i++){	
					if(this.memory[i] != -1){ //End of OP Code
						operationArray.push(this.memory[i]);
					}else{
						this.memory[i] = 0;
						break;
					}
				}
			}else if(memorySlotIndex == 2){
				for(var i = 512; i < 768; i++){	
					if(this.memory[i] != -1){ //End of OP Code
						operationArray.push(this.memory[i]);
					}else{
						this.memory[i] = 0;
						break;
					}
				}
			}
			return operationArray;
		}

		//Writes op codes into specific memory slot
		public write(memorySlotIndex, operation){
			var operationArray = operation.split(" ");
			var opCount = 0;
			if(memorySlotIndex == 0){
				for(var i = 0; i < 256; i++){
					if(i == operationArray.length){
						this.memory[i] = -1;
						break;
					}
					this.memory[i] = operationArray[opCount];
					opCount++;
				}
			}else if(memorySlotIndex == 1){
				for(var i = 256; i < 512; i++){
					if(opCount == operationArray.length){
						this.memory[i] = -1;
						break;
					}
					this.memory[i] = operationArray[opCount];
					opCount++;
				}
			}else if(memorySlotIndex == 2){
				for(var i = 512; i < 768; i++){
					if(opCount == operationArray.length){
						this.memory[i] = -1;
						break;
					}
					this.memory[i] = operationArray[opCount];
					opCount++;
				}
			}
		}

		//Erase everything
		public eraseAll(){
			this.init();
		}

		//Erases a specific block of memory's op codes
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