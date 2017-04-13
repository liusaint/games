/**
* author:ls
* email:liusaint@gmail.com
* time:2016年1月
*/




var Mine = function  (ele,faceele,panewidth,paneheight,minenum,tagele,timeele) {
	this.PANE_SIZE = 16;//每个格子的像素px大小。
	this.paneheight = paneheight;//有几行
	this.panewidth = panewidth;//有几列
	this.minenum = minenum;//有几个雷
	this.ele = document.getElementById(ele);
	this.cxt = this.ele.getContext("2d");
	this.tagele = tagele;
	this.timeele = timeele;
	this.faceele = document.getElementById(faceele);

}

 //数组之间对比还是有点奇怪，有时候要用tostring()
 Mine.prototype = {
 	init:function(){
    //画格子
    this.ele.width = this.PANE_SIZE * this.panewidth;
    this.ele.height = this.PANE_SIZE * this.paneheight;
    this.faceele.src = "res/face_normal.bmp";

		this.oldPos = [0,0];//鼠标上一个停留的位置。默认值。用于处理hover事件。
		this.cellArr=[];//格子信息保存数组。保存每个格子是不是雷，当前是否有标记。
		this.mineArr=[];//地雷位置数组。
		this.time = 0;
		this.notTaged = this.minenum;
		this.numToImage(this.notTaged,this.tagele);
		this.numToImage(this.time,this.timeele);

		this.mousedownArr='';
		this.createCells();//初始化cellArr数组,并涂上颜色。
		this.inited = false;
		clearInterval(this.timer);
		//绑定事件
		this.onmousemove();//鼠标在上面移动，触发每个格子的
		this.onmouseout();//鼠标移出canvas的事件。
		this.onmousedown();
		this.onclick();//点击方格事件
		this.preRightMenu();//阻止右键菜单。
	},
	onmousemove:function(){

		var that = this;//传入this.
		this.ele.onmousemove = function(e){

			var pos = that.getCellPos(getEventPosition(e));
			var oldPos = that.oldPos;
			var cellArr = that.cellArr;

			if(pos.toString() == oldPos.toString()){//当前位置等于上一位置，return;
				return;
			}

			//如果上一个位置没被打开，就把上一个位置涂白
			if(that.checkCell(oldPos)&&(cellArr[oldPos[0]][oldPos[1]].isOpened == false && cellArr[oldPos[0]][oldPos[1]].tag == 0)){
				that.drawCell(oldPos,1);
			}

			//如果当前位置被打开了，新地址替换旧地址，return;
			if(that.checkCell(pos) && (cellArr[pos[0]][pos[1]].isOpened == true || cellArr[pos[0]][pos[1]].tag != 0 )){
				that.oldPos = pos;
				return;
			}

			that.drawCell(pos,2);
			that.oldPos = pos;

		}
	},

	onclick:function(){
		var that = this;
		this.ele.onmouseup = function(e){//点击事件。
			var pos = that.getCellPos(getEventPosition(e));
			if(that.inited==false){
					that.createMines(pos);//生成雷。第一次点击的时候，生成雷，并开始定时器计算时间。
					that.timer = setInterval(function(){		
						that.time =  that.time +1;
						that.numToImage(that.time,that.timeele);
					},1000);
					that.inited = true;
				}
				if (!e){ e=window.event;}
				that.triggerClick(pos,e);
			}
		},
		onmousedown:function(){
			var that = this;
			this.ele.onmousedown = function(e){
				var pos = that.getCellPos(getEventPosition(e));
				if (!e){ e=window.event;}
				var theCell = that.cellArr[pos[0]][pos[1]];
				if(theCell.isOpened == true){
				var aroundMineNum = that.calAround(pos);//周边有几个雷。
				var unknownArr = that.getAroundUnknown(pos)//周边有几个未打开的。
				var tagNum = that.getAroundTag(pos)//获取标记了的数量。

				if(aroundMineNum != tagNum){//标记的数量等于周围雷的数量，则直接点击周围的雷。
					for(var t=0,uLen = unknownArr.length;t<uLen;t++){
						that.drawNum(unknownArr[t],0);
					}
					that.mousedownArr = unknownArr;
				}
			}


		}
	},
	triggerClick:function(pos,e){
		var theCell = this.cellArr[pos[0]][pos[1]];

		if(theCell.isOpened == true){ //已经打开过的，周边操作。2.如果是经真正事件操作到达这里的。则进行周边操作。否则return

			if(e){

				var aroundMineNum = this.calAround(pos);//周边有几个雷。
				var unknownArr = this.getAroundUnknown(pos)//周边有几个未打开的。
				var tagNum = this.getAroundTag(pos)//获取标记了的数量。

				if(aroundMineNum == tagNum){//标记的数量等于周围雷的数量，则直接点击周围的格子。
					for(var t=0,uLen = unknownArr.length;t<uLen;t++){
						this.triggerClick(unknownArr[t]);
					}
				}else{
					var mousedownArr = this.mousedownArr;
					if(mousedownArr !=""){
						for (var m = 0,mLen = mousedownArr.length; m < mLen; m++) {
							this.drawCell(mousedownArr[m],1);
						};
					}
					this.mousedownArr = "";
				}
			}
			return;
		}
		var tag = theCell.tag;
		if(e && e.button == 2){//右键 标记雷	

			if(tag == 0){
				this.drawCell(pos,3);
				theCell.tag = 1;
				this.notTaged --;
				this.numToImage(this.notTaged,this.tagele);				
			}
			else if(tag == 1){
				this.drawCell(pos,4);
				theCell.tag = 2;
				this.notTaged ++;
				this.numToImage(this.notTaged,this.tagele);		
			}else if(tag == 2){
				this.drawCell(pos,1);
				theCell.tag = 0;
			}
			return;
		}
		if(tag!= 0 ){
			return;
		}

		if(theCell.isMine == true){// 如果点到的这个是雷，就判输。显示所有雷
			this.faceele.src = "res/face_fail.bmp";
			this.showMine();
			this.drawCell(pos,6);//点中的雷。
			this.showWrongTag();//将标记错误的显示出来。
			this.ele.onmouseup = '';
			this.ele.onmousedown = '';
			this.ele.onmousemove = '';
			clearInterval(this.timer);
		}else{//不是雷，显示周边有几个雷。
			this.drawNum(pos,0);
			var aroundMineNum = this.calAround(pos); //求数量				
			if(aroundMineNum!=0){
				this.drawNum(pos,aroundMineNum);//绘制不同颜色的数字
			}else{//等于0了，计算周边
				var zeroArr = [];
				zeroArr.push(pos);
				zeroArr = this.calZeroMine(pos,zeroArr);//获取所有的周边雷为0的。
				this.openZeroArr(zeroArr);//将周边雷为0的周边的打开。
			}
		}
		theCell.isOpened = true;
		//验证是否win.
		var okNum = this.panewidth * this.paneheight-this.minenum;
		var openNum = 0 ;
		for(var i=1;i<=this.panewidth;i++){

			for (var j = 1; j <= this.paneheight; j++) {
				if(this.cellArr[i][j].isOpened == true){
					openNum ++;
				}
			};

		}

		if(openNum == okNum){
			this.faceele.src = "res/face_success.bmp";
			alert("you win!");
			clearInterval(this.timer);
			this.ele.onmouseup = '';
			this.ele.onmousedown = '';
			this.ele.onmousemove = '';	
		}
	},
	getAroundUnknown:function(pos){//计算周边一共有几个雷
		var unknowArr = [];
		var cellArr = this.cellArr;
		var aroundArr = [[pos[0]-1,pos[1]-1],[pos[0]-1,pos[1]],[pos[0]-1,pos[1]+1],[pos[0],pos[1]-1],[pos[0],pos[1]+1],[pos[0]+1,pos[1]-1],[pos[0]+1,pos[1]],[pos[0]+1,pos[1]+1]];
		// var aroundUnknownNum = 0;
		for (var i = 0; i < aroundArr.length; i++) {
			if(this.checkCell(aroundArr[i])&&cellArr[aroundArr[i][0]][aroundArr[i][1]].tag==0&&cellArr[aroundArr[i][0]][aroundArr[i][1]].isOpened==false){
				unknowArr.push(aroundArr[i]);
			}
		};
		return unknowArr;
	},
	getAroundTag:function(pos){
		var cellArr = this.cellArr;
		var aroundArr = [[pos[0]-1,pos[1]-1],[pos[0]-1,pos[1]],[pos[0]-1,pos[1]+1],[pos[0],pos[1]-1],[pos[0],pos[1]+1],[pos[0]+1,pos[1]-1],[pos[0]+1,pos[1]],[pos[0]+1,pos[1]+1]];
		var tagNum = 0;
		for (var i = 0; i < aroundArr.length; i++) {
			if(this.checkCell(aroundArr[i])&&cellArr[aroundArr[i][0]][aroundArr[i][1]].tag==1){
				tagNum++;
			}
		};
		return tagNum;
	},
	onmouseout:function(){
		var that = this;
		this.ele.onmouseout = function(e){
			var pos = that.oldPos;
			if(that.checkCell(pos) && (that.cellArr[pos[0]][pos[1]].isOpened == true || that.cellArr[pos[0]][pos[1]].tag != 0)){
				return;
			}
			that.drawCell(pos,1);
			pos = [0,0];
		}
	},
	createCells:function(){//初始化cellArr，保存每个格子的状态。

		var  paneheight = 	this.paneheight;
		var  panewidth = this.panewidth;

		for(var i=1;i<=panewidth;i++){
			this.cellArr[i] = [];
			for (var j = 1; j <= paneheight; j++) {
				this.cellArr[i][j] = {
					isMine:false,
					isOpened:false,
					tag:0
				};
				this.drawCell([i,j],1)
			};
		}
	},
	showMine:function(){ //点到雷，引爆所有雷。
		var mineArr = this.mineArr;
		var pos='';
		var area;
		for (var i = 0; i < mineArr.length; i++) {
			pos = mineArr[i];
			this.drawCell(pos,5);
			this.cellArr[pos[0]][pos[1]].isOpened = true;//让所有雷变成已打开。
		};
	},
	showWrongTag:function(){//将标记错误的显示出来。
		var  paneheight = 	this.paneheight;
		var  panewidth = this.panewidth;

		for(var i=1;i<=panewidth;i++){
			for (var j = 1; j <= paneheight; j++) {
				if(this.cellArr[i][j].isMine == false && this.cellArr[i][j].tag == 1){
					this.drawCell([i,j],7);
				}
			};
		}
	},
	calAround:function(pos){//计算周边一共有几个雷
		var cellArr = this.cellArr;
		var aroundArr = [[pos[0]-1,pos[1]-1],[pos[0]-1,pos[1]],[pos[0]-1,pos[1]+1],[pos[0],pos[1]-1],[pos[0],pos[1]+1],[pos[0]+1,pos[1]-1],[pos[0]+1,pos[1]],[pos[0]+1,pos[1]+1]];
		var aroundMineNum = 0;
		for (var i = 0; i < aroundArr.length; i++) {
			aroundMineNum += this.checkMine(aroundArr[i]);
		};
		return aroundMineNum;
	},
	calZeroMine:function(pos,zeroArr){//使用递归求出周围所有的全为0的区域
		var cellArr = this.cellArr;
		// var aroundArr = [[pos[0]-1,pos[1]],[pos[0],pos[1]-1],[pos[0],pos[1]+1],	[pos[0]+1,pos[1]]];//只保留上下左右 好像还是会有一点问题。
		var aroundArr = [[pos[0]-1,pos[1]-1],[pos[0]-1,pos[1]],[pos[0]-1,pos[1]+1],[pos[0],pos[1]-1],[pos[0],pos[1]+1],[pos[0]+1,pos[1]-1],[pos[0]+1,pos[1]],[pos[0]+1,pos[1]+1]];
		var aroundMineNum = 0;
		for (var i = 0; i < aroundArr.length; i++) {
			aroundMineNum = this.calAround(aroundArr[i]);//附近雷的数量
			if(aroundMineNum == 0 && this.checkCell(aroundArr[i]) && cellArr[aroundArr[i][0]][aroundArr[i][1]].isMine == false &&!in_array(aroundArr[i],zeroArr)){
				zeroArr.push(aroundArr[i]);
				this.calZeroMine(aroundArr[i],zeroArr);
			}
		};
		return zeroArr;
	},
	openZeroArr:function(zeroArr){//显示数组里每个格子周边8个格子中所包含雷的个数。
		for (var i = 0; i < zeroArr.length; i++) {
			if(!this.checkMine(zeroArr[i])){
				this.openZero(zeroArr[i]);
			}			
		};
	},
	openZero:function(pos){//显示一个周边雷数量为0的格子周边8个格子包含几个雷。
		var cellArr = this.cellArr;
		var aroundArr = [[pos[0]-1,pos[1]-1],[pos[0]-1,pos[1]],[pos[0]-1,pos[1]+1],[pos[0],pos[1]-1],[pos[0],pos[1]+1],[pos[0]+1,pos[1]-1],[pos[0]+1,pos[1]],[pos[0]+1,pos[1]+1]];
		var aroundMineNum = 0;
		for (var i = 0; i < aroundArr.length; i++) {
			if(this.checkCell(aroundArr[i])){
				cellArr[aroundArr[i][0]][aroundArr[i][1]].isOpened = true;
				aroundMineNum = this.calAround(aroundArr[i]);//附近雷的数量
				this.drawNum(aroundArr[i],aroundMineNum);
			}

		}

	},
	drawCell:function(pos,type){//绘制不同种类的格子。
		var area =  this.getCellArea(pos);
		var cxt = this.cxt;
		var image = new Image();
		var src;
		var srcArr = ["res/blank.bmp","res/0.bmp","res/flag.bmp","res/ask.bmp","res/mine.bmp","res/blood.bmp","res/error.bmp"];
		//1正常格 2mouseover格子 3旗子格 4问号格 5正常雷格 6点中雷格 7.错误标记
		var index  = type -1;
		image.src =srcArr[index];
		image.onload = function(){
			cxt.drawImage(image,area[0],area[1],16,16);
		}
	},
	drawNum:function(pos,num){//绘制数字
		var area =  this.getCellArea(pos);
		var cxt = this.cxt;
		var image = new Image();
		image.src = "res/"+num+".bmp";
		image.onload = function(){
			cxt.drawImage(image,area[0],area[1],16,16);
		}
	},
	checkCell:function(pos){//检测位置有效性。
		return this.cellArr[pos[0]] && this.cellArr[pos[0]][pos[1]] ;
	},
	createMines:function(pos){	//生成雷的位置。保存到一个数组[[2,3],[4,6]];	

		var minenum = this.minenum;
		var mineArr = this.mineArr;
		var mineItem='';
		var cellArr = this.cellArr;

		for (var i = 0; i < minenum; i++) {
			//如果生成的重复了就重新生成。
			do{
				mineItem = [getRandom(this.panewidth),getRandom(this.paneheight)];
			}while(in_array(mineItem,mineArr)||pos.toString()== mineItem.toString());
			cellArr[mineItem[0]][mineItem[1]].isMine = true;
			mineArr.push(mineItem);
		};

	},
	checkMine:function(pos){//返回该位置是不是雷。		
		var cellArr = this.cellArr;
		if(this.checkCell(pos) && cellArr[pos[0]][pos[1]].isMine == true){
			return  true;
		}
		return false;
	},	
	getCellArea:function(pos){//根据格子坐标返回一个格子左上角的像素坐标[32,666];		
		return [(pos[0]-1)*this.PANE_SIZE+1,(pos[1]-1)*this.PANE_SIZE+1];
	},
	getCellPos:function(coordinate){//根据像素坐标返回格子坐标。[3,5];		
		return [Math.ceil(coordinate.x/this.PANE_SIZE),Math.ceil(coordinate.y/this.PANE_SIZE)];
	},
	preRightMenu:function(){//阻止右键菜单
		this.ele.oncontextmenu=function(event) {
		    if (document.all) window.event.returnValue = false;// for IE
		    else event.preventDefault();
		}
	},
	numToImage:function (num,ele){
		if(num>999){
			num = 999;
		}else if(num<0){
			num = 000;
		}else if(num<10){
			num = "00"+num;
		}	else if(num< 100){
			num = "0"+num;
		}
		var ele = document.getElementsByClassName(ele)[0].getElementsByTagName('img');

		for (var i = 0,eLen=ele.length; i < eLen; i++) {
			ele[i].src="res/d"+num.toString().charAt(i)+".bmp";
		};

	}
}

//获取坐标：解决canvas在高分屏缩放150%之后坐标计算不准确的问题。
//https://github.com/zbinlin/blog/blob/master/getting-mouse-position-in-canvas.md
function getEventPosition(evt){   
	    var x, y;   
    var x = evt.clientX;
    var y = evt.clientY;
    var rect =  document.getElementById('mine1').getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    return {x: x, y: y};   
}

//生成随机正整数
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}

//判断一个数组是否在另一个数组中。
function in_array(stringToSearch, arrayToSearch) {
	for (s = 0; s < arrayToSearch.length; s++) {
		thisEntry = arrayToSearch[s].toString();
		if (thisEntry == stringToSearch.toString()) {
			return true;
		}
	}
	return false;
}
