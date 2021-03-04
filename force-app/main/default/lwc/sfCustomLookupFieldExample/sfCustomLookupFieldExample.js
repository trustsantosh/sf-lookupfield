import { LightningElement, track, wire } from 'lwc';
import USERID from '@salesforce/user/Id';
import NAME_FIELD from '@salesforce/schema/User.Name';
import { getRecord, getFieldValue  } from 'lightning/uiRecordApi';

export default class SfCustomLookupFieldExample extends LightningElement {
    @track userId;
    @track fieldList = ['Name','Username','IsActive'];

    @wire(getRecord, { recordId: USERID, fields: [NAME_FIELD] })
    user;

    get userName(){
        return getFieldValue(this.user.data, NAME_FIELD);
    }



    constructor(){
        super();
        this.userId = USERID;
        //this.userName = USERNAME;
    }
    
}