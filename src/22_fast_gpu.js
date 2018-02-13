function GraphNode(pos, edges) {
  this.pos = new Vector(Math.random() * 1000,
                        Math.random() * 1000);
  this.edges = [];
}
GraphNode.prototype.connect = function(other) {
  this.edges.push(other);
  other.edges.push(this);
};
GraphNode.prototype.hasEdge = function(other) {
  for (var i = 0; i < this.edges.length; i++)
    if (this.edges[i] == other)
      return true;
};

function treeGraph(depth, branches) {
  var graph = [];
  function buildNode(depth) {
    var node = new GraphNode();
    graph.push(node);
    if (depth > 1)
      for (var i = 0; i < branches; i++)
        node.connect(buildNode(depth - 1));
    return node;
  }
  buildNode(depth);
  return graph;
}

var springLength = 40;    //40
var springStrength = 100.1;  //0.1

var repulsionStrength = 1500;    //1500

var graflength = 400  //1500               //hier muss man die Anzahl Knoten einstellen


function runLayout(implementation, graph) {         


    //???????graph is global in this function, make graf and has_edge global as well so wie graflength
	
	graflength = graph.length

	alert(graflength)


	  //initialize an empty array of the size #knoten * 2 (x,y werte) for the input values
	  var graf = [];
	  for (var a = 0; a < graph.length; a++){
		graf[a] = [];
		for (var b = 0; b < 2; b++){
		  graf[a][b] = 0;
		}
	  }

	  
	  //initialize an empty array #knoten^2 for the has edge values
	  var has_edge = [];
	  for (var a = 0; a < graph.length; a++){
		has_edge[a] = [];
		for (var b = 0; b < graph.length; b++){
		  has_edge[a][b] = 0;
		}
	  }



	  //initialize an empty array for the gpu-return values of the size #knoten * x,y werte for the input values
//	  var ret_graf = [];
//	  for (var a = 0; a < graph.length; a++){
//		ret_graf[a] = [];
//		for (var b = 0; b < 2; b++){
//		  ret_graf[a][b] = 0;
//		}
//	  }
	  
	  

	//copy graph-object values to graf-array
	for (var i = 0; i < graph.length; i++) {
		graf[i][0] = graph[i].pos.x;
		
		graf[i][1] = graph[i].pos.y;
		
		//if node has edge then set graf zeile 2 auf 1
		for (var z = 0; z < graph.length; z++) {
		  if (i === z) {has_edge[i][z]=0; continue;}   //not sure if gpu.js supports continue
		  if (graph[i].hasEdge(graph[z]))
			has_edge[i][z] = 1;
		  }
    }





	
  var totalSteps = 0, time = 0;
  function step() {
    var startTime = Date.now();
    for (var i = 0; i < 1; i++){  //hier Wert i auf zB 10 setzen damit draw nicht jedes mal laeuft
 
      //forceDirected_gpu(graf, has_edge)    //!!!!!ist alt und wird nicht mehr geraucht, die Fkt gibt graphLenth x graphLenth x 2 array zurück
	
	  // die neue GPU-Funktion grafXY kombiniert die alten, separaten Funktionen X und Y
     
	 ret_grafXY = myGPUfuncXY(graf, has_edge); 


	
		//kumuliere die gpu berechneten forces aus ret_grafXY zurück ins graf-array
      for (var i = 0; i < graflength; i++){
        for (var j = 0; j < graflength; j++){
		graf[i][0] += ret_grafXY[0][j][i]; graf[i][1] += ret_grafXY[1][j][i];  //im Level [0] sind die old grafX-forces im [1] die old grafY-forces
		graf[j][0] -= ret_grafXY[0][j][i]; graf[j][1] -= ret_grafXY[1][j][i];
		}
      }
	
	};        //??????graf ist in and out vorher wurde immer über graph umgerechnet
    totalSteps += 1;       // und dann steps auch auf 10 setzen
    time += Date.now() - startTime;


    //copy graf-array values back to graph-object damit draw_graph funktioniert
    for (var i = 0; i < graph.length; i++) {
//      graph[i].pos.x += ret_graf[i][0];
//      graph[i].pos.y += ret_graf[i][1];
      graph[i].pos.x += graf[i][0];
      graph[i].pos.y += graf[i][1];
    }

    drawGraph(graph);                  //konvertiere graf back to graph before calling drawGraph

    if (totalSteps < 4000)
      requestAnimationFrame(step);
    else
	  alert("finished");	
      //console.log(time);
  }
  step();
}


    const gpu = new GPU();  // ????????????????????????????????????

	
/*				function createFuncX(mode) {
				var opt = {
					dimensions: [341, 341],
					mode: mode
				};

				return gpu.createKernel(function(graf){
						// for (var i = 0; i < graph.length; i++) {
						if (this.thread.x == this.thread.y) return 0;
						var nodeX = graf[this.thread.x][0][0];  //i
						var nodeY = graf[this.thread.x][1][0];
						//var nodeZ = graf[i][2][0];
						//for (var j = i + 1; j < graph.length; j++) {
						var otherX = graf[this.thread.y][0][0];  //j
						var otherY = graf[this.thread.y][1][0];  //j
						var apartX = otherX - nodeX;
						var apartY = otherY - nodeY;
						var distance = Math.max(1, Math.sqrt(apartX * apartX + apartY * apartY));
						var forceSize = -1500 / (distance * distance);
						if (graf[this.thread.x][2][this.thread.y] == 1)    //(node.hasEdge(other))    ?????????????????????????????????????????????
							forceSize += (distance - 40) * 0.1;

						var forceX = apartX * forceSize / distance;
						//var forceY = apartY * forceSize / distance;
					return forceX; //????????????????????''
				}, opt);
			}


			function createFuncY(mode) {
				var opt = {
					dimensions: [341, 341],
					mode: mode
				};

				return gpu.createKernel(function(graf){
						// for (var i = 0; i < graph.length; i++) {
						if (this.thread.x == this.thread.y) return 0;
						var nodeX = graf[this.thread.x][0][0];  //i
						var nodeY = graf[this.thread.x][1][0];
						//var nodeZ = graf[i][2][0];
						//for (var j = i + 1; j < graph.length; j++) {
						var otherX = graf[this.thread.y][0][0];  //j
						var otherY = graf[this.thread.y][1][0];  //j
						var apartX = otherX - nodeX;
						var apartY = otherY - nodeY;
						var distance = Math.max(1, Math.sqrt(apartX * apartX + apartY * apartY));
						var forceSize = -1500 / (distance * distance);
						if (graf[this.thread.x][2][this.thread.y] == 1)    //(node.hasEdge(other))    ?????????????????????????????????????????????
							forceSize += (distance - 40) * 0.1;

						//var forceX = apartX * forceSize / distance;
						var forceY = apartY * forceSize / distance;
					return forceY; //????????????????????''
				}, opt);
			}

    var myGPUfuncX = createFuncX('gpu');
	var myGPUfuncY = createFuncY('gpu');
*/

	
	const opt = {
		output: [graflength, graflength, 2],    //im 2x2 array auf layer 0 sind die X-forces im layer 1 die Y-forces
		mode: 'gpu'
		//old gpu.js syntax was ...
		//dimensions:  [graflength, graflength], //[341, 341], //[121, 121], //[85, 85] ,  //[graf_length,graf_length,graf_length],   // ???? define graph.length  ???????????
		//mode: 'gpu'    // or cpu
	};

//diese Kernel Funktion gibt die Kräfte X und Y zurück

    const myGPUfuncXY = gpu.createKernel(function(graf, has_edge){
	  
	// for (var i = 0; i < graph.length; i++) {
          if (this.thread.x == this.thread.y) return 0;
	      var nodeX = graf[this.thread.x][0];  //i
		  var nodeY = graf[this.thread.x][1];
		  //var nodeZ = graf[i][2][0];
		  //for (var j = i + 1; j < graph.length; j++) {
			var otherX = graf[this.thread.y][0];  //j
			var otherY = graf[this.thread.y][1];  //j
			var apartX = otherX - nodeX;
			var apartY = otherY - nodeY;
			var distance = Math.max(1, Math.sqrt(apartX * apartX + apartY * apartY));
			var forceSize = -1500 / (distance * distance);
			if (has_edge[this.thread.x][this.thread.y] == 1)    //(node.hasEdge(other))    ?????????????????????????????????????????????
				forceSize += (distance - 40) * 0.1;

			var forceX = apartX * forceSize / distance;
			var forceY = apartY * forceSize / distance;
			var forceXY = 0;
			if (this.thread.z == 0) {
				forceXY = forceX;
			}else{
				forceXY = forceY;	
			}
    	return forceXY; // old was X ????????????????????''
    }, opt);

//wird wegen XY das beide kobinert nicht mehr gebraucht
//    const myGPUfuncY = gpu.createKernel(function(graf, has_edge){
		
	// for (var i = 0; i < graph.length; i++) {
//          if (this.thread.x == this.thread.y) return 0;
//	      var nodeX = graf[this.thread.x][0];  //i
//		  var nodeY = graf[this.thread.x][1];
//		  //var nodeZ = graf[i][2][0];
//		  //for (var j = i + 1; j < graph.length; j++) {
//			var otherX = graf[this.thread.y][0];  //j
//			var otherY = graf[this.thread.y][1];  //j
//			var apartX = otherX - nodeX;
//			var apartY = otherY - nodeY;
//			var distance = Math.max(1, Math.sqrt(apartX * apartX + apartY * apartY));
//			var forceSize = -1500 / (distance * distance);
//			if (has_edge[this.thread.x][this.thread.y] == 1)    //(node.hasEdge(other))    ?????????????????????????????????????????????
//				forceSize += (distance - 40) * 0.1;
//
//			//var forceX = apartX * forceSize / distance;
//			var forceY = apartY * forceSize / distance;
//    	return forceY; //????????????????????''
//    }, opt);

	
			

	
//Ziel: modifie forceDirected_array to make it use
//      gpu.js

//13Feb 18 diese Fkt ist alt und wird nicht mehr aufgerufen, weil ihr Inhalt direkt in die Layout Fkt kopiert ist
function forceDirected_gpu(graf, has_edge) {                            //graph ist nun eigentlich graf, muss es aber noch umschreiben

/*
	  //initialize an array of the size graph.length^3
	  var graf = [];
	  for (var a = 0; a < graph.length; a++){
		graf[a] = [];
		for (var b = 0; b < graph.length; b++){
		  graf[a][b] = [];
		  for (var c = 0; c < graph.length; c++){
			  graf[a][b][c] = 0;
		  }
		}
	  }
*/


//     console.log(graph.length);

	
//    ret_grafX = myGPUfuncX(graf, has_edge);    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//    ret_grafY = myGPUfuncY(graf, has_edge);    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



    // die neue Funktion grafXY kombiniert die alten, separaten Funktionen X und Y
    ret_grafXY = myGPUfuncXY(graf, has_edge);    //!!!!!die Fkt gibt graphLenth x graphLenth x 2 array zurück


	
		//kumuliere die gpu berechneten forces aus ret_grafXY ins aufsummierte ret_graf array
      for (var i = 0; i < graflength; i++){
        for (var j = 0; j < graflength; j++){
//		ret_graf[i][0] += ret_grafXY[0][j][i]; ret_graf[i][1] += ret_grafXY[1][j][i];  //im Level [0] sind die old grafX-forces im [1] die old grafY-forces
//		ret_graf[j][0] -= ret_grafXY[0][j][i]; ret_graf[j][1] -= ret_grafXY[1][j][i];
		graf[i][0] += ret_grafXY[0][j][i]; graf[i][1] += ret_grafXY[1][j][i];  //im Level [0] sind die old grafX-forces im [1] die old grafY-forces
		graf[j][0] -= ret_grafXY[0][j][i]; graf[j][1] -= ret_grafXY[1][j][i];
		}
      }


  
  //alert("am ende");
}



var mangledGraph = treeGraph(4, 4);
mangledGraph.forEach(function(node) {
  var letter = Math.floor(Math.random() * 26);
  node[String.fromCharCode("A".charCodeAt(0) + letter)] = true;
});