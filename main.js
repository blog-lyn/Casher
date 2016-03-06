//var config = require('./config') ;
//var fs = require('fs');

"use strict";

var  shoppinglist    =  require('./shoppinglist.json')
var  productStock    =  require('./database.json')

// 可以进一步重构 把方法封装到放到下面三个对象当中（billListt，receiptList）
// 需要进一步重构 增加对参数的校验 以及增加捕捉错误的机制

var  billList = [ ];
var  receiptList =[ ];
var  getOneFreeList = [ ] ;


var  savingMount = 0;
var  inTotal = 0;

 
var step1 = (function getDataReady(list) {

	for(let item of list){

		var itemQuantity =  getQuantity(item);	
		var itemID            =  getItemId(item);

		let itemInfo = getInfoFromDB(itemID,itemQuantity);

		newBillItem(itemInfo) ;
				       
	   }
})(shoppinglist);

 


var  step2 = (function generateReceipt(data){

	savingMount =  0;
	inTotal  =  0;
	let  line  = {};


	console.log('*** Shopping  Receipt ***' );
	console.log('--------------------------'); 

	for(let ele of data){
		
		if (ele.getOneFree!=0){
			  

			console.log(JSON.stringify(getOneFree(ele.product, ele.price,ele.quantity,ele.getOneFree)));

			
		} else if (ele.discount != 1){			
			console.log(JSON.stringify(getDiscount(ele.product, ele.price,ele.quantity, ele.discount)));			

		} else  {

			
			ele.Sum = ele.price*ele.quantity
			inTotal         = ele.Sum +inTotal;
			line ={
				"Product":ele.product ,
				"Quantity":ele.quantity,
				"Price": ele.price, 
				"Sum":ele.Sum}


			console.log(JSON.stringify(line));

	

		}

	}


		if (getOneFreeList.length>1){

		console.log('--------------------------'); 
		console.log('Buy X Get X For Free Products:');

			for (let e of getOneFreeList){	 
				
				console.log('Product: %j, Quantity: %j', e.product, e.savingQuant);
			}

		}
		
		console.log('--------------------------'); 
		console.log('Cost in total:', inTotal);
		if (savingMount != 0){			
		console.log('Discount in total:', savingMount);
		}

})(billList);



function getInfoFromDB(id,Quantity){

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

		 return 	new Error('Cannot find item in database')

} 
 



function getDiscount(product, price,quantity,discount, cb){
	
	let Sum     = price*quantity*discount ;
	let Saving = price*quantity - Sum ;

	 savingMount = savingMount + Saving;
	 inTotal           = Sum +inTotal;

	  return cb ={ product,quantity,price,Sum,Saving};
 
}

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
		 
		 return cb ={ product,quantity,price,Sum};

}

function getQuantity(itemCode){	
	return  itemCode= itemCode.includes('-',9) ? itemCode.slice(11) : 1 ;	 
}

function getItemId(itemCode){	
	return  itemCode= itemCode.substr(0,10);	 
}

function newBillItem(bill){
	
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
 
  

function setDiscount( ) {
}
  
function setGetOneFree(item, setNumber) { 
}