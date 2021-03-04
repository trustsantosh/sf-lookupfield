import { LightningElement, api, track, wire } from "lwc";
import getLookupFieldDetails from "@salesforce/apex/SF_ObjectFieldController.getLookupFieldDetails";
import getLookupData from "@salesforce/apex/SF_ObjectFieldController.getLookupResult";

export default class SfCustomLookupField extends LightningElement {
  @api objectApiName;
  @api objectFieldApiName;
  @api fieldLabel;
  @api fieldValueRecordId;
  @api fieldValueRecordName;
  @api isReadonly = false;
  @api isRequired = false;
  @api fieldHelpText;
  @api lookupFilter;
  @api fieldList = [];

  @track fieldPlaceHolder;
  @track objectList = [];
  @track initalObjectSelected;
  @track showMultipleObject = false;
  @track lookupResults = [];
  @track isCase;
  @track lookupValueSelected = false;
  @track selectedValue = {};

  lookupDetails;
  selectedLookupObjectAPIName;

  @wire(getLookupFieldDetails, {
    objAPIName: "$objectApiName",
    objFieldAPIName: "$objectFieldApiName"
  })
  wiredLookupDetails({ error, data }) {
    if (data) {
      if (data.isSuccess) {
        if (
          data.objectAPIName === "Task" &&
          data.objectFieldAPIName === "OwnerId"
        ) {
          this.showMultipleObject = true;
          this.objectList.push({ label: "Users", value: "User" });
          this.objectList.push({ label: "Groups", value: "Group-PG" });
          this.objectList.push({ label: "Queues", value: "Group-Q" });
          this.initalObjectSelected = this.objectList[0].value;
          this.fieldPlaceHolder = "Search " + this.objectList[0].label + "...";
          this.selectedLookupObjectAPIName = this.objectList[0].value;
        } else {
          if (data.objectreferences.length > 1) {
            this.showMultipleObject = true;
            this.initalObjectSelected = data.objectreferences[0].objectAPIName;
            this.fieldPlaceHolder =
              "Search " + data.objectreferences[0].objectPluralName + "...";
            this.selectedLookupObjectAPIName =
              data.objectreferences[0].objectAPIName;
            data.objectreferences.forEach((entry) => {
              this.objectList.push({
                label: entry.objectPluralName,
                value: entry.objectAPIName
              });
            });
          } else {
            this.showMultipleObject = false;
            this.fieldPlaceHolder =
              "Search " + data.objectreferences[0].objectPluralName + "...";
            this.selectedLookupObjectAPIName =
              data.objectreferences[0].objectAPIName;
          }
          this.isCase =
            this.selectedLookupObjectAPIName === "Case" ? true : false;
        }
      } else {
        console.log("Something really gone bad !!");
      }
    } else if (error) {
      debugger;
      console.log("TODO list");
    }
  }


  handleDropDownChange(event) {
    this.selectedValue = {};
    this.lookupValueSelected = false;
    this.lookupResults = [];
    this.objectList.forEach((entry) => {
      if (entry.value === event.detail.value) {
        this.fieldPlaceHolder = "Search " + entry.label + "...";
        this.selectedLookupObjectAPIName = entry.value;
        this.isCase = event.detail.value === "Case" ? true : false;
      }
    });
  }

  handleInputChange(event) {
    this.lookupResults = [];
    let inpString = event.detail.value;
    if (inpString.length < 3) {
      let inputCmp = this.template.querySelector(".lookupInput");
      inputCmp.setCustomValidity("Enter 3 characters atleast to search");
      // inputCmp.reportValidity();
    } else {
      getLookupData({
        objAPIName: this.selectedLookupObjectAPIName,
        inputString: inpString,
        fieldList: this.fieldList,
        soqlWhereClause: this.lookupFilter
      })
        .then((result) => {
          if (result.isSuccess) {
            if (
              Array.isArray(result.lookupDataList) &&
              result.lookupDataList.length > 0
            ) {
              //this.lookupResults = result.lookupDataList;
              let lookupResults=[];
              result.lookupDataList.forEach((record) => {
                let recordDetail = [];
                this.fieldList.forEach((field) => {
                  if (record[field]){
                    recordDetail.push({
                      fieldName: field,
                      fieldValue: record[field]
                    });
                  }else{
                    if(record[field]===false){
                      recordDetail.push({
                        fieldName: field,
                        fieldValue: false
                      });
                    }else{
                      recordDetail.push({
                        fieldName: field,
                        fieldValue: ''
                      });
                    }
                      
                  }
                   
                });

                lookupResults.push({
                  Id: record.Id,
                  Name: this.selectedLookupObjectAPIName == 'Case' ? record.Subject:record.Name,
                  fieldValues: recordDetail
                });
              });
              this.lookupResults = lookupResults;
              let inputCmp = this.template.querySelector(".lookupInput");
              inputCmp.setCustomValidity("");
              inputCmp.reportValidity();
            } else {
              let inputCmp = this.template.querySelector(".lookupInput");
              inputCmp.setCustomValidity("No records found.");
              inputCmp.reportValidity();
            }
          }
        })
        .catch((error) => {
          //Not needed as it is based on search results
        });
    }
  }

  get hasLookupResult() {
    return this.lookupResults.length > 0 ? true : false;
  }

  @api get lookupValue() {
    return this.selectedValue.recordId;
  }

  @api checkInputValidity() {
    if (this.isRequired) {
      if (this.selectedValue) {
        if (this.selectedValue.recordId) {
          return true;
        } else {
          let inputCmp = this.template.querySelector(".lookupInput");
          inputCmp.setCustomValidity("This value is required.");
          inputCmp.reportValidity();
          return false;
        }
      } else {
        let inputCmp = this.template.querySelector(".lookupInput");
        inputCmp.setCustomValidity("This value is required.");
        inputCmp.reportValidity();
        return false;
      }
    }
    return true;
  }

  handleLookupSelection(event) {
    this.selectedValue = {
      recordId: event.currentTarget.dataset.recordId,
      recordName: event.currentTarget.dataset.recordName
    };
    this.lookupValueSelected = true;
  }

  handleClearLookup(event) {
    this.objectList.forEach((entry) => {
      if (entry.value === this.initalObjectSelected) {
        this.fieldPlaceHolder = "Search " + entry.label + "...";
        this.selectedLookupObjectAPIName = entry.value;
        this.isCase = event.detail.value === "Case" ? true : false;
      }
    });
    this.selectedValue = {};
    this.lookupValueSelected = false;
    this.lookupResults = [];
  }

  //public method to refresh the Component
  @api refreshComponent() {
    if (this.fieldValueRecordId) {
      this.selectedValue = {
        recordId: this.fieldValueRecordId,
        recordName: this.fieldValueRecordName
      };
      this.lookupValueSelected = true;
    }
  }

  constructor() {
    super();
    setTimeout(() => {
      if (this.fieldValueRecordId) {
        this.selectedValue = {
          recordId: this.fieldValueRecordId,
          recordName: this.fieldValueRecordName
        };
        this.lookupValueSelected = true;
      }
    }, 1000);
  }
}
