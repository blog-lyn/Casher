//var config = require('./config') ;
//var fs = require('fs');

"use strict";

var async = require('async');

var  shoppinglist    =  require('./shoppinglist.json')
var  productStock    =  require('./database.json')

// 可以进一步重构 把方法封装到放到下面三个对象当中（billListt，receiptList）
// 需要进一步重构 增加对参数的校验 以及增加捕捉错误的机制

var  billList = [ ];
var  receiptList =[ ];
var  getOneFreeList = [ ] ;


var  savingMount = 0;
var  inTotal = 0;


async.mapSeries(shoppinglist, getDataReady,function(err, results){
	
	if(err){
		 console.error(err);
	}
	else{

		 (function generateReceipt(data){

				savingMount =  0;
				inTotal  =  0;
				let  line  = {};

				//  输出收据表头

				console.log('*** Shopping  Receipt ***' );
				console.log('--------------------------'); 
				
				// 输出收据项目

				for(let ele of data){

						if (ele.getOneFree!=0){
							getOneFree(ele.product, ele.price,ele.quantity,ele.getOneFree);
						} else if (ele.discount != 1){			
							getDiscount(ele.product, ele.price,ele.quantity, ele.discount);			
						} else  {
							getSum(ele.product, ele.price,ele.quantity);	
						}

				}

				//  输出买一送一的账单
				if (getOneFreeList.length>1){

						console.log('--------------------------'); 
						console.log('Buy X Get X For Free Products:');

						for (let e of getOneFreeList){	 	
							console.log('Product: %j, Quantity: %j', e.product, e.savingQuant);
						}

				}		
				// 输出账单总额			
						console.log('--------------------------'); 
						console.log('Cost in total:', inTotal);

				//  输出折扣信息
				if (savingMount != 0){		
						console.log('Discount in total:', savingMount);
				}

		})(billList);

	}
});

//  处理传进来的JSON数据，生成购物车列表

function  getDataReady(item,cb){

	  var   itemID = getAndChecItemId(item);
	  var   itemQuantity =  getQuantity(item);
	  var   itemInfo = getInfoFromDB(itemID,itemQuantity);

	  		newBillItem(itemInfo) ; 
	  		cb();
 } 

 
// 从数据库里检索相应的信息
function getInfoFromDB(id, Quantity){

		let  found =0 

			for (let  info of productStock) { 
				
				if (id === info.id) {

				let  bill = {
		      			 'product': info.product , 
				       'quantity':Quantity,
				       'price':info.price,
				       'discount' : info.discount ,
				       'getOneFree':info.getOneFree,
				       'id':id
				       }			
				found =1;

				return bill;
			
	 			}	 			 
		 	}

		 if (found ===0)

		 return 	new Error('Cannot find item in database');

} 
 
//  输出无折扣的项目
function getSum(product,quantity,price,cb){
		
		let Sum   = price*quantity;
		inTotal    = Sum +inTotal;
		 cb = { product,quantity,price,Sum};
		console.log(JSON.stringify(cb));
}

//  输出折扣项目
function getDiscount(product, price,quantity,discount, cb){
	
	let Sum     = price*quantity*discount ;
	let Saving = price*quantity - Sum ;

	 savingMount = savingMount + Saving;
	 inTotal            = Sum +inTotal;

	 // return
	   cb ={ product,quantity,price,Sum,Saving};
	  console.log(JSON.stringify(cb));
 
}
//  输出买x送1的项目
function getOneFree(product,price,quantity,freeQuantity, cb){
		
		let   Sum = 0;
		let   Saving = 0;
		let   savingQuant = Math.floor(Number(quantity) /(Number(freeQuantity)+1));
		let   singleProducts =  Number(quantity) %(Number(freeQuantity)+1);
		 
		let   list = {product, savingQuant};
		
		 getOneFreeList.push(list);

		 Sum = Number(price)*Number(freeQuantity)*savingQuant+ singleProducts*Number(price);
		 Saving  = quantity*price -Sum;
		 
		   
   		 savingMount = savingMount + Saving;
		 inTotal = Sum +inTotal; 	
		 
		// return 
		cb ={ product,quantity,price,Sum};
		console.log(JSON.stringify(cb));
}

//判断条形码中是否带有数量
function getQuantity(itemCode){	
		return  itemCode= itemCode.includes('-',9) ? itemCode.slice(11) : 1 ;	 
}

//检查条形码格式 返回符合要求的条形码
function getAndChecItemId(itemCode)  {
 
	  	  let reg = /^ITEM\d{6}/;   
	　　 let res = reg.test(itemCode);   
		   if (res){
		   		itemCode = itemCode.substr(0,10);
		   		return itemCode;
		   } else {
		   		 return new Error('This barcode format is not correct, please check !');
		   }

} 
			   
// 增加购物车里的数量
function newBillItem (bill){
	
		let exist = 0;

		 for(let  i of billList ){
			if ( i.id  === bill.id){
				 i.quantity=  i.quantity+ bill.quantity;
				 exist =1;
			     }		
			}	
			if (exist===0){
			       billList.push(bill);
			 }	   
		   console.log('handling item:',bill.id); 	 
}       
 
  

 