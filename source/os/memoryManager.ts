///<reference path="../globals.ts" />

module TSOS{
	
	export class MemoryManager{

		constructor(public memorySpace = [0,0,0],
					public PID_Memory_Loc = [-1,-1,-1]){}

		public init(): void{}

		public clearAll(){

		}

		public displayBlock(operation): number{
			//Change process memory table
	        var table = (<HTMLInputElement>document.getElementById("processMemTable"));
	        var fullCount = 0; //If this reaches three, you can't load anymore
	        var index = -1; //Variable to keep track of where PID is being loaded into 
	        //Fill process memory table, if space allows
	        for(var i = 0; i < this.memorySpace.length; i++){
	            if(this.memorySpace[i] == 0){
	                if(i == 0){ //If 0 then 0-255, and so on
	                    index = i;
	                    var opCount = 0; //Variable to hold operation substring position
	                    for(var i = 0; i <= 32; i++){
	                        var row = table.getElementsByTagName("tr")[i];
	                        for(var j = 1; j < 9; j++){
	                            if(opCount+2 > operation.length){ //Nothing is left in the operation
	                                row.getElementsByTagName("td")[j].innerHTML = '0';
	                            }else{ //Still operations to print to the memory board
	                                row.getElementsByTagName("td")[j].innerHTML = operation.substring(opCount, opCount+2);
	                                opCount += 3;
	                            }
	                        }
	                    }
	                    this.memorySpace[0] = 1; //Memory space is used
	                }else if(i == 1){
	                    index = i;
	                    var opCount = 0; //Variable to hold operation substring position
	                    for(var i = 33; i <= 64; i++){
	                        var row = table.getElementsByTagName("tr")[i];
	                        for(var j = 1; j < 9; j++){
	                            if(opCount+2 > operation.length){ //Nothing is left in the operation
	                                row.getElementsByTagName("td")[j].innerHTML = '0';
	                            }else{ //Still operations to print to the memory board
	                                row.getElementsByTagName("td")[j].innerHTML = operation.substring(opCount, opCount+2);
	                                opCount += 3;
	                            }
	                        }
	                    }
	                    this.memorySpace[1] = 1; //Memory space is used(2nd block)
	                }else if(i == 2){
	                    index = i;
	                    var opCount = 0; //Variable to hold operation substring position
	                    for(var i = 65; i <= 96; i++){
	                        var row = table.getElementsByTagName("tr")[i];
	                        for(var j = 1; j < 9; j++){
	                            if(opCount+2 > operation.length){ //Nothing is left in the operation
	                                row.getElementsByTagName("td")[j].innerHTML = '0'; 
	                            }else{ //Still operations to print to the memory board
	                                row.getElementsByTagName("td")[j].innerHTML = operation.substring(opCount, opCount+2);
	                                opCount += 3;
	                            }
	                        }
	                    }
	                    this.memorySpace[2] = 1; //Memory space is used(3rd block)
	                }
	                break; //Leave loop
	            }else{ //Memory Space is full
	                fullCount += 1;
	            }
	        }

	        return index;
		}

	

		public clearBlock(pID){
			for(var i = 0; i < this.PID_Memory_Loc.length; i++){
                if(this.PID_Memory_Loc[i] == pID){
                    var table = (<HTMLInputElement>document.getElementById("processMemTable"));
                    if(i == 0){
                        this.PID_Memory_Loc[0] = -1; //Free that space
                        this.memorySpace[0] = 0; //Free that space
                        for(var i = 0; i <= 32; i++){
                            var row = table.getElementsByTagName("tr")[i];
                            for(var j = 1; j < 9; j++){
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }else if(i == 1){
                        this.PID_Memory_Loc[1] = -1; //Free that space
                        this.memorySpace[1] = 0; //Free that space
                        for(var i = 33; i <= 64; i++){
                            var row = table.getElementsByTagName("tr")[i];
                            for(var j = 1; j < 9; j++){
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }else if(i == 2){
                        this.PID_Memory_Loc[2] = -1; //Free that space
                        this.memorySpace[2] = 0; //Free that space
                        for(var i = 65; i <= 96; i++){
                            var row = table.getElementsByTagName("tr")[i];
                            for(var j = 1; j < 9; j++){
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    break;
                }
            }
		}

		public hexToDec(input){

		}
	}
}