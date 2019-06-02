'use strict';
const _ = require("lodash");
const SortedArray= require("sorted-array");
const arraySort = require('array-sort');
const moment=require('moment')

class vehiclehandler{
    constructor(data,db){
        this.data=data;
        this.db=db;
    }

    async fetch_current_space(myId){
        let command = "select space_data from space where space_id=$1";
        let values = [myId];
        let result;
        await this.db
            .one(command,values)
            .then(data => {
                result= data;
            })
            .catch(error => (console.log("ERROR:", error),result="On getting "+values+" we get error: "+error.detail));
        return result;
    }
    async load(val=0){
        this.type=this.data.vehicle_type;
        this.name=this.data.org_ID;
        let myId=this.name+this.type;
        
        let db=this.db;
        
        //retrieve current space Data
        let result= await this.fetch_current_space(myId);

        this.rawData=result.space_data;
        this.id=this.rawData.id;
        this.allocated_array=new SortedArray(this.rawData.allocated_array.array);
        this.unallocated_array=this.rawData.unallocated_array;
        

        await this.allocate();
        
        this.rawData.allocated_array=this.allocated_array;
        this.rawData.unallocated_array=this.unallocated_array;
        
        console.log(this.rawData);
        console.log(this.vehicle_pos);
        
        let command="Update space set space_data=$2 where space_id=$1";
        let values=[myId,this.rawData];
        
        await db
            .none(command,values)
            .then(data=>{
                result="successfully Updated";
            })
            .catch(error=>(console.log("ERROR:", error),result="On inserting "+values+" we get error: "+error.detail))
        
        //console.log(result);
        return this.vehicle_pos;
    }
    isfull(){
        if(this.rawData.Acount==this.rawData.Tcount){
            return true;
        }
        return false;
    }
    status(){
        console.log("\nStatus:\n")
        console.log(this.unallocated_array);
        console.log(this.allocated_array);
    }

    async deload(){
        let command="select time_val,vehicle_data from user_table where vehicle_no=$1"
        let values=[this.data.vehicle_no];
        this.user_data='';

        await this.db
            .one(command,values)
            .then(data=>{
                this.user_data=data;
            })
            .catch(error=>(console.log("ERROR:", error)));//,result="On inserting "+values+" we get error: "+error.detail))
        
        this.myId=this.user_data.vehicle_data.org_ID+this.user_data.vehicle_data.vehicle_type;
        
        let result= await this.fetch_current_space(this.myId);
        console.log(result);

        this.rawData=result.space_data;
        this.id=this.rawData.id;
        this.allocated_array=new SortedArray(this.rawData.allocated_array.array);
        this.unallocated_array=this.rawData.unallocated_array;

        let cost=this.calcPrice();
        await this.deallocate();
        
        this.rawData.allocated_array=this.allocated_array;
        
        console.log(this.rawData);
        
        await this.removeUserData();
        await this.updateSpace();
        return cost;
    }
    deallocate(){
        this.allocated_array.remove(this.user_data.vehicle_data.vehicle_pos);
        this.unallocated_array.unshift(this.user_data.vehicle_data.vehicle_pos);
        //console.log("allocated at position ",this.vehicle_pos);
        this.rawData.unallocated_array=arraySort(this.unallocated_array,['f_id','disLen','dist','pos']);
        console.log("capacity remaining: "+this.unallocated_array.length);
        this.rawData.UACount+=1;
        this.rawData.Acount-=1;
    }

    async removeUserData(){
        let command="DELETE from user_table where vehicle_no=$1";
        let values=[this.data.vehicle_no];
        await this.db
            .none(command,values)
            .then(data=>{
                console.log("Deleted user successfully after deallocation")
            })
            .catch(error=>(console.log("ERROR in deleting user in dealloc:", error)));//,result="On inserting "+values+" we get error: "+error.detail))

    }
    async calcPrice(){
        let t1=this.user_data.time_val;
        let t2=moment.duration(moment().diff(t1))._data;
        let hours=Math.ceil(t2.minutes/60)+t2.hours+t2.days*24+t2.months*31*24+t2.years*366*24;
        console.log(t1,t2,hours);
        let cost=this.rawData.price.h0+(this.rawData.price.step*(hours-1));
        return cost;
    }

    async updateSpace(){
        let command="update space set space_data =$2 where space_id=$1";
        let values=[this.myId,this.rawData];
        await this.db
            .none(command,values)
            .then(data=>{
                console.log("Updated space successfully after deallocation")
            })
            .catch(error=>(console.log("ERROR in update space in dealloc:", error)));//,result="On inserting "+values+" we get error: "+error.detail))
    }

    allocate(){
        if(!this.isfull() && this.unallocated_array.length>=1){
            this.allocated_array.insert(this.unallocated_array[0]);
            this.vehicle_pos=this.unallocated_array.shift();
            console.log("allocated at position ",this.vehicle_pos);
            console.log("capacity remaining: "+this.unallocated_array.length);
            this.rawData.UACount-=1;
            this.rawData.Acount+=1;
        }
        else{
            this.vehicle_pos={ f_id: 0, dist: 0, pos: 0 ,disLen:0};
        }
    }
}
module.exports=vehiclehandler;