public with sharing class SF_ObjectFieldController {
    
    
    @AuraEnabled(cacheable=true)
    public static LookupFieldResult getLookupFieldDetails(String objAPIName, String objFieldAPIName){
        LookupFieldResult returnWrapper = new LookupFieldResult();
        try {
            Schema.DescribeFieldResult objectField = Schema.getGlobalDescribe().get(objAPIName).getDescribe().fields.getMap().get(objFieldAPIName).getDescribe();
            List<Schema.sObjectType> references = objectField.getReferenceTo();
            returnWrapper.objectreferences = new List<LookupSobject>();
            for(Schema.SObjectType ref : references){
                Schema.DescribeSObjectResult refObj = ref.getDescribe();
                if(refObj.isAccessible()){
                    LookupSobject obj = new LookupSobject();
                    obj.objectName = refObj.getLabel();
                    obj.objectAPIName = refObj.getName();
                    obj.objectPluralName = refObj.getLabelPlural();
                    returnWrapper.objectreferences.add(obj);
                }
                
            }
            returnWrapper.objectreferences.sort();
            returnWrapper.isSuccess=true;
            returnWrapper.objectAPIName = objAPIName;
            returnWrapper.objectFieldAPIName = objFieldAPIName;
            
            
        } catch (Exception e) {
            
            returnWrapper.isSuccess=false;
            returnWrapper.message = e.getMessage();
        }
        return returnWrapper;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static LookupDataResult getLookupResult(String objAPIName, String inputString, List<String> fieldList, String soqlWhereClause){
        LookupDataResult returnWrapper = new LookupDataResult();
        try {
            if(String.isBlank(objAPIName)){
                returnWrapper.isSuccess=false;
                returnWrapper.message = 'Object Api is missing !';
                return returnWrapper;
            }
            if(String.isBlank(inputString)){
                returnWrapper.isSuccess=false;
                returnWrapper.message = 'Search string is empty !';
                return returnWrapper;
            }
                String searchquery='FIND \''+inputString+'\''; 
                switch on objAPIName{                    
                    when 'Group-PG'{

                        if(String.isBlank(soqlWhereClause)){
                            searchquery+= ' RETURNING Group('+String.join(fieldList,',')+' WHERE Type=\'Regular\' ) LIMIT 10';
                        }else{
                            searchquery+= ' RETURNING Group('+String.join(fieldList,',')+' WHERE Type=\'Regular\' AND '+soqlWhereClause+' ) LIMIT 10';
                        }
                        
                    }
                    when 'Group-Q'{
                        if(String.isBlank(soqlWhereClause)){
                            searchquery+= ' RETURNING Group('+String.join(fieldList,',')+' WHERE Type=\'Queue\' ) LIMIT 10';
                        }else{
                            searchquery+= ' RETURNING Group('+String.join(fieldList,',')+' WHERE Type=\'Queue\' AND '+soqlWhereClause+' ) LIMIT 10';
                        }
                    }
                    when else{
                        if(String.isBlank(soqlWhereClause)){
                            searchquery+= ' IN NAME FIELDS RETURNING '+ objAPIName + '('+String.join(fieldList,',')+'  ORDER BY Name) LIMIT 10';
                        }else{
                            searchquery+= ' IN NAME FIELDS RETURNING '+ objAPIName + '('+String.join(fieldList,',')+' WHERE '+soqlWhereClause+' ORDER BY Name) LIMIT 10';
                        }
                    }
                }
                
                System.debug(searchquery);
                List<List<SObject>> searchList =search.query(searchquery);
                
                if(!searchList.isEmpty()){
                    returnWrapper.isSuccess=true;
                    returnWrapper.lookupDataList = searchList[0];
                    
                }else{
                    returnWrapper.isSuccess=false;
                    returnWrapper.message = 'No data found !';
                }
                
            
            
            
        } catch (Exception e) {
            returnWrapper.isSuccess=false;
            returnWrapper.message = e.getMessage();
        }
        return returnWrapper;
    }
    
    public class LookupDataResult{
        @AuraEnabled
        public Boolean isSuccess{get;set;}
        @AuraEnabled
        public String message{get;set;}
        @AuraEnabled
        public String objectAPIName{get;set;}
        @AuraEnabled
        public List<SObject> lookupDataList{get;set;}
    }
    
    public class LookupFieldResult{
        @AuraEnabled
        public Boolean isSuccess{get;set;}
        @AuraEnabled
        public String message{get;set;}
        @AuraEnabled
        public String objectAPIName{get;set;}
        @AuraEnabled
        public String objectFieldAPIName{get;set;}
        @AuraEnabled
        public List<LookupSobject> objectreferences{get;set;}
        
        
    }
    
    public class LookupSobject implements Comparable{
        @AuraEnabled
        public String objectName{get;set;}
        @AuraEnabled
        public String objectAPIName{get;set;}
        @AuraEnabled
        public String objectPluralName{get;set;}
        
        public Integer compareTo(Object compareTo) {
            LookupSobject compareToLookup = (LookupSobject)compareTo;
            return objectName.compareTo(compareToLookup.objectName);       
        }
    }
    
    
}